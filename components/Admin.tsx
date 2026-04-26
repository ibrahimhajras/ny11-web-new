
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CoachOnboardingData, MarketItem, UserRole, Language, KnowledgeBaseItem, User } from '../types';

type AdminTab = 'accounts' | 'coaches' | 'ai-config' | 'store';

const EMPTY_ITEM: Omit<MarketItem, 'id'> = {
    name: '', description: '', summary: '', price: 0, image: '', category: 'lunch',
    ingredients: '', caution: '',
    nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
};

const EMPTY_COACH: CoachOnboardingData = {
    name: '', email: '', phone: '', specialty: '', bio: '',
    experienceYears: '', clientsHelped: '', avatar: '', password: ''
};

const Admin: React.FC = () => {
    const {
        logout,
        users,
        coaches,
        registerCoach,
        updateCoach,
        deleteCoach,
        marketItems,
        addMarketItem,
        updateMarketItem,
        deleteMarketItem,
        language,
        showToast,
        siteConfig,
        updateSiteConfig,
        translations,
        updateTranslations,
        knowledgeBase,
        addKnowledgeItem,
        updateKnowledgeItem,
        deleteKnowledgeItem
    } = useAppContext();

    const t = translations[language];
    const [activeTab, setActiveTab] = useState<AdminTab>('accounts');

    // Coach State
    const [showAddCoachForm, setShowAddCoachForm] = useState(false);
    const [editingCoachId, setEditingCoachId] = useState<string | null>(null);
    const [newCoach, setNewCoach] = useState<CoachOnboardingData>(EMPTY_COACH);

    // Store State
    const [showItemForm, setShowItemForm] = useState(false);
    const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
    const [newItem, setNewItem] = useState<Omit<MarketItem, 'id'>>(EMPTY_ITEM);

    // AI Configuration State
    const [editingKBItem, setEditingKBItem] = useState<KnowledgeBaseItem | null>(null);
    const [newKBItem, setNewKBItem] = useState({ question: '', answer: '', keywords: '' });

    const handleCoachInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewCoach({ ...newCoach, [e.target.name]: e.target.value });
    };

    const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('nutrition.')) {
            const key = name.split('.')[1] as keyof NonNullable<MarketItem['nutrition']>;
            setNewItem(prev => ({
                ...prev,
                nutrition: { ...(prev.nutrition || { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }), [key]: value }
            }));
            return;
        }
        setNewItem(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
    };

    const isAR = language === Language.AR;

    const handleSaveCoach = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoach.name || !newCoach.phone || !newCoach.specialty) {
             showToast(isAR ? 'يرجى تعبئة الاسم ورقم الهاتف والتخصص.' : 'Please fill name, phone and specialty.', 'error');
             return;
        }
        if (editingCoachId) {
            await updateCoach(editingCoachId, newCoach);
            setEditingCoachId(null);
        } else {
            if (!newCoach.password || newCoach.password.length < 6) {
                showToast(isAR ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' : 'Password must be at least 6 characters.', 'error');
                return;
            }
            await registerCoach(newCoach);
        }
        setNewCoach(EMPTY_COACH);
        setShowAddCoachForm(false);
    };

    const handleEditCoachClick = (coach: any) => {
        const userDetails = users.find(u => u.id === coach.id);
        setNewCoach({
            name: coach.name,
            email: userDetails?.email || '',
            phone: userDetails?.phone || '',
            specialty: coach.specialty,
            bio: coach.bio,
            experienceYears: coach.experienceYears.toString(),
            clientsHelped: coach.clientsHelped.toString(),
            avatar: coach.avatar,
            password: ''
        });
        setEditingCoachId(coach.id);
        setShowAddCoachForm(true);
    };

    const handleDeleteCoach = async (id: string) => {
        if (window.confirm(isAR ? 'هل تريد حذف هذا المدرب؟' : 'Delete this coach?')) {
            await deleteCoach(id);
        }
    };

    const handleSaveKB = () => {
        if(!newKBItem.question || !newKBItem.answer) return;
        if (editingKBItem) {
            updateKnowledgeItem({
                id: editingKBItem.id,
                question: newKBItem.question,
                answer: newKBItem.answer,
                keywords: newKBItem.keywords.split(',').map(k => k.trim()).filter(k => k)
            });
            setEditingKBItem(null);
        } else {
            addKnowledgeItem({
                question: newKBItem.question,
                answer: newKBItem.answer,
                keywords: newKBItem.keywords.split(',').map(k => k.trim()).filter(k => k)
            });
        }
        setNewKBItem({ question: '', answer: '', keywords: '' });
    };

    const handleEditKBClick = (item: KnowledgeBaseItem) => {
        setEditingKBItem(item);
        setNewKBItem({
            question: item.question,
            answer: item.answer,
            keywords: item.keywords.join(', ')
        });
    };

    const handleDeleteKBItem = (id: string) => {
        if (window.confirm(t.confirmDelete || 'Are you sure?')) {
            deleteKnowledgeItem(id);
        }
    };

    const handleEditItemClick = (item: MarketItem) => {
        setEditingItem(item);
        setNewItem({
            name: item.name,
            description: item.description,
            summary: item.summary || '',
            price: item.price,
            image: item.image,
            category: item.category,
            ingredients: item.ingredients || '',
            caution: item.caution || '',
            nutrition: item.nutrition || { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
        });
        setShowItemForm(true);
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.description || !newItem.price) {
            showToast(isAR ? 'يرجى تعبئة الاسم والوصف والسعر.' : 'Please fill name, description and price.', 'error');
            return;
        }
        if (editingItem) {
            await updateMarketItem({ ...newItem, id: editingItem.id });
            setEditingItem(null);
        } else {
            await addMarketItem(newItem);
        }
        setNewItem(EMPTY_ITEM);
        setShowItemForm(false);
    };

    const handleDeleteItem = (id: string) => {
        if (window.confirm(t.confirmDelete || 'Are you sure?')) {
            deleteMarketItem(id);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'accounts':
                return (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-2xl font-bold mb-4 px-2">{t.users}</h3>
                        <div className="hidden md:block bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="border-b dark:border-gray-700">
                                    <tr>
                                        <th className="p-4">{t.name}</th>
                                        <th className="p-4">{t.whatsYourPhone}</th>
                                        <th className="p-4">{t.yourGoal}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => u.role === UserRole.USER && u.id !== 'guest').map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="p-4 flex items-center gap-2">
                                                 <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} className="w-8 h-8 rounded-full" />
                                                 {user.name}
                                            </td>
                                            <td className="p-4">{user.phone}</td>
                                            <td className="p-4 capitalize">{user.goal?.replace('_', ' ') || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="md:hidden space-y-3 px-2">
                            {users.filter(u => u.role === UserRole.USER && u.id !== 'guest').map(user => (
                                <div key={user.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} className="w-10 h-10 rounded-full" />
                                        <div className="flex-1">
                                            <p className="font-bold">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.phone}</p>
                                        </div>
                                        <div className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-1 rounded font-bold uppercase">{user.goal}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'coaches':
                 return (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-2xl font-bold">{t.existingCoaches}</h3>
                            <button onClick={() => { setEditingCoachId(null); setNewCoach(EMPTY_COACH); setShowAddCoachForm(!showAddCoachForm); }} className="bg-brand-green text-white py-2 px-6 rounded-full font-bold shadow-md">
                                {showAddCoachForm ? t.close : t.addNewCoach}
                            </button>
                        </div>
                        {showAddCoachForm && (
                           <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-brand-green/20">
                               <form onSubmit={handleSaveCoach} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input type="text" name="name" value={newCoach.name} onChange={handleCoachInputChange} placeholder={t.name} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                  <input type="text" name="phone" value={newCoach.phone} onChange={handleCoachInputChange} placeholder={t.phonePlaceholder} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                  <input type="email" name="email" value={newCoach.email} onChange={handleCoachInputChange} placeholder={isAR ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                  <input type="text" name="password" value={newCoach.password} onChange={handleCoachInputChange} placeholder={editingCoachId ? (isAR ? 'كلمة المرور (لا تتغير عند التعديل)' : 'Password (unchanged when editing)') : (isAR ? 'كلمة مرور المدرب (6 أحرف+)' : 'Coach password (6+ chars)')} disabled={!!editingCoachId} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50" />
                                  <input type="text" name="specialty" value={newCoach.specialty} onChange={handleCoachInputChange} placeholder={t.specialty} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                  <input type="number" name="experienceYears" value={newCoach.experienceYears} onChange={handleCoachInputChange} placeholder={t.experience} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                  <input type="number" name="clientsHelped" value={newCoach.clientsHelped} onChange={handleCoachInputChange} placeholder={t.clientsHelped} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                  <input type="url" name="avatar" value={newCoach.avatar} onChange={handleCoachInputChange} placeholder={t.avatarUrl} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                  <textarea name="bio" value={newCoach.bio} onChange={handleCoachInputChange} placeholder={t.bio} className="md:col-span-2 w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" rows={3} />
                                  {!editingCoachId && (
                                      <p className="md:col-span-2 text-xs text-gray-500 dark:text-gray-400 -mt-1">
                                          {isAR
                                              ? 'سيتم تفعيل حساب المدرب فوراً ليتمكن من تسجيل الدخول برقم هاتفه وكلمة المرور والرد على المحادثات.'
                                              : 'The coach account is activated immediately. The coach can sign in with their phone and password to reply to chats.'}
                                      </p>
                                  )}
                                  <button type="submit" className="md:col-span-2 bg-brand-green text-white py-3 rounded-xl font-bold">{editingCoachId ? t.updateCoach : t.addCoach}</button>
                               </form>
                           </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {coaches.map(coach => (
                                <div key={coach.id} className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border dark:border-gray-800 flex items-center gap-4">
                                    <img src={coach.avatar || `https://i.pravatar.cc/150?u=${coach.id}`} className="w-16 h-16 rounded-full object-cover border-2 border-brand-green/20" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate">{coach.name}</p>
                                        <p className="text-xs text-brand-green font-bold uppercase truncate">{coach.specialty}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleEditCoachClick(coach)} className="text-blue-500 font-bold text-sm">{t.edit}</button>
                                        <button onClick={() => handleDeleteCoach(coach.id)} className="text-red-500 font-bold text-sm">{t.delete}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 );
            case 'ai-config':
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-lg border border-brand-green/20">
                            <h3 className="text-2xl font-bold mb-4">AI Integration</h3>
                            <p className="text-sm text-gray-500 mb-4">AI is powered by Gemini. Knowledge base pairs below help customize AI Coach responses.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg">
                                <h3 className="text-xl font-bold mb-4">{t.existingQA}</h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {knowledgeBase.map(item => (
                                        <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
                                            <p className="font-bold text-brand-green">{item.question}</p>
                                            <p className="text-sm mt-1">{item.answer}</p>
                                            <div className="flex gap-4 mt-3 pt-3 border-t dark:border-gray-700 text-xs">
                                                <button onClick={() => handleEditKBClick(item)} className="text-blue-500 font-bold">{t.edit}</button>
                                                <button onClick={() => handleDeleteKBItem(item.id)} className="text-red-500 font-bold">{t.delete}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-brand-green/10">
                                <h3 className="text-xl font-bold mb-6">{editingKBItem ? t.updateQA : t.addNewQA}</h3>
                                <div className="space-y-4">
                                    <input type="text" value={newKBItem.question} onChange={(e) => setNewKBItem({...newKBItem, question: e.target.value})} placeholder={t.question} className="w-full p-4 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <textarea value={newKBItem.answer} onChange={(e) => setNewKBItem({...newKBItem, answer: e.target.value})} placeholder={t.answer} rows={4} className="w-full p-4 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <input type="text" value={newKBItem.keywords} onChange={(e) => setNewKBItem({...newKBItem, keywords: e.target.value})} placeholder={t.keywords} className="w-full p-4 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <button onClick={handleSaveKB} className="w-full bg-brand-green text-white py-4 rounded-xl font-bold shadow-md">
                                        {editingKBItem ? t.updateQA : t.addQA}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'store':
                return (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex justify-between items-center px-2">
                             <h3 className="text-2xl font-bold">{t.storeManagement}</h3>
                             <button onClick={() => { setEditingItem(null); setNewItem(EMPTY_ITEM); setShowItemForm(!showItemForm); }} className="bg-brand-green text-white py-2 px-6 rounded-full font-bold shadow-md">
                                {showItemForm ? t.close : t.addNewItem}
                             </button>
                        </div>
                        {showItemForm && (
                            <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-brand-green/20">
                                <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" name="name" value={newItem.name} onChange={handleItemInputChange} placeholder={t.itemName} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <input type="number" step="0.01" name="price" value={newItem.price} onChange={handleItemInputChange} placeholder={t.price} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <input type="text" name="summary" value={newItem.summary} onChange={handleItemInputChange} placeholder={isAR ? 'وصف قصير (اختياري)' : 'Short summary (optional)'} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <select name="category" value={newItem.category} onChange={handleItemInputChange} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700">
                                        <option value="breakfast">{isAR ? 'فطور' : 'Breakfast'}</option>
                                        <option value="lunch">{isAR ? 'غداء' : 'Lunch'}</option>
                                        <option value="dinner">{isAR ? 'عشاء' : 'Dinner'}</option>
                                        <option value="drink">{t.drink}</option>
                                        <option value="snack">{isAR ? 'وجبة خفيفة' : 'Snack'}</option>
                                    </select>
                                    <input type="url" name="image" value={newItem.image} onChange={handleItemInputChange} placeholder={t.imageUrl} className="md:col-span-2 w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <textarea name="description" value={newItem.description} onChange={handleItemInputChange} placeholder={t.description} rows={3} className="md:col-span-2 w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <textarea name="ingredients" value={newItem.ingredients} onChange={handleItemInputChange} placeholder={isAR ? 'المكونات' : 'Ingredients'} rows={2} className="md:col-span-2 w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <textarea name="caution" value={newItem.caution} onChange={handleItemInputChange} placeholder={isAR ? 'تنبيهات الحساسية' : 'Allergy / caution notes'} rows={2} className="md:col-span-2 w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <input type="text" name="nutrition.servingSize" value={newItem.nutrition?.servingSize || ''} onChange={handleItemInputChange} placeholder={isAR ? 'حجم الحصة' : 'Serving size'} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                        <input type="text" name="nutrition.energy" value={newItem.nutrition?.energy || ''} onChange={handleItemInputChange} placeholder={isAR ? 'طاقة' : 'Energy'} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                        <input type="text" name="nutrition.protein" value={newItem.nutrition?.protein || ''} onChange={handleItemInputChange} placeholder={isAR ? 'بروتين' : 'Protein'} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                        <input type="text" name="nutrition.carbs" value={newItem.nutrition?.carbs || ''} onChange={handleItemInputChange} placeholder={isAR ? 'كربوهيدرات' : 'Carbs'} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                        <input type="text" name="nutrition.fat" value={newItem.nutrition?.fat || ''} onChange={handleItemInputChange} placeholder={isAR ? 'دهون' : 'Fat'} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    </div>
                                    <button type="submit" className="md:col-span-2 bg-brand-green text-white py-3 rounded-xl font-bold">{editingItem ? t.updateItem : t.addItem}</button>
                                </form>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {marketItems.map(item => (
                                <div key={item.id} className="bg-white dark:bg-dark-card p-4 rounded-3xl shadow-sm border dark:border-gray-800">
                                    <img src={item.image} className="w-full h-32 object-cover rounded-2xl mb-3" />
                                    <p className="font-bold text-sm truncate">{item.name}</p>
                                    <p className="text-brand-green font-bold text-xs">${item.price}</p>
                                    <div className="flex gap-4 mt-3">
                                        <button onClick={() => handleEditItemClick(item)} className="text-blue-500 font-bold text-xs uppercase">{t.edit}</button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 font-bold text-xs uppercase">{t.delete}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 md:p-8">
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black italic text-brand-green">NY11 ADMIN</h1>
                <button onClick={logout} className="bg-red-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">{t.logout}</button>
            </header>
            <div className="max-w-7xl mx-auto mb-8 flex overflow-x-auto pb-4 gap-2 scrollbar-hide">
                <button onClick={() => setActiveTab('accounts')} className={`px-6 py-3 rounded-full font-bold whitespace-nowrap ${activeTab === 'accounts' ? 'bg-brand-green text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{t.users}</button>
                <button onClick={() => setActiveTab('coaches')} className={`px-6 py-3 rounded-full font-bold whitespace-nowrap ${activeTab === 'coaches' ? 'bg-brand-green text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{t.coaches}</button>
                <button onClick={() => setActiveTab('ai-config')} className={`px-6 py-3 rounded-full font-bold whitespace-nowrap ${activeTab === 'ai-config' ? 'bg-brand-green text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{t.aiConfig}</button>
                <button onClick={() => setActiveTab('store')} className={`px-6 py-3 rounded-full font-bold whitespace-nowrap ${activeTab === 'store' ? 'bg-brand-green text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{t.storeManagement}</button>
            </div>
            <div className="max-w-7xl mx-auto pb-20">{renderContent()}</div>
        </div>
    );
};

export default Admin;
