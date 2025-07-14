import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Interfaces
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
  read: boolean;
}

interface AppState {
  // Notificações globais
  notifications: Notification[];
  unreadCount: number;
  
  // Estado de UI global
  sidebarCollapsed: boolean;
  currentPage: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  
  // Loading states globais
  globalLoading: boolean;
  pageLoading: boolean;
  
  // Ações para notificações
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Ações para UI
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      notifications: [],
      unreadCount: 0,
      sidebarCollapsed: false,
      currentPage: '',
      breadcrumbs: [],
      globalLoading: false,
      pageLoading: false,

      // Ações para notificações
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          read: false,
        };

        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Limitar a 50
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          const wasUnread = notification && !notification.read;
          
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Ações para UI
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      setCurrentPage: (page: string) => {
        set({ currentPage: page });
      },

      setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => {
        set({ breadcrumbs });
      },

      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      setPageLoading: (loading: boolean) => {
        set({ pageLoading: loading });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);