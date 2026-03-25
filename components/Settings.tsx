
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Language, Theme } from '../types';

const Settings: React.FC = () => {
    const { currentUser, language, setLanguage, theme, setTheme, logout, deleteAccount, showNotification, translations } = useAppContext();
    const t = translations[language];

    const handleDeleteAccount = async () => {
        if (window.confirm(t.deleteAccountConfirm)) {
            await deleteAccount();
        }
    };

    const handleTestNotification = () => {
        showNotification({
            title: t.appointmentReminderTitle,
            body: t.appointmentReminderBody,
            icon: '🔔'
        });
    };

    return (
        <div className="animate-fade-in max-w-3xl mx-auto pb-12">
            <h1 className="text-4xl font-black italic text-gray-900 dark:text-white mb-8 text-center">{t.settings}</h1>

            <div className="space-y-6">
                {/* Profile Card */}
                <div className="glass-card p-8 rounded-[2rem] shadow-sm">
                    <div className="flex items-center mb-6">
                         <div className="w-12 h-12 bg-brand-green/20 rounded-full flex items-center justify-center text-2xl mr-4 rtl:ml-4">👤</div>
                         <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.profileInfo}</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{t.name}</label>
                            <input type="text" defaultValue={currentUser?.name} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-transparent focus:border-brand-green focus:bg-white dark:focus:bg-gray-800 transition font-medium" />
                        </div>
                        <div>
                            {/* Changed from Email to Phone */}
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{t.whatsYourPhone}</label>
                            <input type="text" defaultValue={currentUser?.phone} disabled className="w-full p-4 rounded-xl bg-gray-100 dark:bg-gray-900/50 text-gray-500 cursor-not-allowed font-medium" />
                        </div>
                    </div>
                </div>

                {/* Preferences Card */}
                <div className="glass-card p-8 rounded-[2rem] shadow-sm">
                     <div className="flex items-center mb-6">
                         <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl mr-4 rtl:ml-4">⚙️</div>
                         <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.preferences}</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-2">
                            <label className="font-bold text-gray-700 dark:text-gray-300">{t.theme}</label>
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                                <button onClick={() => setTheme(Theme.LIGHT)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${theme === Theme.LIGHT ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500'}`}>{t.light}</button>
                                <button onClick={() => setTheme(Theme.DARK)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${theme === Theme.DARK ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500'}`}>{t.dark}</button>
                            </div>
                        </div>
                        <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
                         <div className="flex justify-between items-center p-2">
                            <label className="font-bold text-gray-700 dark:text-gray-300">{t.language}</label>
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                                <button onClick={() => setLanguage(Language.EN)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${language === Language.EN ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500'}`}>{t.english}</button>
                                <button onClick={() => setLanguage(Language.AR)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${language === Language.AR ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500'}`}>{t.arabic}</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="grid md:grid-cols-3 gap-4 pt-4">
                     <button onClick={handleTestNotification} className="w-full bg-blue-500/10 text-blue-600 dark:text-blue-400 py-4 rounded-2xl font-bold hover:bg-blue-500 hover:text-white transition-all">
                        {t.testNotification}
                    </button>
                    <button onClick={logout} className="w-full bg-gray-500/10 text-gray-600 dark:text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-500 hover:text-white transition-all">
                        {t.logout}
                    </button>
                    <button onClick={handleDeleteAccount} className="w-full bg-red-500/10 text-red-600 dark:text-red-400 py-4 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all">
                        {t.deleteAccount}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
