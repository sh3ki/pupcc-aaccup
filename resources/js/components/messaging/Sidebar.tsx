                                                                                                                                import { useMemo } from 'react';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessages';
import { Users, MessageSquare, Plus, Search } from 'lucide-react'; 

export interface ConversationSummary {
    id: string; // conv id
    type: 'private' | 'group';
    title: string;
    lastMessage?: string;
    updatedAt?: number;
}

export default function MessagingSidebar({
    conversations,
    onSelect,
    onCreatePrivate,
    onCreateGroup,
    selectedId,
    onSearch,
}: {
    conversations: ConversationSummary[];
    onSelect: (id: string) => void;
    onCreatePrivate: () => void;
    onCreateGroup: () => void;
    selectedId?: string | null;
    onSearch: (query: string) => void;
}) {
    const sorted = useMemo(
        () => [...conversations].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
        [conversations]
    );
    const { perConversation } = useUnreadMessagesCount();

    return (
        <aside className="h-full flex flex-col bg-gray-50/50">
            {/* Header */}
            <div className="p-5 pb-2 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 mb-1">
                    <div className="flex-row">
                        <h3 className="text-lg font-semibold text-gray-800">Conversations</h3>
                        <p className="text-sm text-gray-500">Connect with your team</p>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mb-2">
                    <button 
                        onClick={onCreatePrivate} 
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#7F0404] px-3 py-2 text-sm font-medium text-white hover:bg-[#4D1414] transition-colors duration-200 shadow-sm"
                    >
                        <MessageSquare size={16} />
                        New DM
                    </button>
                    <button 
                        onClick={onCreateGroup} 
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 border border-gray-200"
                    >
                        <Users size={16} />
                        <Plus size={14} />
                    </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        placeholder="Search conversations..."
                        className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors duration-200 bg-white"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">No conversations yet</h4>
                        <p className="text-xs text-gray-500">Start a new conversation to get started</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {sorted.map((c) => (
                            <button
                                key={c.id}
                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 mb-1 ${
                                    selectedId === c.id 
                                        ? 'bg-[#7F0404]/10 border border-[#7F0404]/20 shadow-sm' 
                                        : 'hover:bg-white hover:shadow-sm border border-transparent'
                                }`}
                                onClick={() => onSelect(c.id)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`text-sm font-medium truncate ${
                                                selectedId === c.id ? 'text-[#7F0404]' : 'text-gray-800'
                                            }`}>
                                                {c.title}
                                            </h4>
                                            <div className="flex items-center gap-1.5">
                                                {c.type === 'private' ? (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                )}
                                            </div>
                                        </div>
                                        {c.lastMessage && (
                                            <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {perConversation[c.id] > 0 && (
                                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[#7F0404] px-1.5 text-[10px] font-semibold text-white">
                                                {perConversation[c.id] > 99 ? '99+' : perConversation[c.id]}
                                            </span>
                                        )}
                                        {c.updatedAt && (
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
