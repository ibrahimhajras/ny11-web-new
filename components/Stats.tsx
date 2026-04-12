import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { subDays, format } from 'date-fns';
import { DailyPlan } from '../types';

const ChartBar: React.FC<{ completed: number; day: string }> = ({ completed, day }) => {
    return (
        <div className="flex-1 flex flex-col justify-end items-center group h-full">
            <div className="relative w-full flex flex-col justify-end h-full px-1">
                <div 
                    className="w-full bg-gradient-to-t from-brand-green/20 to-brand-green/40 rounded-t-xl group-hover:from-brand-green group-hover:to-brand-green-light transition-all duration-500 shadow-sm relative group-hover:shadow-glow-sm" 
                    style={{ height: `${completed}%` }}
                >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-xl">
                        {completed.toFixed(0)}%
                    </div>
                </div>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-bold uppercase tracking-wider">{day.charAt(0)}</span>
        </div>
    );
};

const Stats: React.FC = () => {
    const { language, translations, plan, currentUser } = useAppContext();
    const t = translations[language];
    
    const adherenceData = useMemo(() => {
        const data = [];
        // Generate last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayLabel = format(date, 'E'); // Mon, Tue, etc.
            
            const dailyPlan = plan[dateKey];
            let completedCount = 0;
            let totalCount = 0;
            
            if (dailyPlan) {
                const categories: (keyof DailyPlan)[] = ['breakfast', 'lunch', 'dinner', 'snacks', 'exercises'];
                categories.forEach(cat => {
                    const items = dailyPlan[cat] || [];
                    totalCount += items.length;
                    completedCount += items.filter(item => item.completed).length;
                });
            }
            
            const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
            data.push({ day: dayLabel, completed: percentage });
        }
        return data;
    }, [plan]);

    const totalAdherence = useMemo(() => {
        const sum = adherenceData.reduce((acc, d) => acc + d.completed, 0);
        return sum / adherenceData.length;
    }, [adherenceData]);

    const isGuest = !currentUser || currentUser.id === 'guest';

    if (isGuest) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in p-8">
                <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mb-6">
                    <i className="ph ph-lock-key text-brand-green text-4xl"></i>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">{t.loginToContinue || "Login Required"}</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                    Personalized progress tracking is only available for registered members. Create an account to start tracking your daily health adherence.
                </p>
                <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 w-full max-w-sm">
                     <p className="text-xs font-black text-brand-green uppercase tracking-widest mb-4">Track metrics like</p>
                     <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 font-medium text-left">
                        <li className="flex items-center gap-2 animate-slide-up" style={{animationDelay: '0.1s'}}><i className="ph ph-check-circle text-brand-green"></i> Daily plan adherence</li>
                        <li className="flex items-center gap-2 animate-slide-up" style={{animationDelay: '0.2s'}}><i className="ph ph-check-circle text-brand-green"></i> Weekly performance trends</li>
                        <li className="flex items-center gap-2 animate-slide-up" style={{animationDelay: '0.3s'}}><i className="ph ph-check-circle text-brand-green"></i> Personal AI-generated goals</li>
                     </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto px-2">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black italic text-gray-900 dark:text-white leading-tight tracking-tighter">
                        {t.yourProgress}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Tracking your journey to a healthier lifestyle</p>
                </div>
                <div className="bg-white dark:bg-dark-card px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-card bg-gray-200 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?u=user${i}`} alt="User" />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Join 500+ Others</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Card: Overall Adherence */}
                <div className="lg:col-span-5 glass-card p-10 rounded-[3rem] shadow-xl border border-white/20 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full blur-[60px] -ml-24 -mb-24"></div>
                    
                    <h2 className="text-2xl font-black mb-10 text-gray-900 dark:text-white relative z-10">{t.overallAdherence}</h2>
                    
                    <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center z-10">
                        <svg className="transform -rotate-90 w-full h-full">
                            <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-800/50" />
                            <circle 
                                cx="50%" 
                                cy="50%" 
                                r="44%" 
                                stroke="url(#gradient)" 
                                strokeWidth="14" 
                                fill="transparent" 
                                strokeDasharray="1000" 
                                strokeDashoffset={1000 - (1000 * totalAdherence) / 100} 
                                className="transition-all duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1)" 
                                strokeLinecap="round" 
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#B2D871" />
                                    <stop offset="100%" stopColor="#8BC53F" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
                                {totalAdherence.toFixed(0)}<span className="text-3xl text-brand-green">%</span>
                             </span>
                             <span className="text-[10px] font-black text-brand-green uppercase tracking-[0.3em] mt-2">Active Score</span>
                        </div>
                    </div>
                </div>
                
                {/* Right Card: Weekly Detailed Stats */}
                <div className="lg:col-span-7 glass-card p-10 rounded-[3rem] shadow-xl border border-white/20 relative overflow-hidden flex flex-col h-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t.weeklyAdherence}</h2>
                            <p className="text-sm text-gray-500 font-medium">Last 7 days activity</p>
                        </div>
                        <div className="flex gap-2">
                             <div className="px-4 py-2 bg-brand-green/10 text-brand-green rounded-xl text-xs font-black uppercase tracking-widest">Weekly</div>
                             <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed">Monthly</div>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex items-end justify-between h-64 mt-4 px-2 sm:px-4">
                        {adherenceData.map((d, i) => (
                             <ChartBar key={i} completed={d.completed} day={d.day} />
                        ))}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Consistency</p>
                            <p className="text-xl font-black text-brand-green">
                                {totalAdherence > 80 ? 'Elite' : totalAdherence > 50 ? 'High' : 'Improving'}
                            </p>
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Day</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">
                                {adherenceData.reduce((prev, current) => (prev.completed > current.completed) ? prev : current).day}
                            </p>
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Task</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">Done</p>
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xl font-black text-blue-500">Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
