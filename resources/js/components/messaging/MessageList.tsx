import { useEffect, useRef } from 'react';

export interface MessageItem {
    id: string;
    text: string;
    senderId: number;
    senderName?: string;
    sentAt: number; // epoch ms
    seenBy?: Record<string, number>; // userId -> timestamp
}

export default function MessageList({ messages, currentUserId, members = [] }: { messages: MessageItem[]; currentUserId: number; members?: number[] }) {
    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50/30" style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(127, 4, 4, 0.02) 25%), linear-gradient(-45deg, transparent 25%, rgba(127, 4, 4, 0.02) 25%)', backgroundSize: '40px 40px' }}>
            <div className="p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-200">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">No messages yet</h4>
                        <p className="text-xs text-gray-500">Start the conversation by sending a message</p>
                    </div>
                ) : (
                    messages.map((m) => {
                        const mine = m.senderId === currentUserId;
                        return (
                            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                                    {!mine && (
                                        <div className="text-[11px] text-gray-500 mb-1 px-1 font-medium">
                                            {m.senderName || `User ${m.senderId}`}
                                        </div>
                                    )}
                                    <div className={`rounded-2xl px-4 py-3 shadow-sm border max-w-full ${
                                        mine 
                                            ? 'bg-[#7F0404] text-white border-[#7F0404]/20' 
                                            : 'bg-white text-gray-800 border-gray-200'
                                    }`}>
                                        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">{m.text}</div>
                                        <div className={`mt-2 flex items-center gap-2 text-[10px] ${
                                            mine ? 'text-white/80' : 'text-gray-500'
                                        }`}>
                                            <span>{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {mine && (
                                                <div className="flex items-center gap-1">
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        {members.some((id) => id !== currentUserId && m.seenBy && m.seenBy[id]) ? (
                                                            <>
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                Seen
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                Sent
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div ref={endRef} />
        </div>
    );
}
