
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { DialogConfig } from '../components/CustomDialog';
import { GoogleGenAI, Type } from "@google/genai";
import {
  User, Language, Theme, CartItem, Plan, DailyPlan, QuoteStatus,
  Message, MessageSender, UserRole, Goal, Coach, CoachOnboardingData,
  Notification, MarketItem, SiteConfig, KnowledgeBaseItem, Order,
  LabTest, Conversation, PersistentMessage
} from '../types';
import {
  COACHES, MARKET_ITEMS, GOAL_PLANS, TRANSLATIONS,
  BANNER_IMAGES, DEFAULT_SITE_CONFIG, DEFAULT_KNOWLEDGE_BASE
} from '../constants';
import { auth, db, secondaryAuth } from '../lib/firebase';
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
    labTests: LabTest[];
    conversations: Conversation[];
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
    purchaseLabTest: (test: LabTest) => Promise<void>;
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
    addLabTest: (test: Omit<LabTest, 'id'>) => Promise<void>;
    updateLabTest: (test: LabTest) => Promise<void>;
    deleteLabTest: (id: string) => Promise<void>;
    sendPersistentMessage: (coachId: string, coachName: string, coachAvatar: string | undefined, text: string) => Promise<void>;
    sendCoachMessage: (conversationId: string, text: string) => Promise<void>;
    subscribeToMessages: (conversationId: string, cb: (msgs: PersistentMessage[]) => void) => () => void;
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
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
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
                setCoaches(items);
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

        const unsubscribeLabs = onSnapshot(collection(db, "labTests"),
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LabTest[];
                setLabTests(items);
            },
            (err) => console.warn("Lab tests access restricted:", err.message)
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
            unsubscribeLabs();
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

    useEffect(() => {
        if (!currentUser || currentUser.id === 'guest') {
            setConversations([]);
            return;
        }
        const fieldName = currentUser.role === UserRole.COACH ? 'coachId' : 'userId';
        const unsub = onSnapshot(
            query(collection(db, "conversations"), where(fieldName, "==", currentUser.id)),
            (snapshot) => {
                const convos = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Conversation[];
                convos.sort((a, b) => (b.lastTimestamp || '').localeCompare(a.lastTimestamp || ''));
                setConversations(convos);
            },
            (err) => console.warn("Conversations access restricted:", err.message)
        );
        return () => unsub();
    }, [currentUser]);

    const login = async (phone: string, password?: string) => {
        if (isLockedOut) return false;
        setIsActionLoading(true);
        try {
            const raw = phone.trim();
            // Accept either a phone number (legacy + customer/admin format) or a
            // raw email (used by coaches whose admin-assigned login email is
            // not derived from a phone number).
            const email = raw.includes('@') ? raw : `${raw}@ny11.com`;
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
        setIsActionLoading(true);
        try {
            const email = (data.email && data.email.trim()) || `${data.phone}@ny11.com`;
            const password = data.password || "coach123";
            // Use the secondary auth app so creating the coach does NOT sign
            // the admin out of the primary session. Firestore writes below
            // still run as the admin, which is required by the security rules
            // for the `users` and `coaches` collections.
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const coachUid = userCredential.user.uid;

            const newUser: User = {
                id: coachUid,
                name: data.name,
                email,
                phone: data.phone,
                role: UserRole.COACH,
                avatar: data.avatar,
            };
            const newCoach: Coach = {
                id: coachUid,
                name: data.name,
                specialty: data.specialty,
                bio: data.bio,
                experienceYears: parseInt(data.experienceYears, 10) || 0,
                clientsHelped: parseInt(data.clientsHelped, 10) || 0,
                avatar: data.avatar,
            };
            await setDoc(doc(db, "users", coachUid), newUser);
            await setDoc(doc(db, "coaches", coachUid), newCoach);

            // Drop the secondary session immediately — we only needed it to
            // mint the auth account. The new coach will sign in themselves.
            await signOut(secondaryAuth).catch(() => undefined);

            const isAR = language === Language.AR;
            showToast(isAR ? 'تم إنشاء حساب المدرب بنجاح' : 'Coach account created.', 'success');
        } catch (error: any) {
            const isAR = language === Language.AR;
            const code = error?.code as string | undefined;
            let message: string;
            if (code === 'auth/email-already-in-use') {
                message = isAR
                    ? 'هذا البريد مسجّل مسبقاً. استخدم بريداً آخر.'
                    : 'This email is already registered. Use a different one.';
            } else if (code === 'auth/invalid-email') {
                message = isAR ? 'البريد الإلكتروني غير صالح.' : 'The email address is invalid.';
            } else if (code === 'auth/weak-password') {
                message = isAR
                    ? 'كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل.'
                    : 'Password is too weak. Use at least 6 characters.';
            } else {
                message = error?.message || (isAR ? 'تعذّر إنشاء حساب المدرب.' : 'Failed to create coach.');
            }
            showToast(message, 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const updateCoach = async (id: string, data: CoachOnboardingData) => {
        setIsActionLoading(true);
        try {
            await updateDoc(doc(db, "coaches", id), {
                name: data.name,
                specialty: data.specialty,
                bio: data.bio,
                experienceYears: parseInt(data.experienceYears, 10) || 0,
                clientsHelped: parseInt(data.clientsHelped, 10) || 0,
                avatar: data.avatar,
            });
            await updateDoc(doc(db, "users", id), {
                name: data.name,
                phone: data.phone,
                avatar: data.avatar,
            });
            const isAR = language === Language.AR;
            showToast(isAR ? 'تم تحديث بيانات المدرب' : 'Coach updated.', 'success');
        } catch (error: any) {
            showToast(error?.message || 'Failed to update coach.', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const addToCart = (itemId: string) => {
        const itemToAdd = cart.find(i => i.id === itemId);
        if (itemToAdd) setCart(cart.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item));
        else { const newItem = marketItems.find((i) => i.id === itemId); if(newItem) setCart([...cart, { ...newItem, quantity: 1 }]); }
    };
    const removeFromCart = (itemId: string) => setCart(cart.filter(item => item.id !== itemId));
    const reportError = (err: any, fallbackAR: string, fallbackEN: string) => {
        const isAR = language === Language.AR;
        const msg = err?.message || (isAR ? fallbackAR : fallbackEN);
        showToast(msg, 'error');
        console.error(fallbackEN, err);
    };

    const addMarketItem = async (itemData: Omit<MarketItem, 'id'>) => {
        try {
            await addDoc(collection(db, "marketItems"), itemData);
            showToast(language === Language.AR ? 'تمت إضافة المنتج' : 'Item added.', 'success');
        } catch (e) { reportError(e, 'تعذّر إضافة المنتج', 'Failed to add item.'); }
    };
    const updateMarketItem = async (updatedItem: MarketItem) => {
        try {
            const { id, ...data } = updatedItem;
            await updateDoc(doc(db, "marketItems", id), data);
            showToast(language === Language.AR ? 'تم تحديث المنتج' : 'Item updated.', 'success');
        } catch (e) { reportError(e, 'تعذّر تحديث المنتج', 'Failed to update item.'); }
    };
    const deleteMarketItem = async (itemId: string) => {
        try {
            await deleteDoc(doc(db, "marketItems", itemId));
            showToast(language === Language.AR ? 'تم حذف المنتج' : 'Item deleted.', 'success');
        } catch (e) { reportError(e, 'تعذّر حذف المنتج', 'Failed to delete item.'); }
    };
    const addKnowledgeItem = async (item: Omit<KnowledgeBaseItem, 'id'>) => {
        try {
            await addDoc(collection(db, "knowledgeBase"), item);
            showToast(language === Language.AR ? 'تمت إضافة سؤال وجواب' : 'Q&A added.', 'success');
        } catch (e) { reportError(e, 'تعذّر إضافة السؤال', 'Failed to add Q&A.'); }
    };
    const updateKnowledgeItem = async (updatedItem: KnowledgeBaseItem) => {
        try {
            const { id, ...data } = updatedItem;
            await updateDoc(doc(db, "knowledgeBase", id), data);
            showToast(language === Language.AR ? 'تم تحديث السؤال' : 'Q&A updated.', 'success');
        } catch (e) { reportError(e, 'تعذّر تحديث السؤال', 'Failed to update Q&A.'); }
    };
    const deleteKnowledgeItem = async (id: string) => {
        try {
            await deleteDoc(doc(db, "knowledgeBase", id));
            showToast(language === Language.AR ? 'تم حذف السؤال' : 'Q&A deleted.', 'success');
        } catch (e) { reportError(e, 'تعذّر حذف السؤال', 'Failed to delete Q&A.'); }
    };

    const addLabTest = async (test: Omit<LabTest, 'id'>) => {
        try {
            await addDoc(collection(db, "labTests"), test);
            showToast(language === Language.AR ? 'تمت إضافة الفحص' : 'Lab test added.', 'success');
        } catch (e) { reportError(e, 'تعذّر إضافة الفحص', 'Failed to add lab test.'); }
    };
    const updateLabTest = async (test: LabTest) => {
        try {
            const { id, ...data } = test;
            await updateDoc(doc(db, "labTests", id), data);
            showToast(language === Language.AR ? 'تم تحديث الفحص' : 'Lab test updated.', 'success');
        } catch (e) { reportError(e, 'تعذّر تحديث الفحص', 'Failed to update lab test.'); }
    };
    const deleteLabTest = async (id: string) => {
        try {
            await deleteDoc(doc(db, "labTests", id));
            showToast(language === Language.AR ? 'تم حذف الفحص' : 'Lab test deleted.', 'success');
        } catch (e) { reportError(e, 'تعذّر حذف الفحص', 'Failed to delete lab test.'); }
    };

    const purchaseLabTest = async (test: LabTest) => {
        if (!currentUser || currentUser.id === 'guest') return;
        setIsActionLoading(true);
        try {
            const labCartItem: CartItem = {
                id: `lab-${test.id}`,
                name: `Lab: ${test.name}`,
                description: test.description,
                price: test.price,
                image: test.image || '',
                category: 'snack',
                quantity: 1,
            };
            const newOrder: Omit<Order, 'id'> = {
                userId: currentUser.id,
                items: [labCartItem],
                total: test.price,
                timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                status: 'completed'
            };
            await addDoc(collection(db, "orders"), newOrder);
            showToast('Lab test booked successfully.', 'success');
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsActionLoading(false);
        }
    };

    const getConversationId = (userId: string, coachId: string) => `${userId}_${coachId}`;

    const sendPersistentMessage = async (coachId: string, coachName: string, coachAvatar: string | undefined, text: string) => {
        if (!currentUser || currentUser.id === 'guest' || currentUser.role !== UserRole.USER) return;
        const conversationId = getConversationId(currentUser.id, coachId);
        const convoRef = doc(db, "conversations", conversationId);
        const convoSnap = await getDoc(convoRef);
        const ts = new Date().toISOString();
        if (!convoSnap.exists()) {
            const convo: Conversation = {
                id: conversationId,
                userId: currentUser.id,
                coachId,
                userName: currentUser.name,
                coachName,
                userAvatar: currentUser.avatar || '',
                coachAvatar: coachAvatar || '',
                lastMessage: text,
                lastTimestamp: ts,
                unreadForCoach: 1,
                unreadForUser: 0,
            };
            await setDoc(convoRef, convo);
        } else {
            const data = convoSnap.data() as Conversation;
            await updateDoc(convoRef, {
                lastMessage: text,
                lastTimestamp: ts,
                unreadForCoach: (data.unreadForCoach || 0) + 1,
            });
        }
        await addDoc(collection(db, "conversations", conversationId, "messages"), {
            senderId: currentUser.id,
            senderRole: 'user',
            text,
            timestamp: ts,
        });
    };

    const sendCoachMessage = async (conversationId: string, text: string) => {
        if (!currentUser || currentUser.role !== UserRole.COACH) return;
        const ts = new Date().toISOString();
        const convoRef = doc(db, "conversations", conversationId);
        const convoSnap = await getDoc(convoRef);
        if (convoSnap.exists()) {
            const data = convoSnap.data() as Conversation;
            await updateDoc(convoRef, {
                lastMessage: text,
                lastTimestamp: ts,
                unreadForUser: (data.unreadForUser || 0) + 1,
            });
        }
        await addDoc(collection(db, "conversations", conversationId, "messages"), {
            senderId: currentUser.id,
            senderRole: 'coach',
            text,
            timestamp: ts,
        });
    };

    const subscribeToMessages = (conversationId: string, cb: (msgs: PersistentMessage[]) => void) => {
        const q = query(collection(db, "conversations", conversationId, "messages"), orderBy("timestamp", "asc"));
        return onSnapshot(q, (snap) => {
            const msgs = snap.docs.map(d => ({ id: d.id, conversationId, ...d.data() })) as PersistentMessage[];
            cb(msgs);
        }, (err) => console.warn("Messages access restricted:", err.message));
    };

    const clearCart = () => setCart([]);

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

            // 3. Lab Tests Context
            const labsContext = labTests.length > 0
                ? labTests.map(l => `- ${l.name} (${l.category || 'general'}): ${l.price}$${l.duration ? `, duration ${l.duration}` : ''} - ${l.description || ''}${l.preparation ? ` Preparation: ${l.preparation}` : ''}`).join('\n')
                : "No lab tests listed yet.";

            // 4. Knowledge Base
            const knowledgeContext = knowledgeBase.map(kb => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n');

            // 5. About Us and Roadmap
            const roadmapContext = `
Roadmap:
- Q1 Foundation: ${t.q1Title} - ${t.q1Desc}
- Q2 Integration: ${t.q2Title} - ${t.q2Desc}
- Q3 AI & Personalization: ${t.q3Title} - ${t.q3Desc}
- Q4 Community: ${t.q4Title} - ${t.q4Desc}
`;

            const systemInstruction = `You are NY11 Website Assistant. Your ONLY goal is to answer questions about the NY11 website, its services, team, products, and lab tests (FAQ).

### WEBSITE INFORMATION ###
- Mission: ${t.aboutUsDesc}
- Specialists/Coaches:
${coachesContext}
- Market Products:
${marketContext}
- Lab Tests:
${labsContext}
${roadmapContext}

### FAQ KNOWLEDGE BASE (admin-trained) ###
${knowledgeContext}

### RESPONSE RULES ###
1. Use the provided information to answer questions about NY11 ONLY.
2. If the user asks about experts, mention our coaches by name.
3. If they ask about meals or drinks, refer to the Market products.
4. If they ask about lab tests, blood work, hormones, vitamins, or فحوصات, answer from the Lab Tests list above (name, price, duration, preparation).
5. If they ask about the future of the app, use the Roadmap.
6. If the user asks about personal health advice, recipes, or topics unrelated to NY11, politely decline and steer back to our services.
7. The FAQ Knowledge Base is admin-curated training material — prefer it when it answers the question directly.
8. Always reply in the user's language: ${language === Language.AR ? 'ARABIC' : 'ENGLISH'}.
9. Be professional, friendly, and helpful. You represent NY11.
10. Do NOT mention you are an AI from Groq. You are the NY11 Assistant.`;

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
            isLanguageSelected, marketItems, labTests, conversations, bannerImages, siteConfig, translations, knowledgeBase, isLoading, isActionLoading,
            isLockedOut, dialog, showDialog, dismissDialog, login, loginAsGuest, logout, register, registerCoach, updateCoach, setLanguage, setIsLanguageSelected,
            setTheme, addToCart, removeFromCart, clearCart, showToast, updatePlan: (p) => setPlan(p), updateDailyPlan,
            updateQuoteStatus, updateUserProfile, showNotification, dismissNotification, addMarketItem,
            updateMarketItem, deleteMarketItem, addLabTest, updateLabTest, deleteLabTest,
            sendPersistentMessage, sendCoachMessage, subscribeToMessages, purchaseLabTest,
            addBannerImage, deleteBannerImage, updateBannerImage,
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
