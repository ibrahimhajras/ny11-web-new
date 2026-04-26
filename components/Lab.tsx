
import React, { useState } from 'react';
import { LabTest } from '../types';
import { useAppContext } from '../context/AppContext';

const Lab: React.FC = () => {
    const { labTests, language, translations, currentUser, purchaseLabTest, logout, showToast, isActionLoading } = useAppContext();
    const t = translations[language];
    const [selected, setSelected] = useState<LabTest | null>(null);

    const handleBook = async (test: LabTest) => {
        if (!currentUser || currentUser.id === 'guest') {
            showToast(t.loginToContinue, 'error');
            logout();
            return;
        }
        await purchaseLabTest(test);
        setSelected(null);
    };

    return (
        <div className="animate-fade-in pb-12">
            <div className="mb-8">
                <h1 className="text-4xl font-black italic text-gray-900 dark:text-white">{t.labsTitle}</h1>
                <p className="text-gray-500 mt-2">{t.labsSubtitle}</p>
            </div>

            {labTests.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                    <span className="text-6xl mb-4 block">🧪</span>
                    <p className="text-xl font-medium">{t.noLabsYet}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {labTests.map(test => (
                        <div key={test.id} onClick={() => setSelected(test)} className="group cursor-pointer bg-white dark:bg-dark-card rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-transparent hover:border-brand-green/30">
                            {test.image && (
                                <div className="h-48 overflow-hidden">
                                    <img src={test.image} alt={test.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                            )}
                            <div className="p-6">
                                {test.category && <span className="text-[10px] font-black uppercase tracking-widest text-brand-green bg-brand-green/10 px-3 py-1 rounded-full">{test.category}</span>}
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mt-3 mb-1">{test.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{test.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-2xl text-brand-green">${test.price.toFixed(2)}</span>
                                    {test.duration && <span className="text-xs text-gray-400">⏱ {test.duration}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelected(null)}>
                    <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl max-w-lg w-full p-8" onClick={e => e.stopPropagation()}>
                        {selected.image && <img src={selected.image} className="w-full h-48 object-cover rounded-2xl mb-4" />}
                        <h2 className="text-3xl font-black mb-2">{selected.name}</h2>
                        <p className="text-brand-green font-black text-2xl mb-4">${selected.price.toFixed(2)}</p>
                        {selected.description && <p className="text-gray-600 dark:text-gray-300 mb-3">{selected.description}</p>}
                        {selected.duration && <p className="text-sm mb-2"><span className="font-bold">{t.duration}:</span> {selected.duration}</p>}
                        {selected.preparation && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-sm mb-4">
                                <span className="font-bold block mb-1">{t.preparation}</span>
                                {selected.preparation}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setSelected(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 py-3 rounded-xl font-bold">{t.close}</button>
                            <button onClick={() => handleBook(selected)} disabled={isActionLoading} className="flex-1 bg-brand-green text-white py-3 rounded-xl font-bold disabled:opacity-50">{isActionLoading ? '...' : t.bookTest}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lab;
