
// FIX: Removed a self-referential import that caused type declaration conflicts.

export enum Language {
  EN = 'en',
  AR = 'ar',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  COACH = 'coach'
}

export enum Goal {
  WEIGHT_LOSS = 'weight_loss',
  WEIGHT_GAIN = 'weight_gain',
  MUSCLE_BUILD = 'muscle_build',
  FITNESS = 'fitness',
  MAINTENANCE = 'maintenance',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  goal?: Goal;
  password?: string;
}

export interface Coach {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  bio: string;
  experienceYears: number;
  clientsHelped: number;
}

export interface CoachOnboardingData {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
  experienceYears: string;
  clientsHelped: string;
  avatar: string;
  password?: string;
}

export enum MessageSender {
  USER = 'user',
  COACH = 'coach',
  SYSTEM = 'system'
}

export enum QuoteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export interface Quote {
  amount: number;
  service: string;
  status: QuoteStatus;
}

export interface Message {
  id: string;
  sender: MessageSender;
  text?: string;
  timestamp: string;
  quote?: Quote;
  plan?: Plan;
}

export interface Meal {
  name: string;
  calories: number;
  completed: boolean;
  image?: string;
  description?: string;
}

export interface Exercise {
  name: string;
  reps?: string;
  duration?: string;
  completed: boolean;
}

export interface DailyPlan {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
  exercises: Exercise[];
}

export interface Plan {
  [date: string]: DailyPlan; // date format: 'YYYY-MM-DD'
}

export type MarketCategory = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'drink' | 'snack';

export interface NutritionFacts {
  servingSize: string;
  energy: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  summary?: string; // e.g., "HIGH PROTEIN MEAL"
  price: number;
  image: string;
  category: MarketCategory;
  ingredients?: string;
  nutrition?: NutritionFacts;
  caution?: string;
}

export interface CartItem extends MarketItem {
  quantity: number;
}

export interface Notification {
    id: number;
    title: string;
    body: string;
    icon?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface SiteConfig {
    heroImage: string;
    aiApiKey?: string;
}

export interface KnowledgeBaseItem {
    id: string;
    question: string;
    answer: string;
    keywords: string[]; // Keywords to help matching if exact match fails
}
