import { useEffect, useMemo, useRef, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { initFirebase } from '@/lib/firebase';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

// Returns total unread messages count across all conversations for the current user.
export function useUnreadMessagesCount() {
  const page = usePage();
  const { auth } = (page.props as unknown as SharedData);
  const user = auth?.user;
  const { db } = initFirebase(user ? { id: user.id, name: user.name, avatar: user.avatar } : undefined);
  const [total, setTotal] = useState(0);
  const perConv = useRef<Record<string, number>>({});
  const detachByConv = useRef<Record<string, () => void>>({});

  useEffect(() => {
    // Cleanup any existing conv listeners when user changes or component unmounts
    return () => {
      Object.values(detachByConv.current).forEach((off) => off());
      detachByConv.current = {};
      perConv.current = {};
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setTotal(0);
      return;
    }
    // Subscribe to the list of conversations for this user
    const convListRef = ref(db, `userConversations/${user.id}`);
    const offConvList = onValue(convListRef, (snap) => {
      const data = (snap.val() || {}) as Record<string, { id: string }>;
      const convIds = Object.keys(data);

      // Detach listeners for removed conversations
      Object.keys(detachByConv.current).forEach((cid) => {
        if (!convIds.includes(cid)) {
          detachByConv.current[cid]?.();
          delete detachByConv.current[cid];
          delete perConv.current[cid];
        }
      });

      // Attach listeners for new conversations
      convIds.forEach((cid) => {
        if (detachByConv.current[cid]) return;
        const msgsRef = ref(db, `messages/${cid}`);
        const off = onValue(msgsRef, (msnap) => {
          let unread = 0;
          msnap.forEach((child) => {
            const m = child.val();
            if (!m) return false;
            const senderId = m.senderId as number | undefined;
            const seenBy = (m.seenBy || {}) as Record<string, number>;
            if (typeof senderId === 'number' && senderId !== user.id) {
              if (!seenBy || !seenBy[user.id]) unread++;
            }
            return false;
          });
          perConv.current[cid] = unread;
          const sum = Object.values(perConv.current).reduce((a, b) => a + b, 0);
          setTotal(sum);
        });
        detachByConv.current[cid] = off;
      });

      // Update total after potential removals
      const sum = Object.values(perConv.current).reduce((a, b) => a + b, 0);
      setTotal(sum);
    });

    return () => {
      offConvList();
      Object.values(detachByConv.current).forEach((off) => off());
      detachByConv.current = {};
      perConv.current = {};
    };
  }, [db, user?.id]);

  return useMemo(() => ({ total, perConversation: { ...perConv.current } }), [total]);
}
