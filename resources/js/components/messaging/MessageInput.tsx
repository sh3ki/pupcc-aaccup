import { useState } from 'react';
import { Send } from 'lucide-react';

export default function MessageInput({ onSend }: { onSend: (text: string) => Promise<void> | void }) {
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);

    const send = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim() || busy) return;
        setBusy(true);
        try {
            await onSend(text.trim());
            setText('');
        } finally {
            setBusy(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="border-t border-gray-200 bg-white p-2 px-4">
            <form onSubmit={send} className="flex items-end gap-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors duration-200 bg-gray-50/50"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                    disabled={busy}
                />
                <button
                    type="submit"
                    disabled={!text.trim() || busy}
                    className="inline-flex items-center justify-center w-15 h-11 rounded-lg bg-[#7F0404] text-white hover:bg-[#4D1414] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    {busy ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                    ) : (
                        <Send size={16} />
                    )}
                </button>
            </form>
            <div className="flex items-center justify-between mt-1 px-1">
                <p className="text-xs text-gray-500">Press Enter to send, Shift+Enter for new line</p>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Online
                    </span>
                </div>
            </div>
        </div>
    );
}
