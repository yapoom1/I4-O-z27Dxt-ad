import { create } from 'zustand';

export interface StoreTenant {
  id: string;
  name: string;
  plan: 'Basic' | 'Growth' | 'Enterprise';
  logo?: string;
  currency: string;
  locale: string;
  themeColor: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'inventory' | 'customer' | 'system';
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'Owner' | 'Administrator' | 'Manager' | 'Support';
  avatar?: string;
  permissions: string[];
}

interface AppState {
  // Multitenant Stores
  activeStore: StoreTenant | null;
  setActiveStore: (store: StoreTenant) => void;
  
  // Theme & Layout
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Command Palette & Search
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  
  // Notifications
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'time'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  
  // User Session
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  
  // Feature Flags
  featureFlags: Record<string, boolean>;
  toggleFeatureFlag: (flag: string) => void;
}

const defaultStores: StoreTenant[] = [
  {
    id: 'store-1',
    name: 'Admin Console - HQ',
    plan: 'Enterprise',
    currency: 'INR',
    locale: 'en-IN',
    themeColor: '#5C4033',
  },
  {
    id: 'store-2',
    name: 'Admin Console - Branch 1',
    plan: 'Growth',
    currency: 'INR',
    locale: 'en-IN',
    themeColor: '#8B5A2B',
  },
  {
    id: 'store-3',
    name: 'Admin Console - Branch 2',
    plan: 'Basic',
    currency: 'INR',
    locale: 'en-IN',
    themeColor: '#A67B5B',
  }
];

const defaultUser: UserProfile = {
  name: 'Admin',
  email: 'admin@sriaachi.com',
  role: 'Owner',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  permissions: ['*'], // wildcard access
};

const defaultNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'New High-Value Order',
    message: 'Order #ORD-9482 received for ₹3,42,299.00 from Jane Doe.',
    time: '2 mins ago',
    read: false,
    type: 'order',
  },
  {
    id: 'n2',
    title: 'Low Stock Warning',
    message: 'HP LaserJet Pro MFP M227fdw inventory level fell below threshold (3 remaining).',
    time: '24 mins ago',
    read: false,
    type: 'inventory',
  },
  {
    id: 'n3',
    title: 'New Vendor Application',
    message: 'Apex Trading Corp submitted an application to sell on your marketplace.',
    time: '2 hours ago',
    read: true,
    type: 'system',
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  activeStore: null,
  setActiveStore: (store) => set({ activeStore: store }),
  
  theme: 'light', // default light for that premium corporate blue/white style
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },
  
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  
  globalSearchQuery: '',
  setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
  
  notifications: defaultNotifications,
  addNotification: (notification) => {
    const newNotif: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      time: 'Just now',
      read: false,
    };
    set((state) => ({ notifications: [newNotif, ...state.notifications] }));
  },
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  clearNotifications: () => set({ notifications: [] }),
  
  user: defaultUser,
  setUser: (user) => set({ user }),
  
  featureFlags: {
    pos: true,
    aiDescription: true,
    b2b: true,
    themeMarketplace: true,
    loyaltySystem: true,
    vendorMarketplace: true,
  },
  toggleFeatureFlag: (flag) => set((state) => ({
    featureFlags: {
      ...state.featureFlags,
      [flag]: !state.featureFlags[flag],
    }
  })),
}));
