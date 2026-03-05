import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '👋 Hi! I\'m your AI Financial Advisor. Ask me anything about your spending, budgets, or savings goals!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const { data } = await api.post('/chat', { message: userMessage });
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply, isAI: data.isAI }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '😅 Sorry, something went wrong. Try again!',
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        try {
            await api.delete('/chat/history');
            setMessages([
                { role: 'assistant', content: '🔄 Chat cleared! How can I help you with your finances?' }
            ]);
        } catch (err) { }
    };

    const quickQuestions = [
        '📊 How am I doing financially?',
        '💡 Tips to save more money?',
        '🍔 Am I spending too much on food?',
        '🎯 Help me create a budget'
    ];

    return (
        <>
            {/* Floating Chat Button */}
            <button
                id="chat-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg transition-all hover:scale-110 active:scale-95"
                style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
                }}
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl fade-in"
                    style={{
                        background: 'rgba(10, 10, 26, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)',
                        maxHeight: '500px'
                    }}>
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center justify-between" style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                        borderBottom: '1px solid rgba(99, 102, 241, 0.15)'
                    }}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                <span className="text-sm">🤖</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Financial Advisor</p>
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                                    <span className="text-xs" style={{ color: '#8888aa' }}>Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={clearHistory} className="text-xs px-2 py-1 rounded-lg transition-colors" style={{ color: '#8888aa' }} title="Clear chat">
                            🗑️
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: '320px' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed" style={{
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : msg.isError
                                            ? 'rgba(244, 63, 94, 0.1)'
                                            : 'rgba(99, 102, 241, 0.08)',
                                    color: msg.role === 'user' ? 'white' : '#e2e8f0',
                                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                    borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px',
                                    border: msg.role === 'user' ? 'none' : '1px solid rgba(99, 102, 241, 0.1)'
                                }}
                                    dangerouslySetInnerHTML={{
                                        __html: msg.content
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/_(.*?)_/g, '<em style="color:#8888aa">$1</em>')
                                            .replace(/\n/g, '<br />')
                                    }}
                                />
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="p-3 rounded-2xl" style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366f1', animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#8b5cf6', animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#a78bfa', animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 1 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                            {quickQuestions.map(q => (
                                <button key={q} onClick={() => { setInput(q); }}
                                    className="text-xs px-2.5 py-1.5 rounded-lg transition-all hover:scale-105" style={{
                                        background: 'rgba(99, 102, 241, 0.08)',
                                        border: '1px solid rgba(99, 102, 241, 0.15)',
                                        color: '#a78bfa'
                                    }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-3 flex gap-2" style={{ borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask about your finances..."
                            className="input-field flex-1 text-sm"
                            style={{ padding: '8px 14px', borderRadius: '12px' }}
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !input.trim()}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
