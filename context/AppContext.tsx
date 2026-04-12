
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { DialogConfig } from '../components/CustomDialog';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  User, Language, Theme, CartItem, Plan, DailyPlan, QuoteStatus, 
  Message, MessageSender, UserRole, Goal, Coach, CoachOnboardingData, 
  Notification, MarketItem, SiteConfig, KnowledgeBaseItem, Order 
} from '../types';
import { 
  COACHES, MARKET_ITEMS, GOAL_PLANS, TRANSLATIONS, 
  BANNER_IMAGES, DEFAULT_SITE_CONFIG, DEFAULT_KNOWLEDGE_BASE 
} from '../constants';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  deleteUser 
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, collection, onSnapshot, 
  addDoc, updateDoc, deleteDoc, query, where, orderBy 
} from 'firebase/firestore';
import { format } from 'date-fns';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}


interface AppContextType {
    currentUser: User | null;
    users: User[];
    coaches: Coach[];
    language: Language;
    theme: Theme;
    cart: CartItem[];
    toasts: Toast[];
    plan: Plan;
    notifications: Notification[];
    isLanguageSelected: boolean;
    marketItems: MarketItem[];
    orders: Order[];
    bannerImages: string[];
    siteConfig: SiteConfig;
    translations: typeof TRANSLATIONS;
    knowledgeBase: KnowledgeBaseItem[];
    isLoading: boolean;
    isActionLoading: boolean;
    isLockedOut: boolean;
    dialog: DialogConfig | null;
    showDialog: (config: DialogConfig) => void;
    dismissDialog: () => void;
    login: (phone: string, password?: string) => Promise<boolean>;
    loginAsGuest: () => void;
    logout: () => void;
    register: (user: Omit<User, 'id' | 'role' | 'avatar' | 'email'>, password?: string) => Promise<void>;
    registerCoach: (data: CoachOnboardingData) => Promise<void>;
    updateCoach: (id: string, data: CoachOnboardingData) => Promise<void>;
    setLanguage: (lang: Language) => void;
    setIsLanguageSelected: (isSelected: boolean) => void;
    setTheme: (theme: Theme) => void;
    addToCart: (item: CartItem['id']) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    purchaseCart: () => Promise<void>;
    showToast: (message: string, type: 'success' | 'error') => void;
    updatePlan: (newPlan: Plan) => void;
    updateDailyPlan: (date: string, dailyPlan: DailyPlan) => void;
    updateQuoteStatus: (messageId: string, status: QuoteStatus, conversation: Message[], setConversation: React.Dispatch<React.SetStateAction<Message[]>>) => void;
    updateUserProfile: (profileData: Partial<Omit<User, 'id' | 'role' | 'email'>>) => void;
    showNotification: (notification: Omit<Notification, 'id'>) => void;
    dismissNotification: (id: number) => void;
    addMarketItem: (item: Omit<MarketItem, 'id'>) => Promise<void>;
    updateMarketItem: (item: MarketItem) => Promise<void>;
    deleteMarketItem: (itemId: string) => Promise<void>;
    addBannerImage: (url: string) => void;
    deleteBannerImage: (index: number) => void;
    updateBannerImage: (index: number, url: string) => void;
    updateTranslations: (newTranslations: typeof TRANSLATIONS) => void;
    updateSiteConfig: (newConfig: Partial<SiteConfig>) => void;
    addKnowledgeItem: (item: Omit<KnowledgeBaseItem, 'id'>) => Promise<void>;
    updateKnowledgeItem: (item: KnowledgeBaseItem) => Promise<void>;
    deleteKnowledgeItem: (id: string) => Promise<void>;
    getAIResponse: (userQuestion: string) => Promise<string>;
    generatePlanWithAI: (user: User) => Promise<void>;
    deleteAccount: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_PHONES = ['000000000', '00000000', '0597288408'];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [language, setLanguage] = useState<Language>(Language.AR);
    const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(true);
    const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [plan, setPlan] = useState<Plan>({});
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [bannerImages, setBannerImages] = useState<string[]>(BANNER_IMAGES);
    const [translations, setTranslations] = useState(TRANSLATIONS);
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>(DEFAULT_KNOWLEDGE_BASE);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [dialog, setDialog] = useState<DialogConfig | null>(null);

    const showDialog = useCallback((config: DialogConfig) => {
        setDialog(config);
    }, []);

