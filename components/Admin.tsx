
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { CoachOnboardingData, MarketItem, UserRole, KnowledgeBaseItem, LabTest, MarketCategory } from '../types';

type AdminTab = 'accounts' | 'coaches' | 'ai-config' | 'store' | 'labs' | 'stats';

const Admin: React.FC = () => {
    const {
        logout,
        users,
        coaches,
        registerCoach,
        updateCoach,
        marketItems,
        addMarketItem,
        updateMarketItem,
        deleteMarketItem,
        labTests,
        addLabTest,
        updateLabTest,
        deleteLabTest,
        orders,
        language,
        showToast,
        translations,
        knowledgeBase,
        addKnowledgeItem,
        updateKnowledgeItem,
        deleteKnowledgeItem
    } = useAppContext();

    const t = translations[language];
    const [activeTab, setActiveTab] = useState<AdminTab>('stats');

    // Coach State
    const [showAddCoachForm, setShowAddCoachForm] = useState(false);
    const [editingCoachId, setEditingCoachId] = useState<string | null>(null);
    const emptyCoach: CoachOnboardingData = { name: '', email: '', phone: '', specialty: '', bio: '', experienceYears: '', clientsHelped: '', avatar: '', password: '' };
    const [newCoach, setNewCoach] = useState<CoachOnboardingData>(emptyCoach);

    // Store State
    const emptyItem: Omit<MarketItem, 'id'> = {
        name: '', description: '', summary: '', price: 0, image: '', category: 'breakfast',
        ingredients: '', caution: '',
        nutrition: { servingSize: '', energy: '', protein: '', carbs: '', fat: '' }
    };
    const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
    const [showItemForm, setShowItemForm] = useState(false);
    const [newItem, setNewItem] = useState<Omit<MarketItem, 'id'>>(emptyItem);

    // Lab State
    const emptyLab: Omit<LabTest, 'id'> = { name: '', description: '', price: 0, image: '', category: 'general', duration: '', preparation: '' };
    const [editingLab, setEditingLab] = useState<LabTest | null>(null);
    const [showLabForm, setShowLabForm] = useState(false);
    const [newLab, setNewLab] = useState<Omit<LabTest, 'id'>>(emptyLab);

    // AI Configuration State
    const [editingKBItem, setEditingKBItem] = useState<KnowledgeBaseItem | null>(null);
    const [newKBItem, setNewKBItem] = useState({ question: '', answer: '', keywords: '' });

    const handleCoachInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewCoach({ ...newCoach, [e.target.name]: e.target.value });
    };

    const handleSaveCoach = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoach.name || !newCoach.phone || !newCoach.specialty) {
            showToast('Please fill all required fields.', 'error');
            return;
        }
        if (editingCoachId) {
            updateCoach(editingCoachId, newCoach);
            setEditingCoachId(null);
        } else {
            if (!newCoach.password || newCoach.password.length < 6) {
                showToast('Password must be at least 6 characters.', 'error');
                return;
            }
            if (!newCoach.email) {
                showToast('Email is required for new coaches.', 'error');
                return;
            }
            registerCoach(newCoach);
        }
        setNewCoach(emptyCoach);
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

    const handleSaveKB = () => {
        if (!newKBItem.question || !newKBItem.answer) return;
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
        setShowItemForm(true);
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
    };

    const handleDeleteItem = (id: string) => {
        if (window.confirm(t.confirmDelete || 'Are you sure?')) {
            deleteMarketItem(id);
        }
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.image || newItem.price <= 0) {
            showToast('Please provide name, image, and a valid price.', 'error');
            return;
        }
        if (editingItem) {
            await updateMarketItem({ id: editingItem.id, ...newItem });
        } else {
            await addMarketItem(newItem);
        }
        setEditingItem(null);
        setShowItemForm(false);
        setNewItem(emptyItem);
    };

    const handleEditLabClick = (lab: LabTest) => {
        setEditingLab(lab);
        setShowLabForm(true);
        setNewLab({
            name: lab.name,
            description: lab.description,
            price: lab.price,
            image: lab.image || '',
            category: lab.category || 'general',
            duration: lab.duration || '',
            preparation: lab.preparation || ''
        });
    };

    const handleSaveLab = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLab.name || newLab.price <= 0) {
            showToast('Please provide a name and valid price.', 'error');
            return;
        }
        if (editingLab) {
            await updateLabTest({ id: editingLab.id, ...newLab });
        } else {
            await addLabTest(newLab);
        }
        setEditingLab(null);
        setShowLabForm(false);
        setNewLab(emptyLab);
    };

    const handleDeleteLab = (id: string) => {
        if (window.confirm(t.confirmDelete || 'Are you sure?')) {
            deleteLabTest(id);
        }
    };

    // Statistics
    const stats = useMemo(() => {
        const totalUsers = users.filter(u => u.role === UserRole.USER).length;
        const totalCoaches = coaches.length;
        const totalProducts = marketItems.length;
        const totalLabs = labTests.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        return { totalUsers, totalCoaches, totalProducts, totalLabs, totalOrders, totalRevenue };
    }, [users, coaches, marketItems, labTests, orders]);

    const categories: MarketCategory[] = ['breakfast', 'lunch', 'dinner', 'drink', 'snack'];

    const renderContent = () => {
        switch (activeTab) {
            case 'stats':
                return (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-2xl font-bold mb-4 px-2">{t.adminStatistics}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard icon="ph-users" label={t.users} value={stats.totalUsers} color="blue" />
                            <StatCard icon="ph-chalkboard-teacher" label={t.coaches} value={stats.totalCoaches} color="green" />
                            <StatCard icon="ph-shopping-bag" label={t.products} value={stats.totalProducts} color="orange" />
                            <StatCard icon="ph-test-tube" label={t.labTests} value={stats.totalLabs} color="purple" />
                            <StatCard icon="ph-receipt" label={t.totalOrders} value={stats.totalOrders} color="pink" />
                            <StatCard icon="ph-currency-dollar" label={t.revenue} value={`$${stats.totalRevenue.toFixed(2)}`} color="green" />
                        </div>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm">
                            <h4 className="font-bold mb-4">{t.recentOrders}</h4>
                            {orders.length === 0 ? (
                                <p className="text-gray-500 text-sm">{t.noOrders}</p>
                            ) : (
                                <div className="space-y-2">
                                    {orders.slice(0, 8).map(o => (
                                        <div key={o.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <div>
                                                <p className="font-bold text-sm">#{o.id.slice(0, 8)}</p>
                                                <p className="text-xs text-gray-500">{o.timestamp} · {o.items.length} item(s)</p>
                                            </div>
                                            <span className="font-black text-brand-green">${o.total.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
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
                            <button onClick={() => { setEditingCoachId(null); setNewCoach(emptyCoach); setShowAddCoachForm(!showAddCoachForm); }} className="bg-brand-green text-white py-2 px-6 rounded-full font-bold shadow-md">
                                {showAddCoachForm ? t.close : t.addNewCoach}
                            </button>
                        </div>
                        {showAddCoachForm && (
                            <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-brand-green/20">
                                <form onSubmit={handleSaveCoach} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" name="name" required value={newCoach.name} onChange={handleCoachInputChange} placeholder={t.name} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <input type="email" name="email" value={newCoach.email} onChange={handleCoachInputChange} placeholder="Email (login)" disabled={!!editingCoachId} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 disabled:opacity-60" />
                                    <input type="text" name="phone" required value={newCoach.phone} onChange={handleCoachInputChange} placeholder={t.phonePlaceholder} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    {!editingCoachId && (
                                        <input type="text" name="password" value={newCoach.password} onChange={handleCoachInputChange} placeholder="Password (min 6)" className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    )}
                                    <input type="text" name="specialty" required value={newCoach.specialty} onChange={handleCoachInputChange} placeholder={t.specialty} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <input type="number" name="experienceYears" value={newCoach.experienceYears} onChange={handleCoachInputChange} placeholder={t.experience} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <input type="number" name="clientsHelped" value={newCoach.clientsHelped} onChange={handleCoachInputChange} placeholder={t.clients} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <input type="text" name="avatar" value={newCoach.avatar} onChange={handleCoachInputChange} placeholder={t.avatarUrl} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <textarea name="bio" value={newCoach.bio} onChange={handleCoachInputChange} placeholder={t.bio} className="md:col-span-2 w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" rows={3} />
                                    <button type="submit" className="md:col-span-2 bg-brand-green text-white py-3 rounded-xl font-bold">{editingCoachId ? t.updateCoach : t.addCoach}</button>
                                </form>
                                {editingCoachId && (
                                    <p className="text-xs text-gray-500 mt-3">{t.coachPasswordNote}</p>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {coaches.map(coach => {
                                const userDetails = users.find(u => u.id === coach.id);
                                return (
                                    <div key={coach.id} className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border dark:border-gray-800 flex items-center gap-4">
                                        <img src={coach.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-brand-green/20" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{coach.name}</p>
                                            <p className="text-xs text-brand-green font-bold uppercase truncate">{coach.specialty}</p>
                                            {userDetails?.email && <p className="text-[10px] text-gray-500 truncate">{userDetails.email}</p>}
                                        </div>
                                        <button onClick={() => handleEditCoachClick(coach)} className="text-blue-500 font-bold text-sm">{t.edit}</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'ai-config':
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-lg border border-brand-green/20">
                            <h3 className="text-2xl font-bold mb-4">AI Integration</h3>
                            <p className="text-sm text-gray-500 mb-4">AI is powered by Groq. Knowledge base pairs help customize AI Coach responses.</p>
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
                                    <input type="text" value={newKBItem.question} onChange={(e) => setNewKBItem({ ...newKBItem, question: e.target.value })} placeholder={t.question} className="w-full p-4 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <textarea value={newKBItem.answer} onChange={(e) => setNewKBItem({ ...newKBItem, answer: e.target.value })} placeholder={t.answer} rows={4} className="w-full p-4 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                    <input type="text" value={newKBItem.keywords} onChange={(e) => setNewKBItem({ ...newKBItem, keywords: e.target.value })} placeholder={t.keywords} className="w-full p-4 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
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
                            <button onClick={() => { setEditingItem(null); setNewItem(emptyItem); setShowItemForm(!showItemForm); }} className="bg-brand-green text-white py-2 px-6 rounded-full font-bold shadow-md">
                                {showItemForm ? t.close : t.addNewItem}
                            </button>
                        </div>
                        {showItemForm && (
                            <form onSubmit={handleSaveItem} className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-brand-green/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" required placeholder={t.itemName} value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="number" step="0.01" required placeholder={t.price} value={newItem.price || ''} onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="text" required placeholder={t.imageUrl} value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} className="md:col-span-2 p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value as MarketCategory })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700">
                                    {categories.map(c => <option key={c} value={c}>{(t as any)['cat_' + c] || c}</option>)}
                                </select>
                                <input type="text" placeholder={t.summary} value={newItem.summary} onChange={e => setNewItem({ ...newItem, summary: e.target.value })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <textarea placeholder={t.description} value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="md:col-span-2 p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" rows={2} />
                                <textarea placeholder={t.ingredients} value={newItem.ingredients || ''} onChange={e => setNewItem({ ...newItem, ingredients: e.target.value })} className="md:col-span-2 p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" rows={2} />
                                <input type="text" placeholder={t.servingSize} value={newItem.nutrition?.servingSize} onChange={e => setNewItem({ ...newItem, nutrition: { ...newItem.nutrition!, servingSize: e.target.value } })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="text" placeholder={t.energy} value={newItem.nutrition?.energy} onChange={e => setNewItem({ ...newItem, nutrition: { ...newItem.nutrition!, energy: e.target.value } })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="text" placeholder={t.protein} value={newItem.nutrition?.protein} onChange={e => setNewItem({ ...newItem, nutrition: { ...newItem.nutrition!, protein: e.target.value } })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="text" placeholder={t.carbohydrates} value={newItem.nutrition?.carbs} onChange={e => setNewItem({ ...newItem, nutrition: { ...newItem.nutrition!, carbs: e.target.value } })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="text" placeholder={t.fat} value={newItem.nutrition?.fat} onChange={e => setNewItem({ ...newItem, nutrition: { ...newItem.nutrition!, fat: e.target.value } })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <textarea placeholder={t.caution} value={newItem.caution || ''} onChange={e => setNewItem({ ...newItem, caution: e.target.value })} className="md:col-span-2 p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" rows={2} />
                                <button type="submit" className="md:col-span-2 bg-brand-green text-white py-3 rounded-xl font-bold">{editingItem ? t.updateItem : t.addItem}</button>
                            </form>
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
            case 'labs':
                return (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-2xl font-bold">{t.labsManagement}</h3>
                            <button onClick={() => { setEditingLab(null); setNewLab(emptyLab); setShowLabForm(!showLabForm); }} className="bg-brand-green text-white py-2 px-6 rounded-full font-bold shadow-md">
                                {showLabForm ? t.close : t.addNewLab}
                            </button>
                        </div>
                        {showLabForm && (
                            <form onSubmit={handleSaveLab} className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-brand-green/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" required placeholder={t.itemName} value={newLab.name} onChange={e => setNewLab({ ...newLab, name: e.target.value })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="number" step="0.01" required placeholder={t.price} value={newLab.price || ''} onChange={e => setNewLab({ ...newLab, price: parseFloat(e.target.value) || 0 })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="text" placeholder={t.imageUrl} value={newLab.image} onChange={e => setNewLab({ ...newLab, image: e.target.value })} className="md:col-span-2 p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="text" placeholder={t.category} value={newLab.category} onChange={e => setNewLab({ ...newLab, category: e.target.value })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <input type="text" placeholder={t.duration} value={newLab.duration} onChange={e => setNewLab({ ...newLab, duration: e.target.value })} className="p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" />
                                <textarea placeholder={t.description} value={newLab.description} onChange={e => setNewLab({ ...newLab, description: e.target.value })} className="md:col-span-2 p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" rows={2} />
                                <textarea placeholder={t.preparation} value={newLab.preparation} onChange={e => setNewLab({ ...newLab, preparation: e.target.value })} className="md:col-span-2 p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" rows={2} />
                                <button type="submit" className="md:col-span-2 bg-brand-green text-white py-3 rounded-xl font-bold">{editingLab ? t.updateItem : t.addItem}</button>
                            </form>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {labTests.length === 0 && <p className="text-gray-500">{t.noLabsYet}</p>}
                            {labTests.map(lab => (
                                <div key={lab.id} className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border dark:border-gray-800">
                                    {lab.image && <img src={lab.image} className="w-full h-32 object-cover rounded-2xl mb-3" />}
                                    <p className="font-bold">{lab.name}</p>
                                    <p className="text-xs text-gray-500 mb-2">{lab.category}</p>
                                    <p className="text-brand-green font-black">${lab.price}</p>
                                    <div className="flex gap-4 mt-3">
                                        <button onClick={() => handleEditLabClick(lab)} className="text-blue-500 font-bold text-xs uppercase">{t.edit}</button>
                                        <button onClick={() => handleDeleteLab(lab.id)} className="text-red-500 font-bold text-xs uppercase">{t.delete}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    const tabs: { id: AdminTab; label: string }[] = [
        { id: 'stats', label: t.adminStatistics },
        { id: 'accounts', label: t.users },
        { id: 'coaches', label: t.coaches },
        { id: 'store', label: t.storeManagement },
        { id: 'labs', label: t.labsManagement },
        { id: 'ai-config', label: t.aiConfig },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 md:p-8">
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black italic text-brand-green">NY11 ADMIN</h1>
                <button onClick={logout} className="bg-red-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">{t.logout}</button>
            </header>
            <div className="max-w-7xl mx-auto mb-8 flex overflow-x-auto pb-4 gap-2 scrollbar-hide">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-full font-bold whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-green text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{tab.label}</button>
                ))}
            </div>
            <div className="max-w-7xl mx-auto pb-20">{renderContent()}</div>
        </div>
    );
};

const StatCard: React.FC<{ icon: string; label: string; value: number | string; color: string }> = ({ icon, label, value, color }) => {
    const colorMap: Record<string, string> = {
        blue: 'from-blue-400 to-blue-600',
        green: 'from-brand-green to-brand-green-dark',
        orange: 'from-orange-400 to-orange-600',
        purple: 'from-purple-400 to-purple-600',
        pink: 'from-pink-400 to-pink-600',
    };
    return (
        <div className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border dark:border-gray-800">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} text-white flex items-center justify-center mb-3`}>
                <i className={`ph ${icon} text-2xl`}></i>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
    );
};

export default Admin;
