
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, addDays, subDays } from 'date-fns';
import { DailyPlan, Meal, Exercise, User, Goal, MarketItem, Coach } from '../types';

const HeroLanding: React.FC = () => {
    const { translations, language, setIsLanguageSelected, loginAsGuest, siteConfig, marketItems, coaches } = useAppContext();
    const t = translations[language];

    const handleGetStarted = () => {
        setIsLanguageSelected(true);
        loginAsGuest();
    }

    const featuredItems = marketItems.slice(0, 3);
    const featuredCoaches = coaches.slice(0, 3);

    const stats = [
        { label: t.statClients, value: '10k+', icon: '🤝' },
        { label: t.statPlans, value: '500+', icon: '📋' },
        { label: t.statExperts, value: '50+', icon: '⭐' },
        { label: t.statSupport, value: '24/7', icon: '⏰' },
    ];

    const testimonials = [
        { name: language === 'ar' ? 'أحمد محمد' : 'Ahmed M.', text: language === 'ar' ? 'ny11 غير حياتي تماماً! الخطة المخصصة كانت سهلة الاتباع والخبراء مذهلون.' : 'ny11 completely changed my life! The custom plan was easy to follow and the experts are amazing.', avatar: 'https://i.pravatar.cc/100?u=1' },
        { name: language === 'ar' ? 'سارة علي' : 'Sarah A.', text: language === 'ar' ? 'أفضل تطبيق صحي استخدمته على الإطلاق. جودة الوجبات في المتجر مذهلة.' : 'Best health app I’ve ever used. The quality of the meals in the market is incredible.', avatar: 'https://i.pravatar.cc/100?u=2' },
        { name: language === 'ar' ? 'ياسين حسن' : 'Yassin H.', text: language === 'ar' ? 'الذكاء الاصطناعي هنا مفيد جداً، والاشتراك مع جيميناي يجعل التجربة فريدة.' : 'The AI here is so helpful, and the Gemini integration makes the experience unique.', avatar: 'https://i.pravatar.cc/100?u=3' },
    ];

    return (
        <div className="animate-fade-in space-y-20">
            {/* Hero Section */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500 z-10"></div>
                <img 
                    src={siteConfig.heroImage} 
                    alt="Healthy Lifestyle" 
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition duration-1000"
                />
                
                <div className="relative z-20 flex flex-col justify-center items-center h-[500px] text-center px-6">
                    <span className="inline-block py-1 px-4 rounded-full bg-brand-green/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest mb-4 animate-slide-up">
                        Healthy Kitchen
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 drop-shadow-lg max-w-4xl animate-slide-up" style={{animationDelay: '0.1s'}}>
                        {t.heroTitle}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100 max-w-2xl mb-8 leading-relaxed font-medium animate-slide-up" style={{animationDelay: '0.2s'}}>
                        {t.heroSubtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{animationDelay: '0.3s'}}>
                        <button onClick={handleGetStarted} className="bg-white text-brand-green-dark px-10 py-4 rounded-full font-bold text-lg hover:bg-brand-green hover:text-white transition-all duration-300 shadow-glow hover:shadow-glow-sm transform hover:-translate-y-1">
                            {t.getStarted}
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-card p-8 rounded-[2.5rem] text-center shadow-sm hover:shadow-glow-sm transition-all transform hover:-translate-y-2">
                        <span className="text-4xl mb-4 block">{stat.icon}</span>
                        <h3 className="text-3xl font-black text-brand-green-dark dark:text-brand-green mb-1">{stat.value}</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* About Us Section */}
            <div className="glass-card rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[80px] -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 space-y-6">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white">{t.aboutUsTitle}</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                            {t.aboutUsDesc}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <img src="https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fresh Food" className="rounded-[2.5rem] shadow-xl" />
                    </div>
                </div>
            </div>

            {/* Experts Section */}
            <div>
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{t.ourExpertsShort}</h2>
                    <div className="w-20 h-1.5 bg-brand-green mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {featuredCoaches.map((coach) => (
                        <div key={coach.id} className="bg-white dark:bg-dark-card rounded-[2.5rem] p-8 text-center shadow-lg border border-transparent hover:border-brand-green/30 transition-all duration-500 transform hover:scale-105">
                            <img src={coach.avatar} className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-brand-green/20" alt={coach.name} />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{coach.name}</h3>
                            <p className="text-brand-green font-bold text-sm mb-4 uppercase">{coach.specialty}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{coach.bio}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Market Items */}
            <div className="bg-gray-100 dark:bg-gray-900/50 -mx-4 sm:-mx-8 lg:-mx-12 px-12 py-20 rounded-[4rem]">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{t.featuredProducts}</h2>
                    <div className="w-20 h-1.5 bg-brand-green mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredItems.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-dark-card rounded-[2.5rem] overflow-hidden shadow-xl group">
                            <div className="h-64 overflow-hidden">
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={item.name} />
                            </div>
                            <div className="p-8 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{item.name}</h3>
                                    <p className="text-brand-green font-bold text-lg">${item.price.toFixed(2)}</p>
                                </div>
                                <span className="text-3xl">🥗</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="pb-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{t.testimonialsTitle}</h2>
                    <div className="w-20 h-1.5 bg-brand-green mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testi, idx) => (
                        <div key={idx} className="glass-card p-8 rounded-[2.5rem] relative">
                            <span className="absolute top-6 left-6 text-6xl text-brand-green opacity-20 font-serif">“</span>
                            <div className="relative z-10 space-y-6">
                                <p className="text-gray-600 dark:text-gray-300 italic font-medium pt-4">{testi.text}</p>
                                <div className="flex items-center gap-4">
                                    <img src={testi.avatar} className="w-12 h-12 rounded-full shadow-md" alt={testi.name} />
                                    <h4 className="font-bold text-gray-900 dark:text-white">{testi.name}</h4>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MealDetailModal: React.FC<{ meal: Meal; onClose: () => void }> = ({ meal, onClose }) => {
    const { language, translations } = useAppContext();
    const t = translations[language];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="glass-card rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
                <div className="relative h-64">
                     <img src={meal.image || 'https://picsum.photos/400/300'} alt={meal.name} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                     <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                     <div className="absolute bottom-4 left-6">
                        <span className="bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">Meal</span>
                        <h2 className="text-3xl font-bold text-white leading-none">{meal.name}</h2>
                     </div>
                </div>
                
                <div className="p-8">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">{meal.description || 'No description available.'}</p>
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">{t.calories}</span>
                        <span className="font-black text-2xl text-brand-green">{meal.calories} <span className="text-sm text-gray-400 font-normal">kcal</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileBento: React.FC = () => {
    const { currentUser, language, translations } = useAppContext();
    const t = translations[language];

    // Calculate BMI for fun stats
    const bmi = (currentUser?.weight && currentUser?.height) 
        ? (currentUser.weight / ((currentUser.height / 100) ** 2)).toFixed(1)
        : '--';

    return (
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
             {/* Profile Main Card */}
            <div className="bg-gradient-to-br from-brand-green-dark to-[#0f2918] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-brand-green rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <img src={currentUser?.avatar || `https://i.pravatar.cc/150?u=${currentUser?.id}`} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg object-cover" alt="Profile"/>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-brand-green rounded-full border-4 border-brand-green-dark"></div>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{currentUser?.name}</h2>
                    <p className="text-white/60 text-sm mb-6 bg-white/10 px-3 py-1 rounded-full">{currentUser?.email}</p>
                    
                    <div className="grid grid-cols-3 gap-4 w-full">
                         <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 flex flex-col justify-center">
                            <span className="text-xs text-white/60 uppercase tracking-wider">{t.age}</span>
                            <span className="text-xl font-bold">{currentUser?.age || '-'}</span>
                         </div>
                         <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 flex flex-col justify-center">
                            <span className="text-xs text-white/60 uppercase tracking-wider">{t.weight}</span>
                            <span className="text-xl font-bold">{currentUser?.weight || '-'} <span className="text-xs font-normal">kg</span></span>
                         </div>
                         <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 flex flex-col justify-center">
                            <span className="text-xs text-white/60 uppercase tracking-wider">{t.height}</span>
                            <span className="text-xl font-bold">{currentUser?.height || '-'} <span className="text-xs font-normal">cm</span></span>
                         </div>
                    </div>
                </div>
            </div>

            {/* BMI / Goal Card */}
             <div className="bg-white dark:bg-dark-card p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Current Goal</p>
                    <p className="text-gray-800 dark:text-white font-bold text-lg capitalize">{currentUser?.goal?.replace('_', ' ') || 'Maintenance'}</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-brand-green flex items-center justify-center">
                    <span className="text-brand-green font-bold text-sm">BMI {bmi}</span>
                </div>
             </div>
        </div>
    );
};

const PlanItem: React.FC<{ item: Meal | Exercise; onToggle: () => void, isRtl: boolean; onMealClick: (meal: Meal) => void }> = ({ item, onToggle, isRtl, onMealClick }) => {
    const isExercise = 'duration' in item || 'reps' in item;
    const itemImage = !isExercise ? (item as Meal).image : null;

    const content = (
        <div className={`group flex items-center justify-between p-4 rounded-[1.5rem] mb-3 transition-all duration-300 w-full border ${item.completed ? 'bg-brand-green/10 border-transparent' : 'bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'}`}>
            <div className="flex items-center flex-1">
                <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${item.completed ? 'bg-brand-green scale-110' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-brand-green/20'}`}>
                    {item.completed ? (
                        <i className="ph ph-check text-white font-bold text-lg"></i>
                    ) : (
                        <i className="ph ph-plus text-gray-400 group-hover:text-brand-green text-xs"></i>
                    )}
                </button>
                
                {itemImage && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden mx-3 flex-shrink-0 shadow-sm">
                        <img src={itemImage} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                )}
                
                <div className={`mx-3 flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <p className={`font-bold text-gray-800 dark:text-white text-base leading-tight ${item.completed ? 'line-through opacity-50' : ''}`}>{item.name}</p>
                    <p className="text-xs font-medium text-brand-green mt-0.5">
                        {isExercise ? (item as Exercise).duration || (item as Exercise).reps : `${(item as Meal).calories} kcal`}
                    </p>
                </div>
            </div>
            {!isExercise && !item.completed && (
                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                     <i className={`ph ph-caret-right ${isRtl && 'transform rotate-180'}`}></i>
                </div>
            )}
        </div>
    );

    if (isExercise) {
        return <div className="w-full">{content}</div>;
    }

    return (
        <button onClick={() => onMealClick(item as Meal)} className="w-full text-left">
            {content}
        </button>
    );
};


const DailyPlanView: React.FC = () => {
    const { plan, updateDailyPlan, language, translations } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const isRtl = language === 'ar';
    const t = translations[language];

    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dailyPlan = plan[dateKey] || { breakfast: [], lunch: [], dinner: [], snacks: [], exercises: [] };

    const handleToggleItem = (category: keyof DailyPlan, index: number) => {
        const newDailyPlan = { ...dailyPlan };
        const items = [...newDailyPlan[category]];
        const item = items[index];
        items[index] = { ...item, completed: !item.completed };
        // @ts-ignore
        newDailyPlan[category] = items;
        updateDailyPlan(dateKey, newDailyPlan);
    };
    
    const sections: { title: string, key: keyof DailyPlan, icon: string }[] = [
        { title: t.breakfast, key: "breakfast", icon: '☀️' },
        { title: t.lunch, key: "lunch", icon: '🍲' },
        { title: t.dinner, key: "dinner", icon: '🌙' },
        { title: t.snacks, key: "snacks", icon: '🍎' },
        { title: t.exercises, key: "exercises", icon: '🔥' },
    ];
    
    return (
        <div className="col-span-12 lg:col-span-8">
            <div className="glass-card rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                {/* Date Navigation */}
                <div className="flex justify-between items-center mb-10 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-full">
                    <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="w-10 h-10 bg-white dark:bg-dark-card rounded-full shadow-sm hover:text-brand-green transition flex items-center justify-center"><i className={`ph ph-caret-left ${isRtl && 'transform rotate-180'}`}></i></button>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{t.todaysPlan}</p>
                        <h2 className="text-xl font-black text-gray-800 dark:text-white">{format(currentDate, 'EEEE, MMM d')}</h2>
                    </div>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="w-10 h-10 bg-white dark:bg-dark-card rounded-full shadow-sm hover:text-brand-green transition flex items-center justify-center"><i className={`ph ph-caret-right ${isRtl && 'transform rotate-180'}`}></i></button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
                    {sections.map(section => (
                        (dailyPlan[section.key] && dailyPlan[section.key].length > 0) && (
                            <div key={section.key} className="relative">
                                <div className="flex items-center mb-4 space-x-2 rtl:space-x-reverse">
                                    <span className="text-2xl">{section.icon}</span>
                                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">{section.title}</h3>
                                </div>
                                <div className="pl-2 rtl:pl-0 rtl:pr-2 border-l-2 rtl:border-l-0 rtl:border-r-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="pl-4 rtl:pr-4">
                                        {dailyPlan[section.key].map((item, index) => (
                                        <PlanItem key={index} item={item} onToggle={() => handleToggleItem(section.key, index)} isRtl={isRtl} onMealClick={setSelectedMeal} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                    {Object.values(dailyPlan).every((arr: any) => arr.length === 0) && (
                        <div className="col-span-2 py-10 text-center text-gray-400">
                            <p>No plan generated for this day.</p>
                        </div>
                    )}
                </div>
            </div>
            {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
        </div>
    );
}

const ProfileSetup: React.FC<{ onComplete: (data: Partial<User>) => void }> = ({ onComplete }) => {
    const { language, translations } = useAppContext();
    const t = translations[language];
    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState({
        age: '',
        weight: '',
        height: '',
        goal: '' as Goal | '',
    });

    const goals: { key: Goal, label: keyof typeof t }[] = [
        { key: Goal.WEIGHT_LOSS, label: 'weightLoss' },
        { key: Goal.WEIGHT_GAIN, label: 'weightGain' },
        { key: Goal.MUSCLE_BUILD, label: 'muscleBuild' },
        { key: Goal.FITNESS, label: 'fitness' },
        { key: Goal.MAINTENANCE, label: 'maintenance' },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
         if (step === 1 && !profileData.age) return;
         if (step === 2 && !profileData.weight) return;
         if (step === 3 && !profileData.height) return;
         setStep(s => s + 1)
    };
    
    const handleSubmit = () => {
        if (!profileData.age || !profileData.weight || !profileData.height || !profileData.goal) {
            alert('Please fill all fields');
            return;
        }
        onComplete({
            age: parseInt(profileData.age, 10),
            weight: parseInt(profileData.weight, 10),
            height: parseInt(profileData.height, 10),
            goal: profileData.goal,
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="glass-card p-10 rounded-[3rem] shadow-glow-sm text-center animate-fade-in w-full max-w-md mx-auto">
                        <span className="text-4xl mb-4 block">🎂</span>
                        <h3 className="text-3xl font-black mb-2 dark:text-white">{t.whatsYourAge}</h3>
                        <p className="text-gray-500 mb-8">{t.ageInfo}</p>
                        <input type="number" name="age" value={profileData.age} onChange={handleInputChange} className="w-full p-6 text-center text-4xl font-bold rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-green outline-none transition mb-8" placeholder="00" autoFocus />
                        <button onClick={nextStep} className="w-full bg-brand-green text-white py-4 rounded-full font-bold text-lg hover:shadow-glow transition-all transform hover:-translate-y-1">{t.next}</button>
                    </div>
                );
            case 2:
                return (
                    <div className="glass-card p-10 rounded-[3rem] shadow-glow-sm text-center animate-fade-in w-full max-w-md mx-auto">
                        <span className="text-4xl mb-4 block">⚖️</span>
                        <h3 className="text-3xl font-black mb-2 dark:text-white">{t.whatsYourWeight}</h3>
                         <p className="text-gray-500 mb-8">{t.weightInfo}</p>
                        <div className="relative">
                            <input type="number" name="weight" value={profileData.weight} onChange={handleInputChange} className="w-full p-6 text-center text-4xl font-bold rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-green outline-none transition mb-8" placeholder="00" autoFocus />
                            <span className="absolute right-8 top-8 text-gray-400 font-bold">kg</span>
                        </div>
                        <button onClick={nextStep} className="w-full bg-brand-green text-white py-4 rounded-full font-bold text-lg hover:shadow-glow transition-all transform hover:-translate-y-1">{t.next}</button>
                    </div>
                );
            case 3:
                return (
                     <div className="glass-card p-10 rounded-[3rem] shadow-glow-sm text-center animate-fade-in w-full max-w-md mx-auto">
                        <span className="text-4xl mb-4 block">📏</span>
                        <h3 className="text-3xl font-black mb-2 dark:text-white">{t.whatsYourHeight}</h3>
                        <p className="text-gray-500 mb-8">{t.heightInfo}</p>
                        <div className="relative">
                            <input type="number" name="height" value={profileData.height} onChange={handleInputChange} className="w-full p-6 text-center text-4xl font-bold rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-green outline-none transition mb-8" placeholder="000" autoFocus />
                            <span className="absolute right-8 top-8 text-gray-400 font-bold">cm</span>
                        </div>
                        <button onClick={nextStep} className="w-full bg-brand-green text-white py-4 rounded-full font-bold text-lg hover:shadow-glow transition-all transform hover:-translate-y-1">{t.next}</button>
                    </div>
                );
            case 4:
                return (
                     <div className="glass-card p-10 rounded-[3rem] shadow-glow-sm text-center animate-fade-in w-full max-w-md mx-auto">
                        <span className="text-4xl mb-4 block">🎯</span>
                        <h3 className="text-3xl font-black mb-6 dark:text-white">{t.yourGoal}</h3>
                        <div className="space-y-3 mb-8">
                            {goals.map(goal => (
                                <button
                                    key={goal.key}
                                    onClick={() => setProfileData(prev => ({ ...prev, goal: goal.key }))}
                                    className={`w-full p-4 rounded-2xl font-bold text-md transition-all duration-300 ${profileData.goal === goal.key ? 'bg-brand-green text-white shadow-lg scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {t[goal.label]}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleSubmit} disabled={!profileData.goal} className="w-full bg-brand-green text-white py-4 rounded-full font-bold text-lg hover:shadow-glow transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">{t.finishSetup}</button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 animate-fade-in">
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="relative z-10 w-full">
                 <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 text-center">{t.setupProfileTitle}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-lg mx-auto text-center text-lg">
                    {t.setupProfileSubtitle}
                </p>
                {renderStep()}
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { currentUser, updateUserProfile, plan, language, translations, generatePlanWithAI } = useAppContext();
    const t = translations[language];

    useEffect(() => {
        // Automatically trigger plan generation if profile is complete but no plan exists
        const today = format(new Date(), 'yyyy-MM-dd');
        if (currentUser && currentUser.id !== 'guest' && 
            currentUser.age && currentUser.weight && currentUser.height && currentUser.goal && 
            (!plan || !plan[today])) {
            generatePlanWithAI(currentUser);
        }
    }, [currentUser, plan]);

    if (!currentUser || currentUser.id === 'guest') {
        return <HeroLanding />;
    }

    const isProfileComplete = !!(currentUser?.age && currentUser?.weight && currentUser?.height && currentUser?.goal);

    if (!isProfileComplete) {
        return <ProfileSetup onComplete={updateUserProfile} />;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const hasPlan = !!(plan && plan[today]);

    if (!hasPlan) {
        return (
            <div className="flex flex-col items-center justify-center text-center pt-20 animate-fade-in min-h-[50vh]">
                <div className="w-24 h-24 border-8 border-brand-green border-t-transparent rounded-full animate-spin mb-8"></div>
                <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">{t.generatingPlan}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-xl max-w-md">{t.generatingPlanDesc}</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in pb-12">
            <h1 className="text-3xl font-black italic text-gray-900 dark:text-white mb-6">Hello, <span className="text-brand-green">{currentUser.name.split(' ')[0]}</span> 👋</h1>
            <div className="grid grid-cols-12 gap-8">
                <ProfileBento />
                <DailyPlanView />
            </div>
        </div>
    );
};

export default Dashboard;
