
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Conversation, PersistentMessage } from '../types';

const ConversationView: React.FC<{ conversation: Conversation; onBack: () => void }> = ({ conversation, onBack }) => {
    const { subscribeToMessages, sendCoachMessage, language, translations, currentUser } = useAppContext();
    const t = translations[language];
    const [messages, setMessages] = useState<PersistentMessage[]>([]);
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsub = subscribeToMessages(conversation.id, (msgs) => setMessages(msgs));
        return () => unsub();
    }, [conversation.id]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        if (!input.trim()) return;
        await sendCoachMessage(conversation.id, input);
        setInput('');
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-lg flex flex-col h-[70vh]">
            <header className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
                <button onClick={onBack} className="md:hidden w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <i className="ph ph-arrow-left"></i>
                </button>
                <img src={conversation.userAvatar || `https://i.pravatar.cc/150?u=${conversation.userId}`} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-bold">{conversation.userName}</p>
                    <p className="text-xs text-gray-500">User</p>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => {
                    const isMine = m.senderRole === 'coach' && m.senderId === currentUser?.id;
                    return (
                        <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${isMine ? 'bg-brand-green text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-sm'}`}>
                                <p className="text-sm">{m.text}</p>
                                <p className="text-[10px] opacity-70 mt-1">{new Date(m.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </main>
            <footer className="p-3 border-t dark:border-gray-700">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-2 pl-5">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && send()}
                        placeholder={t.typeYourReply}
                        className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white"
                    />
                    <button onClick={send} disabled={!input.trim()} className="ml-2 bg-brand-green text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50">
                        <i className="ph ph-paper-plane-tilt transform rotate-45"></i>
                    </button>
                </div>
            </footer>
        </div>
    );
};

const CoachPanel: React.FC = () => {
    const { currentUser, conversations, language, translations, theme, setTheme, logout } = useAppContext();
    const t = translations[language];
    const [selected, setSelected] = useState<Conversation | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 md:p-8">
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black italic text-brand-green">NY11 COACH</h1>
                    <p className="text-sm text-gray-500">{t.welcomeCoach}, {currentUser?.name}</p>
                </div>
                <button onClick={logout} className="bg-red-500 text-white px-5 py-2 rounded-full font-bold text-sm">{t.logout}</button>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <aside className={`md:col-span-1 ${selected ? 'hidden md:block' : ''}`}>
                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm p-4">
                        <h3 className="font-bold mb-3 px-2">{t.coachInbox}</h3>
                        {conversations.length === 0 ? (
                            <p className="text-sm text-gray-500 px-2 py-6 text-center">{t.noConversationsYet}</p>
                        ) : (
                            <div className="space-y-2">
                                {conversations.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelected(c)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition ${selected?.id === c.id ? 'bg-brand-green/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        <img src={c.userAvatar || `https://i.pravatar.cc/150?u=${c.userId}`} className="w-10 h-10 rounded-full" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{c.userName}</p>
                                            <p className="text-xs text-gray-500 truncate">{c.lastMessage || '—'}</p>
                                        </div>
                                        {(c.unreadForCoach || 0) > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {c.unreadForCoach}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                <section className={`md:col-span-2 ${!selected ? 'hidden md:block' : ''}`}>
                    {selected ? (
                        <ConversationView conversation={selected} onBack={() => setSelected(null)} />
                    ) : (
                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
                            <i className="ph ph-chats-circle text-6xl text-brand-green mb-4"></i>
                            <p className="text-gray-500 font-bold">{t.selectAConversation}</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CoachPanel;
