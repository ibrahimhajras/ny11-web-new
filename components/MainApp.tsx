
import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import ChatPage, { ChatView } from './Chat';
import Market from './Market';
import Stats from './Stats';
import Settings from './Settings';
import ActiveChats from './ActiveChats';
import OnboardingAndAuth from './OnboardingAndAuth';
import { useAppContext } from '../context/AppContext';
import { TranslationSet } from '../constants';
import { Theme, Language, Notification } from '../types';
import { format } from 'date-fns';

type ActivePage = 'dashboard' | 'chat' | 'activeChats' | 'market' | 'stats' | 'settings';

const Navbar: React.FC<{ activePage: ActivePage; setActivePage: (page: ActivePage) => void; onLoginClick: () => void }> = ({ activePage, setActivePage, onLoginClick }) => {
    const { language, setLanguage, theme, setTheme, currentUser, logout, translations } = useAppContext();
    const t = translations[language];
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleTheme = () => {
        setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    };

    const toggleLanguage = () => {
        setLanguage(language === Language.EN ? Language.AR : Language.EN);
    };

    const navItems = [
        { id: 'dashboard', label: t.home, icon: 'o-home' },
        { id: 'chat', label: t.experts, icon: 'o-user-group' },
        { id: 'market', label: t.market, icon: 'o-shopping-bag' },
        { id: 'stats', label: t.stats, icon: 'o-chart-bar' },
    ] as const;

    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>`;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;

    return (
        <div className="sticky top-4 z-40 px-4 w-full flex justify-center">
            {/* Desktop & Mobile Top Bar */}
            <nav className="glass w-full max-w-6xl rounded-full shadow-glow-sm px-4 md:px-6 py-3 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center">
                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mr-2 rtl:mr-0 rtl:ml-2 active:scale-90 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    <div className="flex items-center cursor-pointer group" onClick={() => setActivePage('dashboard')}>
                        <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center mr-2 rtl:mr-0 rtl:ml-2 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-black italic text-xs">NY</span>
                        </div>
                        <h1 className="text-2xl font-black italic tracking-tighter text-gray-800 dark:text-white group-hover:text-brand-green transition-colors">11</h1>
                    </div>
                </div>
                
                {/* Desktop Nav Items */}
                <div className="hidden md:flex items-center bg-gray-100/50 dark:bg-gray-800/50 rounded-full px-2 py-1 space-x-1 rtl:space-x-reverse">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id as ActivePage)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                                activePage === item.id 
                                ? 'bg-white dark:bg-dark-card text-brand-green shadow-md transform scale-105' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-2 md:space-x-3 rtl:space-x-reverse">
                     <button onClick={toggleTheme} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-green hover:text-white transition-colors duration-300" dangerouslySetInnerHTML={{ __html: theme === 'light' ? moonIcon : sunIcon }} />
                    <button onClick={toggleLanguage} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-brand-green hover:text-white transition-colors duration-300">
                        {language === 'en' ? 'AR' : 'EN'}
                    </button>
                    
                    {currentUser && currentUser.id !== 'guest' ? (
                        <div className="relative group">
                            <button className="flex items-center space-x-2 rtl:space-x-reverse focus:outline-none bg-gray-100 dark:bg-gray-800 pl-1 pr-1 md:pr-3 py-1 rounded-full hover:ring-2 hover:ring-brand-green transition-all">
                                 <img src={currentUser.avatar || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt="User" className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover" />
                                 <i className="o-chevron-down text-[10px] text-gray-500 hidden md:block"></i>
                            </button>
                            <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full pt-2 w-56 hidden group-hover:block animate-fade-in transform origin-top-right z-50">
                                <div className="glass-card rounded-2xl shadow-xl py-2 border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    <div className="px-4 py-2 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{currentUser.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                                    </div>
                                    <button onClick={() => setActivePage('settings')} className="block w-full text-left rtl:text-right px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-brand-green/10 hover:text-brand-green transition-colors">{t.settings}</button>
                                    <button onClick={() => setActivePage('activeChats')} className="block w-full text-left rtl:text-right px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-brand-green/10 hover:text-brand-green transition-colors">{t.activeChats}</button>
                                    <div className="border-t dark:border-gray-700 my-1"></div>
                                    <button onClick={logout} className="block w-full text-left rtl:text-right px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">{t.logout}</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <button onClick={onLoginClick} className="bg-brand-green text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300">
                            {t.login}
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className={`absolute top-0 bottom-0 ${language === 'ar' ? 'right-0' : 'left-0'} w-72 bg-white dark:bg-dark-card shadow-2xl animate-slide-right transform transition-transform`}>
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center mr-2 rtl:mr-0 rtl:ml-2">
                                        <span className="text-white font-black italic text-[10px]">NY</span>
                                    </div>
                                    <h1 className="text-xl font-black italic text-gray-800 dark:text-white">NY11</h1>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 space-y-2">
                                {navItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActivePage(item.id as ActivePage);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold transition-all ${
                                            activePage === item.id
                                            ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <span className="text-xl">
                                            {item.id === 'dashboard' && '🏠'}
                                            {item.id === 'chat' && '👥'}
                                            {item.id === 'market' && '🛒'}
                                            {item.id === 'stats' && '📊'}
                                        </span>
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto pt-6 border-t dark:border-gray-800">
                                {currentUser && currentUser.id !== 'guest' ? (
                                    <button 
                                        onClick={() => {
                                            setActivePage('settings');
                                            setIsSidebarOpen(false);
                                        }}
                                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-600 dark:text-gray-300 font-bold"
                                    >
                                        <img src={currentUser.avatar} className="w-8 h-8 rounded-full border-2 border-brand-green" />
                                        <div className="text-left rtl:text-right">
                                            <p className="text-sm leading-none mb-1">{currentUser.name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">View Profile</p>
                                        </div>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            onLoginClick();
                                            setIsSidebarOpen(false);
                                        }}
                                        className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold"
                                    >
                                        {t.login}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Footer: React.FC = () => {
    const { translations, language } = useAppContext();
    const t = translations[language];

    return (
        <footer className="bg-white dark:bg-dark-card border-t dark:border-gray-800 pt-16 pb-10 mt-20 rounded-t-[3rem]">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center mr-2 rtl:mr-0 rtl:ml-2">
                                <span className="text-white font-black italic text-[10px]">NY</span>
                            </div>
                            <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white">NY11</h2>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t.footerDesc}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-wider">{t.appName}</h3>
                        <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            <li><a href="#" className="hover:text-brand-green transition-colors">{t.home}</a></li>
                            <li><a href="#" className="hover:text-brand-green transition-colors">{t.experts}</a></li>
                            <li><a href="#" className="hover:text-brand-green transition-colors">{t.market}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-wider">{t.about}</h3>
                        <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            <li><a href="#" className="hover:text-brand-green transition-colors">{t.about}</a></li>
                            <li><a href="#" className="hover:text-brand-green transition-colors">{t.contact}</a></li>
                            <li><a href="#" className="hover:text-brand-green transition-colors">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-wider">{t.contact}</h3>
                         <div className="flex space-x-4 rtl:space-x-reverse">
                             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-brand-green hover:text-white transition-all cursor-pointer"><i className="o-camera"></i></div>
                             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-brand-green hover:text-white transition-all cursor-pointer"><i className="o-envelope"></i></div>
                         </div>
                    </div>
                </div>
                <div className="border-t dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>{t.copyright}</p>
                    <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0 font-medium">
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t.privacy}</a>
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t.terms}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const NotificationCard: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
    return (
         <div className="glass-card rounded-2xl shadow-glow-sm p-4 w-full max-sm:mx-4 flex items-start animate-fade-in border border-brand-green/20">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-green-light to-brand-green rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                {notification.icon || 'N'}
            </div>
            <div className="ml-4 flex-1 rtl:mr-4 rtl:ml-0">
                <h4 className="font-bold text-gray-900 dark:text-white">{notification.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-snug">{notification.body}</p>
            </div>
            <button onClick={onDismiss} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rtl:mr-2 rtl:ml-0 bg-gray-100 dark:bg-gray-800 rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

const NotificationContainer: React.FC = () => {
    const { notifications, dismissNotification } = useAppContext();
    return (
        <div className="fixed top-28 right-4 rtl:right-auto rtl:left-4 space-y-3 z-50 w-full max-w-md pointer-events-none flex flex-col items-center sm:items-end">
            <div className="pointer-events-auto w-full flex flex-col gap-3">
                 {notifications.map(notif => (
                    <NotificationCard key={notif.id} notification={notif} onDismiss={() => dismissNotification(notif.id)} />
                ))}
            </div>
        </div>
    );
};

const MainApp: React.FC = () => {
    const [activePage, setActivePage] = useState<ActivePage>('dashboard');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const { currentUser, language, translations, showToast, logout } = useAppContext();
    const t = translations[language];

    useEffect(() => {
        if (currentUser) {
            setShowAuthModal(false);
        }
    }, [currentUser]);

    const handleAIChatToggle = () => {
        if (!currentUser || currentUser.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            setShowAuthModal(true);
            return;
        }
        setIsAIChatOpen(!isAIChatOpen);
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'chat': return <ChatPage />;
            case 'activeChats': return <ActiveChats />;
            case 'market': return <Market />;
            case 'stats': return <Stats />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg font-sans transition-colors duration-500 overflow-x-hidden relative">
             <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-green/10 dark:bg-brand-green/5 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}}></div>
             </div>
             
             <style>
                {`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                    @keyframes slideRight {
                        from { transform: translateX(${language === 'ar' ? '100%' : '-100%'}); }
                        to { transform: translateX(0); }
                    }
                    .animate-slide-right {
                        animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                `}
            </style>
            
            <Navbar activePage={activePage} setActivePage={setActivePage} onLoginClick={() => setShowAuthModal(true)} />
            
            <main className="flex-grow z-10 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
                    {renderPage()}
                </div>
            </main>

            {/* Floating AI Chat Button & Mobile Chat Layer */}
            <div className={`fixed ${isAIChatOpen ? 'inset-0 z-[100]' : `bottom-8 ${language === 'ar' ? 'left-8' : 'right-8'} z-50`} flex flex-col items-end`}>
                {isAIChatOpen && (
                    <div className="w-full h-full md:mb-4 md:w-[400px] md:h-[600px] md:max-w-md md:rounded-[2rem] md:shadow-2xl md:static fixed inset-0 animate-slide-up bg-white dark:bg-dark-bg overflow-hidden flex flex-col">
                        <ChatView 
                            isAiOnly={true} 
                            coach={{ 
                                name: t.aiNutritionist, 
                                specialty: 'Health Expert',
                                avatar: 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg'
                            }} 
                            onBack={() => setIsAIChatOpen(false)} 
                        />
                    </div>
                )}
                
                {!isAIChatOpen && (
                    <div className="flex items-center group">
                        <div className={`hidden md:flex bg-white dark:bg-dark-card border border-brand-green/30 px-4 py-2 rounded-full mr-3 rtl:mr-0 rtl:ml-3 shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-green group-hover:text-white`}>
                            <p className="text-xs font-black tracking-tight uppercase whitespace-nowrap">{t.aiNutritionist}</p>
                        </div>
                        
                        <button 
                            onClick={handleAIChatToggle}
                            className={`w-14 h-14 md:w-16 md:h-16 bg-brand-green text-white rounded-full shadow-glow flex items-center justify-center hover:scale-110 active:scale-90 transition-transform relative`}
                        >
                            <div className="relative">
                                <i className="o-chat-bubble-left-right text-2xl"></i>
                                <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                            </div>
                        </button>
                    </div>
                )}
            </div>
            
            <Footer />
            <NotificationContainer />

            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
                    <div className="relative bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto animate-slide-up border border-white/20">
                         <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 bg-gray-100 dark:bg-gray-800 rounded-full p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <OnboardingAndAuth mode="modal" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainApp;
