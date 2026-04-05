
import React, { useState, useRef, useEffect } from 'react';
import { Coach, Message, MessageSender, Quote, QuoteStatus } from '../types';
import { useAppContext } from '../context/AppContext';

const QuoteCard: React.FC<{ message: Message; onRespond: (status: QuoteStatus) => void }> = ({ message, onRespond }) => {
    const { quote } = message;
    const { language, translations } = useAppContext();
    const t = translations[language];
    if (!quote) return null;

    const isPending = quote.status === QuoteStatus.PENDING;

    return (
        <div className="bg-white/90 backdrop-blur dark:bg-dark-card border border-brand-green/30 rounded-3xl p-5 my-2 max-w-xs shadow-lg">
            <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-lg text-brand-green-dark dark:text-brand-green">{t.serviceQuote}</h3>
                 <span className="text-2xl">🧾</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 my-2 text-sm font-medium">{quote.service}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white my-3">${quote.amount.toFixed(2)}</p>
            {isPending ? (
                <div className="flex gap-3 mt-4">
                    <button onClick={() => onRespond(QuoteStatus.ACCEPTED)} className="flex-1 bg-brand-green text-white px-4 py-3 rounded-xl font-bold text-sm hover:shadow-glow transition-all transform hover:-translate-y-0.5">{t.accept}</button>
                    <button onClick={() => onRespond(QuoteStatus.DECLINED)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-3 rounded-xl font-bold text-sm hover:bg-red-100 hover:text-red-500 transition-colors">{t.decline}</button>
                </div>
            ) : (
                <div className={`mt-4 py-2 px-4 rounded-xl font-bold text-center border ${quote.status === QuoteStatus.ACCEPTED ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    Quote {quote.status}
                </div>
            )}
        </div>
    );
};


export const ChatView: React.FC<{ coach: Partial<Coach>; onBack: () => void; isAiOnly?: boolean }> = ({ coach, onBack, isAiOnly }) => {
    const { updateQuoteStatus, showToast, language, showNotification, translations, getAIResponse } = useAppContext();
    const t = translations[language];
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: MessageSender.COACH, text: `Hello! I'm ${coach.name}. How can I help you achieve your health goals today?`, timestamp: new Date().toISOString() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (input.trim() === '') return;
        
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            sender: MessageSender.USER,
            text: input,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        const userQuery = input;
        setInput('');

        setIsTyping(true);
        if (isAiOnly || coach.id === 'ny11-ai') {
            try {
                const aiResponseText = await getAIResponse(userQuery);
                const aiResponse: Message = {
                    id: `ai-${Date.now()}`,
                    sender: MessageSender.COACH,
                    text: aiResponseText,
                    timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, aiResponse]);
            } catch (error) {
                console.error("Error getting AI response", error);
            } finally {
                setIsTyping(false);
            }
        } else {
            setTimeout(() => {
                const coachResponseText = "Based on your goals, I recommend a personalized nutrition and workout plan. I can create one for you. Here is the quote.";
                const coachResponse: Message = {
                    id: `coach-${Date.now()}`,
                    sender: MessageSender.COACH,
                    text: coachResponseText,
                    timestamp: new Date().toISOString(),
                };
                
                const quoteMessage: Message = {
                    id: `quote-${Date.now()}`,
                    sender: MessageSender.COACH,
                    timestamp: new Date().toISOString(),
                    quote: {
                        amount: 99.99,
                        service: "1-Month Personalized Plan",
                        status: QuoteStatus.PENDING,
                    }
                };
                setMessages(prev => [...prev, coachResponse, quoteMessage]);
                showNotification({
                    title: t.newMessageFrom.replace('{name}', coach.name || ''),
                    body: coachResponseText,
                    icon: (coach.name || '').charAt(0)
                });
                setIsTyping(false);
            }, 1500);
        }
    };

    const handleQuoteResponse = (messageId: string, status: QuoteStatus) => {
        // Only relevant for real coaches
        if (isAiOnly) return;
        // @ts-ignore
        updateQuoteStatus(messageId, status, messages, setMessages);
        if (status === QuoteStatus.ACCEPTED) {
            showToast('Quote accepted! Check your dashboard for the new plan soon.', 'success');
        } else {
            showToast('You have declined the quote.', 'error');
        }
    };

    return (
        <div 
            className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-bg rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative"
            onMouseDown={(e) => e.stopPropagation()}
        >
            <header className="flex items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
                <button onClick={onBack} className="mr-4 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition"><i className="ph ph-arrow-left"></i></button>
                <div className="relative">
                    <img src={coach.avatar || 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg'} alt={coach.name} className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                    <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-card"></div>
                </div>
                <div>
                    <h2 className="font-bold text-lg dark:text-white leading-tight">{coach.name}</h2>
                    <p className="text-xs font-bold text-brand-green uppercase tracking-wide">{coach.specialty}</p>
                </div>
            </header>
            
            <main className="flex-1 p-6 overflow-y-auto space-y-6">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] lg:max-w-md px-6 py-4 shadow-sm text-base leading-relaxed ${
                             msg.sender === MessageSender.USER 
                             ? 'bg-gradient-to-br from-brand-green to-brand-green-dark text-white rounded-[20px] rounded-tr-sm' 
                             : msg.sender === MessageSender.SYSTEM 
                                ? 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 w-full text-center rounded-xl text-sm' 
                                : 'bg-white dark:bg-dark-card text-gray-800 dark:text-white rounded-[20px] rounded-tl-sm border border-gray-100 dark:border-gray-800'
                             }`}>
                            {msg.text && <p>{msg.text}</p>}
                            {msg.quote && <QuoteCard message={msg} onRespond={(status) => handleQuoteResponse(msg.id, status)} />}
                         </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-dark-card px-6 py-4 rounded-[20px] rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-800 flex space-x-1 items-center">
                            <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </main>
            
            <footer className="p-4 bg-white dark:bg-dark-card border-t dark:border-gray-800 sticky bottom-0 z-10 flex-shrink-0">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-2 pl-6">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                        placeholder={t.typeAMessage} 
                        disabled={isTyping} 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400"
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isTyping || !input.trim()} 
                        className="ml-2 bg-brand-green text-white rounded-full w-10 h-10 flex items-center justify-center hover:shadow-glow transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    >
                        <i className="ph ph-paper-plane-tilt transform rotate-45 text-sm"></i>
                    </button>
                </div>
            </footer>
        </div>
    );
};

const CoachProfileView: React.FC<{ coach: Coach; onBack: () => void; onStartChat: () => void }> = ({ coach, onBack, onStartChat }) => {
    const { language, translations } = useAppContext();
    const t = translations[language];

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={onBack} className="group flex items-center text-gray-500 font-bold mb-8 hover:text-brand-green transition-colors">
                <span className="w-8 h-8 rounded-full bg-white dark:bg-dark-card flex items-center justify-center shadow-sm mr-2 group-hover:bg-brand-green group-hover:text-white transition-all"><i className="ph ph-arrow-left"></i></span> 
                {t.backToExperts}
            </button>
            
            <div className="glass-card rounded-[3rem] shadow-xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="relative">
                        <img src={coach.avatar} alt={coach.name} className="w-48 h-48 rounded-[2rem] object-cover shadow-2xl" />
                         <div className="absolute -bottom-4 -right-4 bg-white dark:bg-dark-card py-2 px-4 rounded-xl shadow-lg flex flex-col items-center">
                            <span className="font-black text-2xl text-brand-green">{coach.experienceYears}+</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Years</span>
                         </div>
                    </div>
                    
                    <div className="text-center md:text-left flex-1">
                        <span className="inline-block py-1 px-3 rounded-lg bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-wider mb-2">{coach.specialty}</span>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">{coach.name}</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">{coach.bio}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                             <button onClick={onStartChat} className="bg-brand-green text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-glow transition-all transform hover:-translate-y-1 flex items-center justify-center">
                                {t.startChat} <i className="ph ph-chat-circle-dots ml-2"></i>
                            </button>
                            <div className="flex items-center justify-center px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-full">
                                <span className="font-bold text-gray-900 dark:text-white mr-2">{coach.clientsHelped}+</span>
                                <span className="text-sm text-gray-500">{t.clientsHelped}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const CoachCard: React.FC<{ coach: Coach; onClick: () => void }> = ({ coach, onClick }) => {
    const { language, translations } = useAppContext();
    const t = translations[language];

    return (
        <div onClick={onClick} className="group flex-shrink-0 w-72 bg-white dark:bg-dark-card rounded-[2.5rem] shadow-sm hover:shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 border border-transparent hover:border-brand-green/20 cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-brand-green/10 to-transparent"></div>
            
            <div className="relative mb-4 p-1 rounded-full border-2 border-dashed border-brand-green/30 group-hover:border-brand-green transition-colors">
                 <img src={coach.avatar} alt={coach.name} className="w-24 h-24 rounded-full object-cover" />
            </div>
            
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1 group-hover:text-brand-green transition-colors">{coach.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mb-6">{coach.specialty}</p>
            
            <div className="mt-auto w-full">
                <button className="w-full py-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-sm text-gray-600 dark:text-gray-300 group-hover:bg-brand-green group-hover:text-white transition-all">
                    {t.viewProfile}
                </button>
            </div>
        </div>
    )
};

const BannerSlider: React.FC<{images: string[]}> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [images]);

    if (images.length === 0) {
        return <div className="relative w-full h-56 mb-12 rounded-[2rem] overflow-hidden shadow-inner bg-gray-200 dark:bg-dark-card flex items-center justify-center"><p className="text-gray-500">No images available</p></div>;
    }

    return (
        <div className="relative w-full h-64 md:h-80 mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl group" dir="ltr">
            <div
                className="flex transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1) h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((src, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                        <img
                            src={src}
                            alt={`Banner image ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                         <div className="absolute bottom-8 left-8 z-20">
                            <span className="bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">Featured</span>
                            <h2 className="text-3xl font-black text-white italic">Transform Your Life</h2>
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute bottom-6 right-8 z-20 flex space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-500 ${
                            currentIndex === index ? 'bg-brand-green w-8' : 'bg-white/50 hover:bg-white'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};


const ChatPage: React.FC = () => {
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [isChatting, setIsChatting] = useState(false);
    const { language, coaches, currentUser, logout, showToast, bannerImages, translations } = useAppContext();
    const t = translations[language];

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollContainerRef.current) return;
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    };

    const handleMouseLeaveOrUp = () => {
        if (!scrollContainerRef.current) return;
        isDraggingRef.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = x - startXRef.current;
        if (Math.abs(walk) > 3) {
            hasDraggedRef.current = true;
        }
        scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleCoachClick = (coach: Coach) => {
        if (hasDraggedRef.current) {
            return;
        }
        setSelectedCoach(coach);
    };

    const handleStartChat = () => {
        if (currentUser?.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        setIsChatting(true);
    };

    if (isChatting && selectedCoach) {
        return <ChatView coach={selectedCoach} onBack={() => setIsChatting(false)} />;
    }

    if (selectedCoach) {
        return <CoachProfileView coach={selectedCoach} onBack={() => setSelectedCoach(null)} onStartChat={handleStartChat} />;
    }

    return (
        <div className="animate-fade-in pb-12">
            <BannerSlider images={bannerImages} />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 px-2">
                <div>
                     <h1 className="text-4xl font-black italic text-gray-900 dark:text-white">{t.connectWithExpert}</h1>
                     <p className="text-gray-500 mt-2 max-w-lg">{t.connectWithExpertDesc}</p>
                </div>
                <div className="hidden md:block">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Scroll to explore <i className="ph ph-arrow-right inline-block ml-1"></i></span>
                </div>
            </div>
            
            <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
                className="flex overflow-x-auto space-x-6 pb-12 -mx-4 px-4 cursor-grab active:cursor-grabbing scrollbar-hide pt-2"
            >
                {coaches.map(coach => (
                     <CoachCard key={coach.id} coach={coach} onClick={() => handleCoachClick(coach)} />
                ))}
            </div>
            
            <div className="mt-4 bg-brand-green-dark text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h2 className="text-2xl font-black mb-4 relative z-10">{t.whyAnExpert}</h2>
                <p className="text-gray-200 text-lg leading-relaxed relative z-10 max-w-3xl">
                    {t.whyAnExpertDesc}
                </p>
                <div className="mt-8 flex gap-4 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center min-w-[100px]">
                        <span className="block text-2xl mb-1">🎯</span>
                        <span className="text-xs font-bold uppercase">Focus</span>
                    </div>
                     <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center min-w-[100px]">
                        <span className="block text-2xl mb-1">⚡</span>
                        <span className="text-xs font-bold uppercase">Speed</span>
                    </div>
                     <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center min-w-[100px]">
                        <span className="block text-2xl mb-1">🤝</span>
                        <span className="text-xs font-bold uppercase">Support</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
