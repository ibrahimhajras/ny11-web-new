
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import MainApp from './components/MainApp';
import { UserRole } from './types';
import Admin from './components/Admin';
import CustomDialog from './components/CustomDialog';

const AppContent: React.FC = () => {
    const { currentUser, language, theme, isLoading, dialog, dismissDialog } = useAppContext();
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [language, theme]);

    const dialogEl = <CustomDialog dialog={dialog} onClose={dismissDialog} isRTL={language === 'ar'} />;

    // Priority Check: If we are logged in as Admin, skip everything else
    if (currentUser?.role === UserRole.ADMIN) {
        return <>{<Admin />}{dialogEl}</>;
    }

    if (showSplash || isLoading) {
        return <SplashScreen />;
    }

    // Default view for users and guests
    return (
        <>
            <MainApp />
            {dialogEl}
        </>
    );
};

const SplashScreen: React.FC = () => (
    <div className="h-screen w-screen flex items-center justify-center bg-dark-bg">
        <div className="animate-pulse flex flex-col items-center">
            <h1 className="text-8xl font-black italic tracking-tighter text-brand-green">NY11</h1>
            <p className="text-white font-sans tracking-[0.3em] text-sm mt-4 opacity-80 uppercase">Healthy Kitchen</p>
        </div>
    </div>
);


const App: React.FC = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;
