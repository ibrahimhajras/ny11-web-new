
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ONBOARDING_BACKGROUNDS } from '../constants';
import { Language, Goal } from '../types';

type OnboardingStep = 'language' | 'login' | 'register';

interface OnboardingAndAuthProps {
    mode?: 'full' | 'modal';
}

const OnboardingAndAuth: React.FC<OnboardingAndAuthProps> = ({ mode = 'full' }) => {
    const { 
        setLanguage, 
        register, 
        login, 
        showToast, 
        language, 
        loginAsGuest, 
        isLanguageSelected, 
        setIsLanguageSelected,
        translations,
        isActionLoading,
        isLockedOut
    } = useAppContext();
    const [step, setStep] = useState<OnboardingStep>('language');
    const [regStep, setRegStep] = useState(1);
    
    const [userFormData, setUserFormData] = useState({
        name: '', phone: '', password: '', age: '', weight: '', height: '', goal: '' as Goal | ''
    });

    useEffect(() => {
        setStep(isLanguageSelected ? 'login' : 'language');
    }, [isLanguageSelected]);
    
    const t = translations[language];

    const handleLanguageSelect = (lang: Language) => {
        setLanguage(lang);
        setIsLanguageSelected(true);
        loginAsGuest();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUserRegister = () => {
        const { name, phone, age, weight, height, goal, password } = userFormData;
        if (!name || !phone || !age || !weight || !height || !goal || !password) {
             showToast(language === Language.AR ? 'يرجى ملء جميع الحقول وكلمة المرور' : 'Please fill all fields and password', 'error');
            return;
        }
        register({ 
            name, 
            phone,
            age: parseInt(age, 10),
            weight: parseFloat(weight),
            height: parseFloat(height),
            goal,
        }, password);
    };

    const handleLogin = async () => {
        if (!userFormData.phone || !userFormData.password) {
            showToast(language === Language.AR ? 'يرجى إدخال رقم الهاتف وكلمة المرور' : 'Please enter phone and password', 'error');
            return;
        }
        await login(userFormData.phone, userFormData.password);
    }

    const goals: { key: Goal, label: keyof typeof t }[] = [
        { key: Goal.WEIGHT_LOSS, label: 'weightLoss' },
        { key: Goal.WEIGHT_GAIN, label: 'weightGain' },
        { key: Goal.MUSCLE_BUILD, label: 'muscleBuild' },
        { key: Goal.FITNESS, label: 'fitness' },
        { key: Goal.MAINTENANCE, label: 'maintenance' },
    ];
    
    const backgroundStyle = {
        backgroundImage: `url(${step === 'language' ? ONBOARDING_BACKGROUNDS[0] : ONBOARDING_BACKGROUNDS[1]})`
    };

    const renderRegistration = () => {
        const totalRegSteps = 7;
        const progress = (regStep / totalRegSteps) * 100;

        const isStepValid = () => {
            if (isActionLoading || isLockedOut) return false;
            switch (regStep) {
                case 1: return userFormData.phone.length > 5;
                case 2: return userFormData.password.length >= 6;
                case 3: return userFormData.name.trim().length > 2;
                case 4: return !!userFormData.age && parseInt(userFormData.age, 10) > 10;
                case 5: return !!userFormData.height && parseInt(userFormData.height, 10) > 50;
                case 6: return !!userFormData.weight && parseInt(userFormData.weight, 10) > 20;
                case 7: return !!userFormData.goal;
                default: return false;
            }
        };
        
        const nextRegStep = () => {
            if (isStepValid()) {
                setRegStep(s => s + 1);
            }
        };
        
        const renderCurrentStep = () => {
            switch(regStep) {
                case 1:
                    return (
                        <div className="animate-slide-up">
                            <h3 className="text-xl font-bold text-center mb-2 dark:text-white">{t.whatsYourPhone}</h3>
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{t.phoneInfo}</p>
                            <input type="tel" name="phone" value={userFormData.phone} onChange={handleInputChange} placeholder={t.phonePlaceholder} className="w-full p-3 text-center text-lg rounded-lg border dark:bg-dark-card dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-green" autoFocus />
                        </div>
                    );
                case 2:
                    return (
                        <div className="animate-slide-up">
                            <h3 className="text-xl font-bold text-center mb-2 dark:text-white">{t.password}</h3>
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">Min 6 characters</p>
                            <input type="password" name="password" value={userFormData.password} onChange={handleInputChange} placeholder={t.passwordPlaceholder} className="w-full p-3 text-center text-lg rounded-lg border dark:bg-dark-card dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-green" autoFocus />
                        </div>
                    );
                case 3:
                     return (
                        <div className="animate-slide-up">
                            <h3 className="text-xl font-bold text-center mb-2 dark:text-white">{t.whatsYourName}</h3>
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{t.nameInfo}</p>
                            <input type="text" name="name" value={userFormData.name} onChange={handleInputChange} placeholder={t.namePlaceholder} className="w-full p-3 text-center text-lg rounded-lg border dark:bg-dark-card dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-green" autoFocus />
                        </div>
                    );
                case 4:
                     return (
                        <div className="animate-slide-up">
                            <h3 className="text-xl font-bold text-center mb-2 dark:text-white">{t.whatsYourAge}</h3>
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{t.ageInfo}</p>
                            <input type="number" name="age" value={userFormData.age} onChange={handleInputChange} placeholder={t.agePlaceholder} className="w-full p-3 text-center text-lg rounded-lg border dark:bg-dark-card dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-green" autoFocus />
                        </div>
                    );
                case 5:
                     return (
                        <div className="animate-slide-up">
                            <h3 className="text-xl font-bold text-center mb-2 dark:text-white">{t.whatsYourHeight}</h3>
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{t.heightInfo}</p>
                            <input type="number" name="height" value={userFormData.height} onChange={handleInputChange} placeholder={t.heightPlaceholder} className="w-full p-3 text-center text-lg rounded-lg border dark:bg-dark-card dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-green" autoFocus />
                        </div>
                    );
                case 6:
                     return (
                        <div className="animate-slide-up">
                            <h3 className="text-xl font-bold text-center mb-2 dark:text-white">{t.whatsYourWeight}</h3>
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{t.weightInfo}</p>
                            <input type="number" name="weight" value={userFormData.weight} onChange={handleInputChange} placeholder={t.weightPlaceholder} className="w-full p-3 text-center text-lg rounded-lg border dark:bg-dark-card dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-green" autoFocus />
                        </div>
                    );
                case 7:
                     return (
                        <div className="animate-slide-up">
                            <h3 className="text-xl font-bold text-center mb-2 dark:text-white">{t.yourGoal}</h3>
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{t.goalInfo}</p>
                            <div className="space-y-2">
                                {goals.map(goal => (
                                    <button
                                        key={goal.key}
                                        onClick={() => setUserFormData(prev => ({ ...prev, goal: goal.key }))}
                                        className={`w-full p-2 rounded-lg font-semibold border-2 transition ${userFormData.goal === goal.key ? 'bg-brand-green text-brand-green-dark border-brand-green' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                                    >
                                        {t[goal.label]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                default:
                    return null;
            }
        };

        return (
             <div className="animate-fade-in w-full">
                <div className="mb-4">
                    <p className="text-sm text-center mb-2 text-gray-600 dark:text-gray-400">
                        {t.stepIndicator.replace('{current}', regStep.toString()).replace('{total}', totalRegSteps.toString())}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-brand-green h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                {isLockedOut && (
                    <p className="text-xs text-center text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 mb-4 font-bold">
                        {language === Language.AR ? "محاولات كثيرة جداً. يرجى الانتظار دقيقة." : "Too many attempts. Please wait 1 minute."}
                    </p>
                )}
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                    {t.registrationNote}
                </p>
                <div className="mt-4 min-h-[220px] flex flex-col justify-center">
                    {renderCurrentStep()}
                </div>
                <div className="mt-6 flex gap-4">
                    <button 
                        disabled={isActionLoading || isLockedOut}
                        onClick={() => regStep > 1 ? setRegStep(s => s - 1) : setStep('login')}
                        className="w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                    >
                        {t.back}
                    </button>
                    
                    {regStep < totalRegSteps ? (
                        <button onClick={nextRegStep} disabled={!isStepValid() || isLockedOut} className="w-2/3 bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">{t.next}</button>
                    ) : (
                        <button onClick={handleUserRegister} disabled={!isStepValid() || isLockedOut} className="w-2/3 bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {isActionLoading ? '...' : t.completeRegistration}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (step) {
            case 'language':
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-6">{t.chooseLang}</h2>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => handleLanguageSelect(Language.EN)} className="bg-brand-green text-brand-green-dark px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition">English</button>
                            <button onClick={() => handleLanguageSelect(Language.AR)} className="bg-brand-green text-brand-green-dark px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition">العربية</button>
                        </div>
                    </div>
                );
            case 'login':
                return (
                    <div className="animate-fade-in w-full text-center">
                        <h2 className="text-2xl font-bold mb-4">{t.loginToYourAccount}</h2>
                        {isLockedOut && (
                             <p className="text-xs text-center text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 mb-4 font-bold">
                                {language === Language.AR ? "محاولات كثيرة جداً. يرجى الانتظار قليلاً." : "Too many attempts. Please wait a bit."}
                             </p>
                        )}
                        <input type="text" name="phone" value={userFormData.phone} onChange={handleInputChange} placeholder={language === Language.AR ? 'رقم الهاتف أو البريد الإلكتروني' : 'Phone or email'} className="w-full p-3 mb-3 rounded-lg border dark:bg-dark-card dark:border-gray-600 focus:ring-2 focus:ring-brand-green outline-none" />
                        <input type="password" name="password" value={userFormData.password} onChange={handleInputChange} placeholder={t.passwordPlaceholder} className="w-full p-3 rounded-lg border dark:bg-dark-card dark:border-gray-600 focus:ring-2 focus:ring-brand-green outline-none" />
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                            {language === Language.AR
                                ? 'العملاء يدخلون برقم الهاتف. المدربون يدخلون بالبريد الإلكتروني المسجَّل من قِبَل الإدارة.'
                                : 'Customers sign in with their phone. Coaches sign in with the email the admin registered.'}
                        </p>
                        
                        <div className="flex gap-4 mt-4">
                            <button 
                                disabled={isActionLoading || isLockedOut}
                                onClick={() => loginAsGuest()}
                                className="w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                            >
                                {t.back}
                            </button>
                            <button 
                                onClick={handleLogin} 
                                disabled={isActionLoading || isLockedOut}
                                className="w-2/3 bg-brand-green text-brand-green-dark py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                            >
                                {isActionLoading ? '...' : t.login}
                            </button>
                        </div>
                        
                        <div className="my-4 text-gray-500">{t.or}</div>
                        <button onClick={() => setStep('register')} disabled={isLockedOut} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50">{t.registerNewAccount}</button>
                    </div>
                );
            case 'register':
                return renderRegistration();
        }
    };

    if (mode === 'modal') {
        return (
             <div className="p-6 w-full h-full flex flex-col items-center bg-white dark:bg-dark-card text-gray-800 dark:text-white">
                 <div className="flex flex-col items-center mb-6 text-center">
                    <h1 className="text-4xl font-black italic tracking-tighter text-brand-green">NY11</h1>
                    <p className="tracking-[0.3em] text-xs text-gray-500 dark:text-gray-400 uppercase mt-1">Healthy Kitchen</p>
                </div>
                <div className="w-full max-w-sm">
                     {renderContent()}
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-cover bg-center text-white" style={backgroundStyle}>
            <div className="h-full w-full bg-black bg-opacity-60 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center mb-6 text-center">
                    <h1 className="text-6xl font-black italic tracking-tighter text-white">NY11</h1>
                    <p className="tracking-[0.3em] text-xs text-white/80 uppercase mt-1">Healthy Kitchen</p>
                </div>

                <div className="bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text p-8 rounded-2xl shadow-2xl min-w-[350px] max-w-md w-full flex justify-center">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default OnboardingAndAuth;
