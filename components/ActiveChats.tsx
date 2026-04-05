import React, { useState, useRef, useEffect } from 'react';
import { User, Coach, Message, MessageSender, UserRole } from '../types';
import { useAppContext } from '../context/AppContext';

// This is a simplified ChatView for the ActiveChats page.
const ChatView: React.FC<{ recipient: User | Coach; onBack: () => void }> = ({ recipient, onBack }) => {
    const { language, currentUser, translations } = useAppContext();
    const t = translations[language];
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: currentUser?.role === UserRole.USER ? MessageSender.COACH : MessageSender.USER, text: `Hello! This is ${recipient.name}. How can I help you today?`, timestamp: new Date().toISOString() }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (input.trim() === '') return;
        
        const mySenderType = currentUser?.role === UserRole.COACH ? MessageSender.COACH : MessageSender.USER;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            sender: mySenderType,
            text: input,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
        setInput('');

        // Simulate a reply
        setTimeout(() => {
            const replySender = mySenderType === MessageSender.USER ? MessageSender.COACH : MessageSender.USER;
            const replyMessage: Message = {
                 id: `reply-${Date.now()}`,
                 sender: replySender,
                 text: "Thanks for your message. I'll get back to you shortly.",
                 timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, replyMessage]);
        }, 1500);
    };

    const isRecipientCoach = 'specialty' in recipient;
    const mySenderType = currentUser?.role === UserRole.COACH ? MessageSender.COACH : MessageSender.USER;

    return (
        <div 
            className="h-full flex flex-col overflow-y-auto bg-gray-100 dark:bg-dark-bg"
            onMouseDown={(e) => e.stopPropagation()}
        >
            <header className="flex items-center p-4 border-b dark:border-gray-700 bg-white dark:bg-dark-card sticky top-0 z-10 flex-shrink-0">
                <button onClick={onBack} className="mr-4"><i className="ph ph-arrow-left"></i></button>
                <img src={recipient.avatar || `https://i.pravatar.cc/150?u=${recipient.id}`} alt={recipient.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <h2 className="font-bold text-lg dark:text-white">{recipient.name}</h2>
                    {isRecipientCoach && <p className="text-sm text-gray-500 dark:text-gray-400">{(recipient as Coach).specialty}</p>}
                </div>
            </header>
            <main className="flex-1 p-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex mb-4 ${msg.sender === mySenderType ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.sender === mySenderType ? 'bg-brand-green text-brand-green-dark font-semibold rounded-br-none' : 'bg-white dark:bg-dark-card text-gray-800 dark:text-white rounded-bl-none'}`}>
                            {msg.text && <p>{msg.text}</p>}
                         </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 bg-white dark:bg-dark-card border-t dark:border-gray-700 sticky bottom-0 z-10 flex-shrink-0">
                <div className="flex items-center">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={t.typeAMessage} className="flex-1 p-3 rounded-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                    <button onClick={handleSend} className="ml-3 bg-brand-green text-brand-green-dark rounded-full w-12 h-12 flex items-center justify-center hover:opacity-90 transition"><i className="ph ph-paper-plane-tilt transform rotate-45"></i></button>
                </div>
            </footer>
        </div>
    );
};

const ActiveChats: React.FC = () => {
    const { currentUser, users, coaches, language, logout, showToast, translations } = useAppContext();
    const t = translations[language];
    const [selectedRecipient, setSelectedRecipient] = useState<User | Coach | null>(null);

    const handleRecipientClick = (person: User | Coach) => {
        if (currentUser?.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        setSelectedRecipient(person);
    };

    if (selectedRecipient) {
        return <ChatView recipient={selectedRecipient} onBack={() => setSelectedRecipient(null)} />;
    }

    const chatList = currentUser?.role === UserRole.COACH
        ? users.filter(u => u.role === UserRole.USER)
        : coaches;

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.yourActiveChats}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">{t.selectAChat}</p>
            
            <div className="space-y-3">
                {chatList.map(person => (
                    <button 
                        key={person.id} 
                        onClick={() => handleRecipientClick(person)}
                        className="w-full text-left flex items-center p-4 bg-white dark:bg-dark-card rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <img src={person.avatar || `https://i.pravatar.cc/150?u=${person.id}`} alt={person.name} className="w-12 h-12 rounded-full mr-4" />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 dark:text-white">{person.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {currentUser?.role === UserRole.COACH ? 'User' : (person as Coach).specialty}
                            </p>
                        </div>
                        <i className={`ph ph-caret-right text-gray-400 ${language === 'ar' ? 'transform rotate-180' : ''}`}></i>
                    </button>
                ))}
                 {chatList.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No active chats.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveChats;