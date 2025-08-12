import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check, Search, X } from 'lucide-react';

type PickerUser = { id: number; name: string; email?: string; avatar?: string };

export function DirectUserPicker({ open, onOpenChange, onSelect, currentUserId }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (user: PickerUser) => void;
  currentUserId?: number;
}) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PickerUser[]>([]);

  useEffect(() => {
    let ignore = false;
    if (!open) return;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        const data = await res.json();
        const filtered: PickerUser[] = (data || []).filter((u: PickerUser) => !currentUserId || u.id !== currentUserId);
        if (!ignore) setItems(filtered);
      } catch {
        if (!ignore) setItems([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    const t = setTimeout(fetchUsers, 250);
    return () => { ignore = true; clearTimeout(t); };
  }, [q, open, currentUserId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Start a direct message</DialogTitle>
          <DialogDescription className="text-gray-600">Select a team member to start a private conversation.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors duration-200 bg-gray-50/50" 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
          <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg bg-white">
            {loading && (
              <div className="flex items-center justify-center p-6">
                <svg className="w-5 h-5 animate-spin text-[#7F0404]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 font-medium">No users found</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting your search terms</p>
              </div>
            )}
            {items.map((u) => (
              <button 
                key={u.id} 
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left transition-colors duration-200 border-b border-gray-100 last:border-b-0" 
                onClick={() => { onSelect(u); onOpenChange(false); }}
              >
                <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#7F0404] to-[#4D1414] text-white font-semibold">
                    {(u.name || 'U').slice(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{u.name}</div>
                  <div className="text-xs text-gray-500 truncate">{u.email}</div>
                </div>
                <div className="text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}export function GroupPicker({ open, onOpenChange, onCreate, currentUserId }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (title: string, userIds: number[]) => void;
  currentUserId?: number;
}) {
  const [q, setQ] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PickerUser[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!open) return;
    setQ(''); setTitle(''); setItems([]); setSelected({});
  }, [open]);

  useEffect(() => {
    let ignore = false;
    if (!open) return;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        const data = await res.json();
        const filtered: PickerUser[] = (data || []).filter((u: PickerUser) => !currentUserId || u.id !== currentUserId);
        if (!ignore) setItems(filtered);
      } catch {
        if (!ignore) setItems([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    const t = setTimeout(fetchUsers, 250);
    return () => { ignore = true; clearTimeout(t); };
  }, [q, open, currentUserId]);

  const chosenIds = useMemo(() => {
    const ids = Object.keys(selected)
      .filter((k) => selected[parseInt(k)])
      .map((k) => parseInt(k));
    return currentUserId ? ids.filter((id) => id !== currentUserId) : ids;
  }, [selected, currentUserId]);

  const selectedUsers = items.filter(u => selected[u.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Create a group</DialogTitle>
          <DialogDescription className="text-gray-600">Name your group and add members to get started.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group name</label>
            <input 
              placeholder="Enter a name for your group..." 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors duration-200 bg-gray-50/50"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          {/* Selected Members */}
          {selectedUsers.length > 0 && (
            <div className="p-3 bg-[#7F0404]/5 border border-[#7F0404]/20 rounded-lg">
              <p className="text-xs font-medium text-[#7F0404] mb-2">{selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected</p>
              <div className="flex flex-wrap gap-1">
                {selectedUsers.map((user) => (
                  <span key={user.id} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-xs border border-[#7F0404]/30">
                    <span className="text-gray-700">{user.name}</span>
                    <button 
                      onClick={() => setSelected(s => ({ ...s, [user.id]: false }))} 
                      className="text-[#7F0404] hover:text-[#4D1414] transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors duration-200 bg-gray-50/50"
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white">
            {loading && (
              <div className="flex items-center justify-center p-6">
                <svg className="w-5 h-5 animate-spin text-[#7F0404]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 font-medium">No users found</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting your search terms</p>
              </div>
            )}
            {items.map((u) => {
              const isSelected = !!selected[u.id];
              return (
                <label 
                  key={u.id} 
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                    isSelected ? 'bg-[#7F0404]/10 hover:bg-[#7F0404]/15' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#7F0404] focus:ring-[#7F0404]/20 focus:ring-offset-0"
                    checked={isSelected}
                    onChange={(e) => setSelected((s) => ({ ...s, [u.id]: e.target.checked }))}
                  />
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[#7F0404] to-[#4D1414] text-white font-semibold">
                      {(u.name || 'U').slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isSelected ? 'text-[#7F0404]' : 'text-gray-800'}`}>
                      {u.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{u.email}</div>
                  </div>
                  {isSelected && (
                    <div className="text-[#7F0404]">
                      <Check size={16} />
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50">
            Cancel
          </Button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-[#7F0404] hover:bg-[#4D1414] px-6 py-2.5 text-sm font-medium text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={!title.trim() || chosenIds.length === 0}
            onClick={() => { onCreate(title.trim(), chosenIds); onOpenChange(false); }}
          >
            Create Group ({chosenIds.length})
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
