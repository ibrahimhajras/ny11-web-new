import React from 'react';
import { useAppContext } from '../context/AppContext';

const Orders: React.FC = () => {
    const { orders, language, translations } = useAppContext();
    const t = translations[language];
    const isRtl = language === 'ar';

    return (
        <div className="animate-fade-in pb-20">
            <header className="mb-12">
                <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-gray-900 dark:text-white mb-4">
                    {t.myOrders}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    {isRtl ? 'تتبع مشترياتك وطلباتك السابقة من متجر NY11.' : 'Track your past purchases and orders from the NY11 market.'}
                </p>
            </header>

            {orders.length === 0 ? (
                <div className="bg-white dark:bg-dark-card rounded-[3rem] p-20 text-center shadow-xl border border-gray-100 dark:border-gray-800 animate-slide-up">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 grayscale opacity-50">
                        📦
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t.noOrders}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">{isRtl ? 'ابدأ التسوق الآن لتظهر طلباتك هنا.' : 'Start shopping now to see your orders here.'}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div 
                            key={order.id} 
                            className="bg-white dark:bg-dark-card rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-50 dark:border-gray-800 overflow-hidden group animate-slide-up"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            <i className="ph ph-receipt"></i>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t.orderId}</p>
                                            <p className="font-bold text-gray-900 dark:text-white">#{order.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 md:gap-8 text-sm">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.date}</p>
                                            <p className="font-bold text-gray-700 dark:text-gray-300">{order.timestamp}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.status}</p>
                                            <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-[10px] uppercase tracking-wider border border-green-200 dark:border-green-800">
                                                {order.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.total}</p>
                                            <p className="font-black text-brand-green text-lg">${order.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/40 p-4 rounded-3xl border border-transparent hover:border-brand-green/10 transition-all">
                                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-800 dark:text-white text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">${item.price.toFixed(2)} x {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
