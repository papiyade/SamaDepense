import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { NotificationConfig } from '@/types'

interface UIState {
  // Thème et apparence
  theme: 'light' | 'dark' | 'system'
  isDarkMode: boolean
  
  // Navigation
  currentPage: string
  previousPage: string | null
  navigationHistory: string[]
  
  // Modales et overlays
  modals: {
    isTransactionModalOpen: boolean
    isCategoryModalOpen: boolean
    isSavingsBoxModalOpen: boolean
    isSettingsModalOpen: boolean
    isExportModalOpen: boolean
    isImportModalOpen: boolean
  }
  
  // Notifications
  notifications: NotificationConfig[]
  maxNotifications: number
  
  // État de l'interface
  isLoading: boolean
  isSidebarOpen: boolean
  isOffline: boolean
  lastSyncTime: Date | null
  
  // Préférences d'affichage
  preferences: {
    compactMode: boolean
    showAnimations: boolean
    showDecimals: boolean
    hideAmounts: boolean
    autoRefresh: boolean
    refreshInterval: number // en secondes
  }
  
  // Actions pour le thème
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void
  
  // Actions pour la navigation
  setCurrentPage: (page: string) => void
  goBack: () => void
  clearNavigationHistory: () => void
  
  // Actions pour les modales
  openModal: (modalName: keyof UIState['modals']) => void
  closeModal: (modalName: keyof UIState['modals']) => void
  closeAllModals: () => void
  
  // Actions pour les notifications
  addNotification: (notification: Omit<NotificationConfig, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Actions pour l'état de l'interface
  setLoading: (loading: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setOfflineStatus: (offline: boolean) => void
  updateLastSyncTime: () => void
  
  // Actions pour les préférences
  updatePreferences: (preferences: Partial<UIState['preferences']>) => void
  
  // Utilitaires
  reset: () => void
}

const defaultModals = {
  isTransactionModalOpen: false,
  isCategoryModalOpen: false,
  isSavingsBoxModalOpen: false,
  isSettingsModalOpen: false,
  isExportModalOpen: false,
  isImportModalOpen: false
}

const defaultPreferences = {
  compactMode: false,
  showAnimations: true,
  showDecimals: true,
  hideAmounts: false,
  autoRefresh: true,
  refreshInterval: 30
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // État initial
      theme: 'system',
      isDarkMode: false,
      
      currentPage: 'dashboard',
      previousPage: null,
      navigationHistory: [],
      
      modals: defaultModals,
      
      notifications: [],
      maxNotifications: 5,
      
      isLoading: false,
      isSidebarOpen: false,
      isOffline: false,
      lastSyncTime: null,
      
      preferences: defaultPreferences,
      
      // Actions pour le thème
      setTheme: (theme) => {
        set({ theme })
        
        // Appliquer le thème immédiatement
        const isDark = theme === 'dark' || 
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        
        set({ isDarkMode: isDark })
        
        // Mettre à jour la classe sur le document
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },
      
      // Actions pour la navigation
      setCurrentPage: (page) => {
        const currentPage = get().currentPage
        const history = get().navigationHistory
        
        set({
          previousPage: currentPage,
          currentPage: page,
          navigationHistory: [...history.slice(-9), currentPage] // Garder les 10 dernières pages
        })
      },
      
      goBack: () => {
        const previousPage = get().previousPage
        if (previousPage) {
          get().setCurrentPage(previousPage)
        }
      },
      
      clearNavigationHistory: () => {
        set({
          navigationHistory: [],
          previousPage: null
        })
      },
      
      // Actions pour les modales
      openModal: (modalName) => {
        set({
          modals: {
            ...get().modals,
            [modalName]: true
          }
        })
      },
      
      closeModal: (modalName) => {
        set({
          modals: {
            ...get().modals,
            [modalName]: false
          }
        })
      },
      
      closeAllModals: () => {
        set({ modals: defaultModals })
      },
      
      // Actions pour les notifications
      addNotification: (notificationData) => {
        const notifications = get().notifications
        const maxNotifications = get().maxNotifications
        
        const newNotification: NotificationConfig = {
          ...notificationData,
          id: crypto.randomUUID()
        }
        
        // Limiter le nombre de notifications
        const updatedNotifications = [newNotification, ...notifications]
          .slice(0, maxNotifications)
        
        set({ notifications: updatedNotifications })
        
        // Auto-suppression après la durée spécifiée
        if (notificationData.duration && notificationData.duration > 0) {
          setTimeout(() => {
            get().removeNotification(newNotification.id)
          }, notificationData.duration)
        }
      },
      
      removeNotification: (id) => {
        const notifications = get().notifications
        const updatedNotifications = notifications.filter(n => n.id !== id)
        set({ notifications: updatedNotifications })
      },
      
      clearNotifications: () => {
        set({ notifications: [] })
      },
      
      // Actions pour l'état de l'interface
      setLoading: (loading) => set({ isLoading: loading }),
      
      toggleSidebar: () => {
        const isOpen = get().isSidebarOpen
        set({ isSidebarOpen: !isOpen })
      },
      
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      
      setOfflineStatus: (offline) => {
        set({ isOffline: offline })
        
        // Ajouter une notification si on passe hors ligne
        if (offline) {
          get().addNotification({
            title: 'Mode hors ligne',
            message: 'Vous êtes hors connexion. Vos données seront synchronisées dès que la connexion sera rétablie.',
            type: 'warning',
            duration: 5000
          })
        } else {
          get().addNotification({
            title: 'Connexion rétablie',
            message: 'Vous êtes de nouveau en ligne.',
            type: 'success',
            duration: 3000
          })
        }
      },
      
      updateLastSyncTime: () => {
        set({ lastSyncTime: new Date() })
      },
      
      // Actions pour les préférences
      updatePreferences: (newPreferences) => {
        const currentPreferences = get().preferences
        const updatedPreferences = { ...currentPreferences, ...newPreferences }
        set({ preferences: updatedPreferences })
      },
      
      // Utilitaires
      reset: () => set({
        theme: 'system',
        isDarkMode: false,
        currentPage: 'dashboard',
        previousPage: null,
        navigationHistory: [],
        modals: defaultModals,
        notifications: [],
        isLoading: false,
        isSidebarOpen: false,
        isOffline: false,
        lastSyncTime: null,
        preferences: defaultPreferences
      })
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        preferences: state.preferences,
        isSidebarOpen: state.isSidebarOpen
      })
    }
  )
)

