
import React, { useState, useMemo } from 'react';
import { MarketItem, MarketCategory, NutritionFacts } from '../types';
import { useAppContext } from '../context/AppContext';

const CartModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, clearCart, showToast, language, translations, purchaseCart } = useAppContext();
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastTotal, setLastTotal] = useState(0);
    const t = translations[language];
    const isRtl = language === 'ar';

    if (!isOpen) return null;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        setLastTotal(total);
        setIsSuccess(true);
        await purchaseCart();
    };

    const handleClose = () => {
        if (isSuccess) {
            clearCart();
            setIsSuccess(false);
            setLastTotal(0);
        }
        onClose();
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex ${isRtl ? 'justify-start' : 'justify-end'} animate-fade-in`} onClick={handleClose}>
            <div 
                className={`bg-white dark:bg-dark-card w-full max-w-md h-full shadow-2xl p-8 flex flex-col transform transition-transform duration-300 ${isRtl ? 'rounded-r-[2.5rem]' : 'rounded-l-[2.5rem]'}`} 
                onClick={(e) => e.stopPropagation()}
                style={{animation: isRtl ? 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)'}}
            >
                {!isSuccess ? (
                    <>
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                             <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                                <i className="ph ph-shopping-bag"></i> {t.shoppingCart}
                            </h2>
                            <button onClick={handleClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition-colors"><i className="ph ph-x"></i></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <span className="text-7xl mb-6 grayscale opacity-50">🛒</span>
                                    <p className="font-bold text-lg">{t.cartIsEmpty}</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex items-center bg-gray-50 dark:bg-gray-800/40 p-4 rounded-3xl border border-transparent hover:border-brand-green/20 transition-all group">
                                        <div className="relative">
                                            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover mr-4 rtl:mr-0 rtl:ml-4 shadow-sm group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 dark:text-white leading-tight mb-1">{item.name}</p>
                                            <p className="text-sm font-bold text-brand-green">${item.price.toFixed(2)} x {item.quantity}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                            <i className="ph ph-trash text-lg"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="mt-8 pt-6 border-t dark:border-gray-800">
                                <div className="flex justify-between items-center font-black text-3xl mb-8 text-gray-900 dark:text-white">
                                    <span className="text-lg text-gray-500 uppercase tracking-widest">{t.total}:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <button 
                                    onClick={handleCheckout} 
                                    className="w-full bg-brand-green text-white py-5 rounded-2xl font-black text-xl hover:shadow-glow transform hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                                >
                                    <i className="ph ph-credit-card"></i>
                                    {t.checkout}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                        <div className="w-24 h-24 bg-brand-green text-white rounded-full flex items-center justify-center text-5xl mb-8 shadow-glow animate-bounce">
                            <i className="ph ph-check-circle"></i>
                        </div>
                        <h2 className="text-4xl font-black italic text-gray-900 dark:text-white mb-4 tracking-tighter">SUCCESS!</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed max-w-[280px]">
                            {isRtl ? 'تم استلام طلبك بنجاح. سنقوم بتجهيزه لك فوراً!' : 'Your order has been received successfully. We are preparing it for you now!'}
                        </p>
                        
                        <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 mb-8">
                             <div className="flex justify-between mb-4">
                                <span className="font-bold text-gray-400 uppercase text-xs tracking-wider">Order ID</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">#NY-{(Math.random() * 10000).toFixed(0)}</span>
                             </div>
                             <div className="h-px bg-gray-200 dark:bg-gray-700 w-full mb-4"></div>
                             <div className="flex justify-between font-black text-xl text-gray-900 dark:text-white">
                                <span>{t.total}</span>
                                <span className="text-brand-green">${lastTotal.toFixed(2)}</span>
                             </div>
                        </div>

                        <button 
                            onClick={handleClose} 
                            className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:shadow-xl transition-all"
                        >
                            {isRtl ? 'العودة للمتجر' : 'Back to Market'}
                        </button>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

const MarketItemDetail: React.FC<{ item: MarketItem; onClose: () => void }> = ({ item, onClose }) => {
    const { language, translations, addToCart, showToast, currentUser, logout } = useAppContext();
    const t = translations[language];

    const handleAddToCart = () => {
        if (currentUser?.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        addToCart(item.id);
        showToast(`${item.name} added to cart!`, 'success');
    };

    return (
        <div className="fixed inset-0 bg-gray-100/95 dark:bg-dark-bg/95 z-[60] overflow-y-auto animate-fade-in p-4 md:p-12 block">
            <div className="max-w-4xl w-full mx-auto bg-white dark:bg-dark-card rounded-[3rem] shadow-2xl relative min-h-screen md:min-h-0 mb-12">
                
                {/* Close Button - Enhanced visibility */}
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                    title={t.close}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6 md:p-12">
                    {/* Top Section: Title & Image */}
                    <div className="flex flex-col md:flex-row gap-10 mb-12 relative">
                        <div className="w-full md:w-1/2 relative group">
                            <img src={item.image} alt={item.name} className="w-full h-[350px] md:h-[450px] object-cover rounded-[2.5rem] shadow-xl group-hover:scale-[1.01] transition-transform duration-500" />
                            {item.summary && (
                                <div className="absolute -bottom-6 -right-6 md:right-0 bg-gray-200 dark:bg-gray-700 p-6 rounded-full shadow-2xl flex flex-col items-center justify-center text-center w-44 h-44 border-4 border-white dark:border-dark-card animate-float">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Description:</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white leading-tight">{item.summary}</span>
                                </div>
                            )}
                        </div>
                        <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left pt-6 md:pt-0">
                            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-gray-800 dark:text-white mb-6 lowercase leading-tight">{item.name}</h1>
                            <div className="flex flex-col items-center md:items-start gap-6">
                                <p className="text-5xl font-black text-brand-green">${item.price.toFixed(2)}</p>
                                <button 
                                    onClick={handleAddToCart}
                                    className="w-full md:w-auto bg-brand-green text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-glow transition-all transform hover:-translate-y-1 active:translate-y-0"
                                >
                                    {t.addToCart}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Ingredients Section */}
                        {item.ingredients && (
                            <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
                                <h3 className="text-xl font-black underline mb-4 text-gray-700 dark:text-gray-300">{t.ingredients}:</h3>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2rem] text-gray-600 dark:text-gray-400 font-medium text-lg leading-relaxed shadow-sm">
                                    {item.ingredients}
                                </div>
                            </div>
                        )}

                        {/* Nutrition Facts Section */}
                        {item.nutrition && (
                            <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                                <h3 className="text-xl font-black underline mb-4 text-gray-700 dark:text-gray-300">{t.nutritionFacts}</h3>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2rem] space-y-4 text-gray-600 dark:text-gray-400 font-medium text-lg shadow-sm">
                                    <p className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2"><span className="font-black text-gray-800 dark:text-white">{t.servingSize}:</span> {item.nutrition.servingSize}</p>
                                    <p className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2"><span className="font-black text-gray-800 dark:text-white">{t.energy}:</span> {item.nutrition.energy}</p>
                                    <p className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2"><span className="font-black text-gray-800 dark:text-white">{t.protein}:</span> {item.nutrition.protein}</p>
                                    <p className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2"><span className="font-black text-gray-800 dark:text-white">{t.carbohydrates} (CHO):</span> {item.nutrition.carbs}</p>
                                    <p className="flex justify-between"><span className="font-black text-gray-800 dark:text-white">{t.fat}:</span> {item.nutrition.fat}</p>
                                </div>
                            </div>
                        )}

                        {/* Caution Section */}
                        {item.caution && (
                            <div className="animate-slide-up pb-6" style={{animationDelay: '0.3s'}}>
                                <div className="bg-red-50/50 dark:bg-red-900/10 p-8 rounded-[2rem] text-gray-600 dark:text-gray-400 font-medium text-lg leading-relaxed border border-red-100 dark:border-red-900/20">
                                    <span className="font-black underline text-red-600 dark:text-red-400 mr-2">{t.caution}:</span> {item.caution}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MarketItemCard: React.FC<{ item: MarketItem; onSelect: (item: MarketItem) => void }> = ({ item, onSelect }) => {
    const { addToCart, showToast, language, currentUser, logout, translations } = useAppContext();
    const t = translations[language];

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentUser?.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        addToCart(item.id);
        showToast(`${item.name} added to cart!`, 'success');
    };

    return (
        <div 
            onClick={() => onSelect(item)}
            className="group cursor-pointer bg-white dark:bg-dark-card rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-transparent hover:border-brand-green/30 animate-fade-in"
        >
            <div className="relative h-56 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <button 
                    onClick={handleAddToCart}
                    className="absolute bottom-4 right-4 bg-brand-green text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform translate-y-20 group-hover:translate-y-0 transition-transform duration-300 hover:bg-white hover:text-brand-green"
                >
                    <i className="ph ph-plus text-xl font-bold"></i>
                </button>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{item.name}</h3>
                    <span className="font-black text-lg text-brand-green">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                {item.summary && (
                    <span className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest text-brand-green bg-brand-green/10 px-3 py-1 rounded-full">
                        {item.summary}
                    </span>
                )}
            </div>
        </div>
    );
};

const Market: React.FC = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
    const [activeCategory, setActiveCategory] = useState<MarketCategory>('all');
    const { cart, language, currentUser, logout, showToast, marketItems, translations } = useAppContext();
    const t = translations[language];

    const categories: { id: MarketCategory; label: string; icon: string }[] = [
        { id: 'all', label: t.all, icon: '✨' },
        { id: 'breakfast', label: t.cat_breakfast, icon: '🍳' },
        { id: 'lunch', label: t.cat_lunch, icon: '🍛' },
        { id: 'dinner', label: t.cat_dinner, icon: '🥗' },
        { id: 'snack', label: t.cat_snack, icon: '🥜' },
        { id: 'drink', label: t.cat_drink, icon: '🥤' },
    ];

    const filteredItems = useMemo(() => {
        if (activeCategory === 'all') return marketItems;
        return marketItems.filter(item => item.category === activeCategory);
    }, [activeCategory, marketItems]);

    const handleCartIconClick = () => {
        if (currentUser?.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        setIsCartOpen(true);
    };

    return (
        <div className="animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                     <h1 className="text-4xl font-black italic text-gray-900 dark:text-white">{t.market}</h1>
                     <p className="text-gray-500 mt-2">Healthy meals & snacks delivered to your door.</p>
                </div>
               
                <button onClick={handleCartIconClick} className="relative bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm hover:shadow-md transition group">
                    <i className="ph ph-shopping-cart text-2xl text-gray-700 dark:text-white group-hover:text-brand-green transition-colors"></i>
                    {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm border-2 border-gray-50 dark:border-dark-bg">{cart.reduce((total, item) => total + item.quantity, 0)}</span>}
                </button>
            </div>

            {/* Category Selector */}
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide gap-3 md:gap-4 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 transform active:scale-95 ${
                            activeCategory === cat.id
                                ? 'bg-brand-green text-white shadow-glow scale-105'
                                : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>
            
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map(item => (
                        <MarketItemCard key={item.id} item={item} onSelect={setSelectedItem} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                    <span className="text-6xl mb-4">🍽️</span>
                    <p className="text-xl font-medium">No items found in this category.</p>
                </div>
            )}

            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            {selectedItem && <MarketItemDetail item={selectedItem} onClose={() => setSelectedItem(null)} />}
        </div>
    );
};

export default Market;