    const dismissDialog = useCallback(() => {
        setDialog(null);
    }, []);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 4000);
    }, []);

    const syncAdminData = async (uid: string, phone: string): Promise<User> => {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        const email = `${phone}@ny11.com`;
        
        let userData: User;
        if (!userDoc.exists()) {
            userData = { id: uid, name: "Admin NY11", phone, email, role: UserRole.ADMIN };
            await setDoc(userDocRef, userData);
        } else {
            userData = userDoc.data() as User;
            if (userData.role !== UserRole.ADMIN) {
                await updateDoc(userDocRef, { role: UserRole.ADMIN });
                userData.role = UserRole.ADMIN;
            }
        }
        return userData;
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
            try {
                if (fbUser) {
                    const phone = fbUser.email?.split('@')[0] || '';
                    if (ADMIN_PHONES.includes(phone)) {
                        const adminData = await syncAdminData(fbUser.uid, phone);
                        setCurrentUser({ ...adminData, role: UserRole.ADMIN });
                    } else {
                        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data() as User;
                            setCurrentUser(userData);
                            const planDoc = await getDoc(doc(db, "plans", fbUser.uid));
                            if (planDoc.exists()) setPlan(planDoc.data().plan || {});
                        } else {
                            // User exists in Auth but not in Firestore (likely due to a half-completed deletion)
                            // Recreate a minimal document so they can log in and finish the deletion if desired
                            const phoneStr = fbUser.email?.split('@')[0] || 'Unknown';
                            const rescueUser: User = { 
                                id: fbUser.uid, 
                                name: phoneStr, 
                                email: fbUser.email || `${phoneStr}@ny11.com`, 
                                phone: phoneStr, 
                                role: UserRole.USER 
                            };
                            await setDoc(doc(db, "users", fbUser.uid), rescueUser);
                            setCurrentUser(rescueUser);
                            
                            // Let the user know some data was reset
                            showToast(
                                language === Language.AR 
                                ? "تم استعادة حسابك جزئياً بسبب عملية حذف غير مكتملة." 
                                : "Your account was partially recovered from an incomplete deletion.", 
                                "error"
                            );
                        }
                    }
                } else {
                    setCurrentUser(null);
                    setPlan({});
                }
            } catch (err) {
                console.error("Auth initialization error:", err);
            } finally {
                setIsLoading(false);
            }
        });

        // Snapshots now include error handlers to prevent hanging the app on permission errors
        const unsubscribeMarket = onSnapshot(collection(db, "marketItems"), 
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MarketItem[];
                setMarketItems(items.length > 0 ? items : MARKET_ITEMS);
            },
            (err) => console.warn("Market access restricted:", err.message)
        );

        const unsubscribeCoaches = onSnapshot(collection(db, "coaches"), 
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Coach[];
                setCoaches(items.length > 0 ? items : COACHES);
            },
            (err) => console.warn("Coaches access restricted:", err.message)
        );

        const unsubscribeKB = onSnapshot(collection(db, "knowledgeBase"), 
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as KnowledgeBaseItem[];
                setKnowledgeBase(items.length > 0 ? items : DEFAULT_KNOWLEDGE_BASE);
            },
            (err) => console.warn("Knowledge base access restricted:", err.message)
        );

        const unsubscribeSettings = onSnapshot(doc(db, "settings", "general"), 
            (doc) => {
                if (doc.exists()) {
                    setSiteConfig(doc.data() as SiteConfig);
                }
            },
            (err) => console.warn("Global settings restricted:", err.message)
        );

        return () => {
            unsubscribeAuth();
            unsubscribeMarket();
            unsubscribeCoaches();
            unsubscribeKB();
            unsubscribeSettings();
        };
    }, []);

    useEffect(() => {
        if (!currentUser || currentUser.id === 'guest') {
            setOrders([]);
            return;
        }

        const unsubscribeOrders = onSnapshot(
            query(collection(db, "orders"), where("userId", "==", currentUser.id), orderBy("timestamp", "desc")),
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
                setOrders(items);
            },
            (err) => console.warn("Orders access restricted:", err.message)
        );

        return () => unsubscribeOrders();
    }, [currentUser, language]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== UserRole.ADMIN) {
            setUsers([]);
            return;
        }

        const unsubscribeUsers = onSnapshot(collection(db, "users"), 
            (snapshot) => {
                setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]);
            },
            (err) => console.warn("Admin only access restricted:", err.message)
        );

        return () => unsubscribeUsers();
    }, [currentUser]);

    const login = async (phone: string, password?: string) => {
        if (isLockedOut) return false;
        setIsActionLoading(true);
        try {
            const email = `${phone.trim()}@ny11.com`;
            const pass = password || "default123";
            await signInWithEmailAndPassword(auth, email, pass);
            return true;
        } catch (error: any) {
            const isAR = language === Language.AR;

            if (error.code === 'auth/too-many-requests') {
                setIsLockedOut(true);
                setTimeout(() => setIsLockedOut(false), 60000);
                showDialog({
                    type: 'warning',
                    title: isAR ? 'محاولات كثيرة جداً' : 'Too Many Attempts',
                    message: isAR
                        ? 'لقد تجاوزت الحد المسموح به من محاولات تسجيل الدخول. يرجى الانتظار دقيقة واحدة ثم المحاولة مجدداً.'
                        : 'You have exceeded the allowed number of login attempts. Please wait 1 minute before trying again.',
                    confirmLabel: isAR ? 'حسناً' : 'Got it',
                });
            } else if (
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/invalid-email'
            ) {
                showDialog({
                    type: 'error',
                    title: isAR ? 'الحساب غير موجود' : 'Account Not Found',
                    message: isAR
                        ? 'لا يوجد حساب مرتبط بهذا الرقم. يرجى التحقق من الرقم أو إنشاء حساب جديد.'
                        : 'No account is linked to this phone number. Please check the number or create a new account.',
                    confirmLabel: isAR ? 'حسناً' : 'OK',
                });
            } else if (error.code === 'auth/wrong-password') {
                showDialog({
                    type: 'error',
                    title: isAR ? 'كلمة المرور غير صحيحة' : 'Wrong Password',
                    message: isAR
                        ? 'كلمة المرور التي أدخلتها غير صحيحة. يرجى المحاولة مرة أخرى.'
                        : 'The password you entered is incorrect. Please try again.',
                    confirmLabel: isAR ? 'حاول مجدداً' : 'Try Again',
                });
            } else {
                // Covers auth/invalid-credential (Firebase v9+ combined error for wrong phone OR password)
                showDialog({
                    type: 'error',
                    title: isAR ? 'بيانات الدخول غير صحيحة' : 'Invalid Credentials',
                    message: isAR
                        ? 'رقم الهاتف أو كلمة المرور غير صحيحة. يرجى التحقق من بياناتك والمحاولة مجدداً.'
                        : 'The phone number or password is incorrect. Please check your details and try again.',
                    confirmLabel: isAR ? 'حاول مجدداً' : 'Try Again',
                });
            }
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const register = async (userData: Omit<User, 'id' | 'role' | 'avatar' | 'email'>, customPassword?: string) => {
        setIsActionLoading(true);
        try {
            const email = `${userData.phone.trim()}@ny11.com`;
            const pass = customPassword || "default123";
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const newUser: User = { ...userData, id: userCredential.user.uid, email, role: UserRole.USER };
            await setDoc(doc(db, "users", newUser.id), newUser);
            const initialPlan = { [format(new Date(), 'yyyy-MM-dd')]: GOAL_PLANS[userData.goal || Goal.MAINTENANCE] };
            await setDoc(doc(db, "plans", newUser.id), { plan: initialPlan });
            setPlan(initialPlan);
            showToast(language === Language.AR ? "تم إنشاء الحساب بنجاح" : "Account created", "success");
        } catch (error: any) {
            const isAR = language === Language.AR;
            if (
                error.code === 'auth/email-already-in-use' ||
                error.code === 'auth/account-exists-with-different-credential'
            ) {
                showDialog({
                    type: 'warning',
                    title: isAR ? 'رقم الهاتف مسجّل مسبقاً' : 'Phone Number Already Registered',
                    message: isAR
                        ? 'هذا الرقم مرتبط بحساب موجود بالفعل. يرجى تسجيل الدخول بدلاً من إنشاء حساب جديد.'
                        : 'This phone number is already linked to an existing account. Please log in instead of creating a new account.',
                    confirmLabel: isAR ? 'تسجيل الدخول' : 'Go to Login',
                });
            } else {
                showDialog({
                    type: 'error',
                    title: isAR ? 'فشل إنشاء الحساب' : 'Registration Failed',
                    message: isAR
                        ? 'حدث خطأ أثناء إنشاء حسابك. يرجى التحقق من بياناتك والمحاولة مجدداً.'
                        : 'An error occurred while creating your account. Please check your details and try again.',
                    confirmLabel: isAR ? 'حاول مجدداً' : 'Try Again',
                });
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const logout = async () => {
        await signOut(auth);
        setCurrentUser(null);
    };

    const deleteAccount = async () => {
        if (!currentUser || currentUser.id === 'guest') return;
        setIsActionLoading(true);
        try {
            const user = auth.currentUser;
            if (user) {
                // Delete user data from Firestore
                await deleteDoc(doc(db, "users", currentUser.id));
                await deleteDoc(doc(db, "plans", currentUser.id));
                
                // Delete Auth user
                await deleteUser(user);
                
                // Reset local state
                setCurrentUser(null);
                setPlan({});
                showToast(translations[language].accountDeleted, "success");
                
                // Reload the page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error: any) {
            console.error("Account deletion error:", error);
            if (error.code === 'auth/requires-recent-login') {
                 showToast(language === Language.AR ? "لأسباب أمنية، يرجى تسجيل الدخول مرة أخرى لحذف حسابك." : "For security reasons, please log in again to delete your account.", "error");
                 // Automatically log them out to force a fresh login
                 logout();
            } else {
                 showToast(error.message, "error");
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const loginAsGuest = () => {
        if (currentUser && currentUser.role === UserRole.ADMIN) return;
        setCurrentUser({ id: 'guest', name: translations[language].guest, email: '', phone: '', role: UserRole.USER });
    };

    const registerCoach = async (data: CoachOnboardingData) => {
        try {
            const email = data.email || `${data.phone}@ny11.com`;
            const userCredential = await createUserWithEmailAndPassword(auth, email, data.password || "coach123");
            const newUser: User = { id: userCredential.user.uid, name: data.name, email, phone: data.phone, role: UserRole.COACH, avatar: data.avatar };
            const newCoach: Coach = { id: userCredential.user.uid, name: data.name, specialty: data.specialty, bio: data.bio, experienceYears: parseInt(data.experienceYears, 10) || 0, clientsHelped: parseInt(data.clientsHelped, 10) || 0, avatar: data.avatar };
            await setDoc(doc(db, "users", newUser.id), newUser);
            await setDoc(doc(db, "coaches", newCoach.id), newCoach);
            showToast(`Coach registered.`, 'success');
        } catch (error: any) { showToast(error.message, 'error'); }
    };

    const updateCoach = async (id: string, data: CoachOnboardingData) => {
        try {
            await updateDoc(doc(db, "coaches", id), { name: data.name, specialty: data.specialty, bio: data.bio, experienceYears: parseInt(data.experienceYears, 10) || 0, clientsHelped: parseInt(data.clientsHelped, 10) || 0, avatar: data.avatar });
            await updateDoc(doc(db, "users", id), { name: data.name, phone: data.phone, avatar: data.avatar });
            showToast(`Coach updated.`, 'success');
        } catch (error: any) { showToast(error.message, 'error'); }
    };

    const addToCart = (itemId: string) => {
        const itemToAdd = cart.find(i => i.id === itemId);
        if (itemToAdd) setCart(cart.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item));
        else { const newItem = marketItems.find((i) => i.id === itemId); if(newItem) setCart([...cart, { ...newItem, quantity: 1 }]); }
    };
    const removeFromCart = (itemId: string) => setCart(cart.filter(item => item.id !== itemId));
    const addMarketItem = async (itemData: Omit<MarketItem, 'id'>) => { await addDoc(collection(db, "marketItems"), itemData); showToast('Item added.', 'success'); };
    const updateMarketItem = async (updatedItem: MarketItem) => { const { id, ...data } = updatedItem; await updateDoc(doc(db, "marketItems", id), data); showToast('Item updated.', 'success'); };
    const deleteMarketItem = async (itemId: string) => { await deleteDoc(doc(db, "marketItems", itemId)); showToast('Item deleted.', 'success'); };
    const addKnowledgeItem = async (item: Omit<KnowledgeBaseItem, 'id'>) => { await addDoc(collection(db, "knowledgeBase"), item); showToast('Q&A added.', 'success'); };
    const updateKnowledgeItem = async (updatedItem: KnowledgeBaseItem) => { const { id, ...data } = updatedItem; await updateDoc(doc(db, "knowledgeBase", id), data); showToast('Q&A updated.', 'success'); };
    const deleteKnowledgeItem = async (id: string) => { await deleteDoc(doc(db, "knowledgeBase", id)); showToast('Q&A deleted.', 'success'); };

    const getAIResponse = async (userQuestion: string): Promise<string> => {
        const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!groqApiKey) return language === Language.AR ? "نظام الذكاء الاصطناعي غير متصل حالياً." : "AI system offline.";
        
        try {
            const t = translations[language];
            
            // 1. Coaches Context
            const coachesContext = coaches.length > 0 
                ? coaches.map(c => `- ${c.name}: ${c.specialty}. ${c.bio}`).join('\n')
                : "No specific coaches listed yet.";

            // 2. Market Context
            const marketContext = marketItems.length > 0
                ? marketItems.map(i => `- ${i.name} (${i.category}): ${i.price || 'N/A'}$ - ${i.description || ''}`).join('\n')
                : "No products in the market currently.";

            // 3. Knowledge Base
            const knowledgeContext = knowledgeBase.map(kb => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n');
            
            // 4. About Us and Roadmap
            const roadmapContext = `
Roadmap:
- Q1 Foundation: ${t.q1Title} - ${t.q1Desc}
- Q2 Integration: ${t.q2Title} - ${t.q2Desc}
- Q3 AI & Personalization: ${t.q3Title} - ${t.q3Desc}
- Q4 Community: ${t.q4Title} - ${t.q4Desc}
`;

            const systemInstruction = `You are NY11 Website Assistant. Your ONLY goal is to answer questions about the NY11 website, its services, team, and products (FAQ).
            
### WEBSITE INFORMATION ###
- Mission: ${t.aboutUsDesc}
- Specialists/Coaches:
${coachesContext}
- Market Products:
${marketContext}
${roadmapContext}

### FAQ KNOWLEDGE BASE ###
${knowledgeContext}

### RESPONSE RULES ###
1. Use the provided information to answer questions about NY11 ONLY.
2. If the user asks about experts, mention our coaches by name.
3. If they ask about meals or drinks, refer to the Market products.
4. If they ask about the future of the app, use the Roadmap.
5. If the user asks about personal health advice, recipes, or topics unrelated to NY11, politely decline and steer back to our services.
6. Always reply in the user's language: ${language === Language.AR ? 'ARABIC' : 'ENGLISH'}.
7. Be professional, friendly, and helpful. You represent NY11.
8. Do NOT mention you are an AI from Groq. You are the NY11 Assistant.`;

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemInstruction },
                        { role: 'user', content: userQuestion }
                    ],
                    temperature: 0.7,
                    max_completion_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Groq API error:", errorData);
                throw new Error(errorData?.error?.message || "Groq request failed");
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "No response";
        } catch (error) { 
            console.error("AI interaction error:", error);
            return language === Language.AR ? "حدث خطأ في الاتصال بالمدرب الذكي." : "Error connecting to AI Assistant.";
        }
    };

    const generatePlanWithAI = async (user: User) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Ensure we always update the state even if AI is unavailable
        const applyFallback = async () => {
            const fallbackPlan = { ...plan, [today]: GOAL_PLANS[user.goal || Goal.MAINTENANCE] };
            if (user.id !== 'guest') {
                await setDoc(doc(db, "plans", user.id), { plan: fallbackPlan });
            }
            setPlan(fallbackPlan);
        };

        const googleApiKey = siteConfig.aiApiKey;
        if (!googleApiKey || !user.goal) {
            console.warn("AI Plan Generation skipped: Missing API Key in SiteConfig or User Goal");
            await applyFallback();
            return;
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey: googleApiKey });
            const prompt = `Generate a 1-day meal and exercise plan for a user: Name ${user.name}, Age ${user.age}, Weight ${user.weight}kg, Height ${user.height}cm, Goal ${user.goal}. Return ONLY a JSON object of type DailyPlan. Respond in ${language === Language.AR ? 'ARABIC' : 'ENGLISH'}.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            breakfast: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, description: {type: Type.STRING}, completed: {type: Type.BOOLEAN} } } },
                            lunch: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, description: {type: Type.STRING}, completed: {type: Type.BOOLEAN} } } },
                            dinner: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, description: {type: Type.STRING}, completed: {type: Type.BOOLEAN} } } },
                            snacks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, description: {type: Type.STRING}, completed: {type: Type.BOOLEAN} } } },
                            exercises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, reps: {type: Type.STRING}, duration: {type: Type.STRING}, completed: {type: Type.BOOLEAN} } } },
                        }
                    }
                }
            });

            const text = response.text || '{}';
            const aiPlan = JSON.parse(text) as DailyPlan;
            const newPlan = { ...plan, [today]: aiPlan };
            if (user.id !== 'guest') {
                await setDoc(doc(db, "plans", user.id), { plan: newPlan });
            }
            setPlan(newPlan);
        } catch (error) {
            console.error("Plan Generation Error:", error);
            await applyFallback();
        }
    };

    const clearCart = () => setCart([]);

    const purchaseCart = async () => {
        if (!currentUser || cart.length === 0) return;
        setIsActionLoading(true);
        try {
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const newOrder: Omit<Order, 'id'> = {
                userId: currentUser.id,
                items: cart,
                total,
                timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                status: 'completed'
            };
            await addDoc(collection(db, "orders"), newOrder);
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsActionLoading(false);
        }
    };
    const showNotification = useCallback((notification: Omit<Notification, 'id'>) => { const id = Date.now(); setNotifications(prev => [...prev, { id, ...notification }]); setTimeout(() => dismissNotification(id), 5000); }, []);
    const dismissNotification = (id: number) => setNotifications(current => current.filter(notif => notif.id !== id));
    
    const updateDailyPlan = async (date: string, dailyPlan: DailyPlan) => {
        if (!currentUser) return;
        const newPlan = { ...plan, [date]: dailyPlan };
        setPlan(newPlan);
        await setDoc(doc(db, "plans", currentUser.id), { plan: newPlan });
    };

    const updateUserProfile = async (profileData: Partial<Omit<User, 'id' | 'role' | 'email'>>) => {
        if (!currentUser) return;
        try { 
            await updateDoc(doc(db, "users", currentUser.id), profileData); 
            const updatedUser = { ...currentUser, ...profileData };
            setCurrentUser(updatedUser); 
            showToast("Profile updated", "success"); 
            if (updatedUser.age && updatedUser.weight && updatedUser.height && updatedUser.goal) {
                generatePlanWithAI(updatedUser);
            }
        }
        catch (error: any) { showToast(error.message, "error"); }
    };

    const addBannerImage = (url: string) => setBannerImages(prev => [...prev, url]);
    const deleteBannerImage = (index: number) => setBannerImages(prev => prev.filter((_, i) => i !== index));
    const updateBannerImage = (index: number, url: string) => setBannerImages(prev => prev.map((img, i) => (i === index ? url : img)));
    const updateTranslations = (newTranslations: typeof TRANSLATIONS) => setTranslations(newTranslations);
    const updateSiteConfig = async (newConfig: Partial<SiteConfig>) => {
        try {
            const updated = { ...siteConfig, ...newConfig };
            setSiteConfig(updated);
            await setDoc(doc(db, "settings", "general"), updated);
            showToast("Site settings updated.", "success");
        } catch (e) {
            console.error(e);
        }
    };

    const updateQuoteStatus = (messageId: string, status: QuoteStatus, conversation: Message[], setConversation: React.Dispatch<React.SetStateAction<Message[]>>) => {
        const updatedConversation = conversation.map(msg => (msg.id === messageId && msg.quote) ? { ...msg, quote: { ...msg.quote, status } } : msg);
        setConversation(updatedConversation);
    };

    return (
        <AppContext.Provider value={{
            currentUser, users, coaches, language, theme, cart, toasts, plan, notifications,
            isLanguageSelected, marketItems, bannerImages, siteConfig, translations, knowledgeBase, isLoading, isActionLoading,
            isLockedOut, dialog, showDialog, dismissDialog, login, loginAsGuest, logout, register, registerCoach, updateCoach, setLanguage, setIsLanguageSelected,
            setTheme, addToCart, removeFromCart, clearCart, showToast, updatePlan: (p) => setPlan(p), updateDailyPlan,
            updateQuoteStatus, updateUserProfile, showNotification, dismissNotification, addMarketItem,
            updateMarketItem, deleteMarketItem, addBannerImage, deleteBannerImage, updateBannerImage,
            updateTranslations, updateSiteConfig, addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem, getAIResponse, generatePlanWithAI,
            deleteAccount, orders, purchaseCart
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