// Hooks utilitaires
export const useTheme = () => {
  const store = useUIStore()
  return {
    theme: store.theme,
    isDarkMode: store.isDarkMode,
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme
  }
}

export const useNavigation = () => {
  const store = useUIStore()
  return {
    currentPage: store.currentPage,
    previousPage: store.previousPage,
    navigationHistory: store.navigationHistory,
    setCurrentPage: store.setCurrentPage,
    goBack: store.goBack,
    clearNavigationHistory: store.clearNavigationHistory
  }
}

export const useModals = () => {
  const store = useUIStore()
  return {
    modals: store.modals,
    openModal: store.openModal,
    closeModal: store.closeModal,
    closeAllModals: store.closeAllModals
  }
}

export const useNotifications = () => {
  const store = useUIStore()
  return {
    notifications: store.notifications,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications
  }
}

export const useUIState = () => {
  const store = useUIStore()
  return {
    isLoading: store.isLoading,
    isSidebarOpen: store.isSidebarOpen,
    isOffline: store.isOffline,
    lastSyncTime: store.lastSyncTime,
    preferences: store.preferences,
    setLoading: store.setLoading,
    toggleSidebar: store.toggleSidebar,
    setSidebarOpen: store.setSidebarOpen,
    setOfflineStatus: store.setOfflineStatus,
    updateLastSyncTime: store.updateLastSyncTime,
    updatePreferences: store.updatePreferences
  }
}

// Hook pour détecter le statut en ligne/hors ligne
export const useOnlineStatus = () => {
  const { isOffline, setOfflineStatus } = useUIState()
  
  // Écouter les changements de statut réseau
  React.useEffect(() => {
    const handleOnline = () => setOfflineStatus(false)
    const handleOffline = () => setOfflineStatus(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Vérifier le statut initial
    setOfflineStatus(!navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOfflineStatus])
  
  return { isOffline, isOnline: !isOffline }
}

// Importer React pour useEffect
import React from 'react'

