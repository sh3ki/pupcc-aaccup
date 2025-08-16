import { useEffect, useMemo, useState, useCallback } from 'react';
import { ref, onChildAdded, onValue, push, serverTimestamp, update, get } from 'firebase/database';
import { initFirebase } from '@/lib/firebase';
import MessageList, { type MessageItem } from './MessageList';
import MessageInput from './MessageInput';
import MessagingSidebar, { type ConversationSummary } from './Sidebar';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { DirectUserPicker, GroupPicker } from './UserPickerModal';

interface ConversationMeta {
    id: string;
    type: 'private' | 'group';
    title: string;
    members: number[];
    createdAt: number;
    updatedAt: number;
}

export default function MessagingPanel({ currentUser, initialConversationId }: {
    currentUser?: { id: number; name?: string; avatar?: string };
    initialConversationId?: string | null;
}) {
    const page = usePage();
    const fallbackUser = ((page.props as unknown as SharedData).auth?.user ?? null) as unknown as
        | { id: number; name?: string; avatar?: string }
        | null;
    const user = currentUser ?? fallbackUser ?? null;
    const { db } = initFirebase(user ?? undefined);
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [conversations, setConversations] = useState<Record<string, ConversationMeta & { lastMessage?: string }>>({});
    const [openDirect, setOpenDirect] = useState(false);
    const [openGroup, setOpenGroup] = useState(false);
    const [userCache, setUserCache] = useState<Record<number, { name: string; email?: string }>>({});

    // Fetch user information for display names
    const fetchUserInfo = useCallback(async (userId: number) => {
        if (userCache[userId]) return userCache[userId];
        
        try {
            const response = await fetch(`/api/users/search?q=`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const users = await response.json();
            const userInfo = users.find((u: { id: number; name: string; email?: string }) => u.id === userId);
            if (userInfo) {
                setUserCache(prev => ({ ...prev, [userId]: { name: userInfo.name, email: userInfo.email } }));
                return { name: userInfo.name, email: userInfo.email };
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
        return null;
    }, [userCache]);

    // Load conversations list for this user
    useEffect(() => {
        if (!user?.id) return;
    const convRef = ref(db, `userConversations/${user.id}`);
        const off = onValue(convRef, (snap) => {
            const data = (snap.val() || {}) as Record<string, ConversationMeta & { lastMessage?: string }>;
            setConversations(data);
            if (!conversationId) {
                const first = Object.values(data).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];
                if (first) setConversationId(first.id);
            }
        });
        return () => off();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db, user?.id]);

    // Pre-fetch user information for private conversations
    useEffect(() => {
        Object.values(conversations).forEach((conv) => {
            if (conv.type === 'private' && conv.members && user?.id) {
                const otherUserId = conv.members.find(id => id !== user.id);
                if (otherUserId && !userCache[otherUserId]) {
                    fetchUserInfo(otherUserId);
                }
            }
        });
    }, [conversations, user?.id, userCache, fetchUserInfo]);

    // Subscribe to messages in the selected conversation
    useEffect(() => {
        if (!conversationId) {
            setMessages([]); // Clear messages when no conversation is selected
            return;
        }
        
        // Clear messages immediately when conversation changes
        setMessages([]);
        
        const msgsRef = ref(db, `messages/${conversationId}`);
        const collected: MessageItem[] = [];
        const detachAdd = onChildAdded(msgsRef, (snap) => {
            const m = snap.val();
            // Ignore any non-message nodes or malformed entries to prevent 'User undefined' artifacts
            if (!m || typeof m.text !== 'string' || m.text.trim() === '' || typeof m.senderId !== 'number') return;
            collected.push({
                id: snap.key!,
                text: m.text,
                senderId: m.senderId,
                senderName: m.senderName,
                sentAt: m.sentAt ?? Date.now(),
                seenBy: m.seenBy || {},
            });
            setMessages([...collected]);
        });
        const detachVal = onValue(msgsRef, () => {
            // mark seen for current user
            update(msgsRef, {}); // noop to ensure path exists
        });
        return () => {
            detachAdd();
            detachVal();
        };
    }, [db, conversationId]);

    // Mark messages as seen for current user whenever list updates
    useEffect(() => {
    if (!user?.id || !conversationId || messages.length === 0) return;
        const updates: Record<string, unknown> = {};
        messages.forEach((m) => {
        updates[`messages/${conversationId}/${m.id}/seenBy/${user.id}`] = Date.now();
        });
        if (Object.keys(updates).length > 0) {
            update(ref(db), updates).catch(() => {});
        }
    }, [db, conversationId, messages, user?.id]);

    const send = async (text: string) => {
        if (!user?.id || !conversationId) return;
        const msgRef = push(ref(db, `messages/${conversationId}`));
        const meta = conversations[conversationId];
        const payload = {
            text,
            senderId: user.id,
            senderName: user.name || undefined,
            sentAt: Date.now(),
            seenBy: { [user.id]: Date.now() },
        };
        const updates: Record<string, unknown> = {};
        updates[`messages/${conversationId}/${msgRef.key}`] = payload;
        updates[`conversations/${conversationId}/updatedAt`] = serverTimestamp();
        if (meta?.members) {
            meta.members.forEach((uid) => {
                updates[`userConversations/${uid}/${conversationId}/updatedAt`] = serverTimestamp();
                updates[`userConversations/${uid}/${conversationId}/lastMessage`] = text;
            });
        }
        await update(ref(db), updates);
    };

    const uiConversations: ConversationSummary[] = useMemo(() => Object.values(conversations).map((c) => {
        let displayTitle = c.title;
        
        // For private conversations, show the other person's name instead of current user's name
        if (c.type === 'private' && c.members && user?.id) {
            const otherUserId = c.members.find(id => id !== user.id);
            if (otherUserId && userCache[otherUserId]) {
                displayTitle = userCache[otherUserId].name;
            } else if (otherUserId) {
                // Fetch user info if not in cache
                fetchUserInfo(otherUserId);
                displayTitle = 'Loading...';
            }
        }
        
        return {
            id: c.id,
            type: c.type,
            title: displayTitle,
            lastMessage: c.lastMessage,
            updatedAt: c.updatedAt,
        };
    }), [conversations, user?.id, userCache, fetchUserInfo]);

    // Create or get a private conversation between current user and another user ID
    const ensurePrivateConversation = async (otherUserId: number, title?: string) => {
        if (!user?.id) return null;
        const pairKey = [user.id, otherUserId].sort((a, b) => a - b).join('_');
        const pairRef = ref(db, `privatePairs/${pairKey}`);
        const pairSnap = await get(pairRef);
        if (pairSnap.exists()) {
            const id = pairSnap.val().id as string;
            setConversationId(id);
            return id;
        }
        // create new conversation
        const convId = (await push(ref(db, 'conversations'))).key!;
        const meta: ConversationMeta = {
            id: convId,
            type: 'private',
            title: 'Direct Message', // Base title for the conversation
            members: [user.id, otherUserId],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        
        // Create different titles for each user - each sees the other person's name
        const metaForCurrentUser = { ...meta, title: title || 'Direct Message' }; // Current user sees the other person's name
        const metaForOtherUser = { ...meta, title: user.name || 'Direct Message' }; // Other user sees current user's name
        
        const updates: Record<string, unknown> = {};
        updates[`conversations/${convId}`] = meta;
        updates[`userConversations/${user.id}/${convId}`] = metaForCurrentUser;
        updates[`userConversations/${otherUserId}/${convId}`] = metaForOtherUser;
        updates[`privatePairs/${pairKey}`] = { id: convId };
        await update(ref(db), updates);
        setConversationId(convId);
        return convId;
    };

    const createGroupConversation = async (memberIds: number[], title: string) => {
        if (!title.trim() || memberIds.length === 0) return;
    if (!user?.id) return;
    const convId = (await push(ref(db, 'conversations'))).key!;
    const members = Array.from(new Set([user.id, ...memberIds]));
        const meta: ConversationMeta = {
            id: convId,
            type: 'group',
            title,
            members,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        const updates: Record<string, unknown> = {};
        updates[`conversations/${convId}`] = meta;
        members.forEach((uid) => {
            updates[`userConversations/${uid}/${convId}`] = { ...meta };
        });
        await update(ref(db), updates);
        setConversationId(convId);
    };

    const askCreatePrivate = () => setOpenDirect(true);
    const askCreateGroup = () => setOpenGroup(true);

    return (
        <div className="w-full p-6">
            
            {/* Main Messaging Interface */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 150px)' }}>
                <div className="flex h-full">
                    {/* Sidebar */}
                    <div className="hidden md:block w-80 border-r border-gray-200 bg-gray-50/50">
                        <MessagingSidebar
                            conversations={uiConversations}
                            onSelect={(id) => setConversationId(id)}
                            onCreatePrivate={askCreatePrivate}
                            onCreateGroup={askCreateGroup}
                            selectedId={conversationId}
                            onSearch={() => {}}
                        />
                    </div>
                    {/* Conversation area */}
                    <div className="flex-1 flex flex-col bg-white">
                        {/* Conversation Header */}
                        <div className="px-6 py-2 border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {conversationId ? (() => {
                                            const conv = conversations[conversationId];
                                            if (!conv) return 'Conversation';
                                            
                                            // For private conversations, show the other person's name
                                            if (conv.type === 'private' && conv.members && user?.id) {
                                                const otherUserId = conv.members.find(id => id !== user.id);
                                                if (otherUserId && userCache[otherUserId]) {
                                                    return userCache[otherUserId].name;
                                                }
                                                return 'Loading...';
                                            }
                                            
                                            return conv.title;
                                        })() : 'Select a conversation'}
                                    </h2>
                                    {conversationId && (
                                        <p className="text-sm text-gray-500">
                                            {conversations[conversationId]?.members?.length ?? 0} member{(conversations[conversationId]?.members?.length ?? 0) !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                                {conversationId && (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {conversations[conversationId]?.type === 'private' ? 'Direct Message' : 'Group Chat'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Messages Area */}
                        {user?.id ? (
                            <MessageList messages={messages} currentUserId={user.id} members={conversationId ? conversations[conversationId]?.members : []} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500">User not available. Please reload the page.</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Message Input */}
                        <MessageInput onSend={send} />
                    </div>
                </div>
            </div>
            <DirectUserPicker
                open={openDirect}
                onOpenChange={setOpenDirect}
                onSelect={(u) => ensurePrivateConversation(u.id, u.name)}
                currentUserId={user?.id}
            />
            <GroupPicker
                open={openGroup}
                onOpenChange={setOpenGroup}
                onCreate={(title, ids) => createGroupConversation(ids, title)}
                currentUserId={user?.id}
            />
        </div>
    );
}
