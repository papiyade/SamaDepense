import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type AppSettings, type NotificationData, NotificationType } from '@/types'
import { db } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'

interface AppState {
  // État de l'application
  settings: AppSettings
  notifications: NotificationData[]
  isInitialized: boolean
  isLoading: boolean
  error: string | null

  // PWA
  installPrompt: any | null
  isInstalled: boolean
  updateAvailable: boolean

  // Navigation
  currentRoute: string
  previousRoute: string | null

  // Actions - Initialisation
  initializeApp: () => Promise<void>
  setInitialized: (initialized: boolean) => void

  // Actions - Paramètres
  updateSettings: (settings: Partial<AppSettings>) => void
  toggleOnlineStatus: (isOnline: boolean) => void
  updateSyncStatus: (syncing: boolean, lastSync?: Date) => void
  markUnsyncedChanges: (hasChanges: boolean) => void

  // Actions - Notifications
  addNotification: (notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>) => Promise<void>
  markNotificationRead: (notificationId: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  clearOldNotifications: () => Promise<void>
  loadNotifications: () => Promise<void>

  // Actions - PWA
  setInstallPrompt: (prompt: any) => void
  installApp: () => Promise<void>
  setInstalled: (installed: boolean) => void
  setUpdateAvailable: (available: boolean) => void
  reloadApp: () => void

  // Actions - Navigation
  setCurrentRoute: (route: string) => void
  goBack: () => void

  // Actions - Erreurs
  setError: (error: string | null) => void
  clearError: () => void

  // Utilitaires
  getUnreadNotificationCount: () => number
  getNotificationsByType: (type: NotificationType) => NotificationData[]
  canInstallApp: () => boolean
}

const defaultSettings: AppSettings = {
  version: '1.0.0',
  isOnline: navigator.onLine,
  syncInProgress: false,
  hasUnsyncedChanges: false,
  installPromptAvailable: false
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // État initial
      settings: defaultSettings,
      notifications: [],
      isInitialized: false,
      isLoading: false,
      error: null,
      installPrompt: null,
      isInstalled: false,
      updateAvailable: false,
      currentRoute: '/',
      previousRoute: null,

      // Initialiser l'application
      initializeApp: async () => {
        set({ isLoading: true, error: null })

        try {
          // Vérifier le statut en ligne
          const isOnline = navigator.onLine
          
          // Charger les notifications
          await get().loadNotifications()
          
          // Nettoyer les anciennes données
          await db.cleanup()
          
          // Vérifier si l'app est installée
          const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                             (window.navigator as any).standalone === true

          set({ 
            isInitialized: true,
            isLoading: false,
            isInstalled,
            settings: {
              ...get().settings,
              isOnline
            }
          })

          // Écouter les changements de statut en ligne
          window.addEventListener('online', () => get().toggleOnlineStatus(true))
          window.addEventListener('offline', () => get().toggleOnlineStatus(false))

          console.log('✅ Application initialisée')

        } catch (error) {
          console.error('❌ Erreur lors de l\'initialisation:', error)
          set({ 
            error: 'Impossible d\'initialiser l\'application',
            isLoading: false 
          })
        }
      },

      setInitialized: (initialized) => {
        set({ isInitialized: initialized })
      },

      // Mettre à jour les paramètres
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      // Basculer le statut en ligne
      toggleOnlineStatus: (isOnline) => {
        set(state => ({
          settings: { ...state.settings, isOnline }
        }))

        if (isOnline) {
          // Déclencher la synchronisation si nécessaire
          const { settings } = get()
          if (settings.hasUnsyncedChanges) {
            console.log('🔄 Connexion rétablie, synchronisation en cours...')
            // Logique de synchronisation à implémenter
          }
        }
      },

      // Mettre à jour le statut de synchronisation
      updateSyncStatus: (syncing, lastSync) => {
        set(state => ({
          settings: {
            ...state.settings,
            syncInProgress: syncing,
            lastSyncAt: lastSync || state.settings.lastSyncAt
          }
        }))
      },

      // Marquer les changements non synchronisés
      markUnsyncedChanges: (hasChanges) => {
        set(state => ({
          settings: {
            ...state.settings,
            hasUnsyncedChanges: hasChanges
          }
        }))
      },

      // Ajouter une notification
      addNotification: async (notificationData) => {
        try {
          const newNotification: NotificationData = {
            ...notificationData,
            id: uuidv4(),
            isRead: false,
            createdAt: new Date()
          }

          await db.notifications.add(newNotification)
          
          set(state => ({
            notifications: [newNotification, ...state.notifications]
          }))

          // Afficher une notification système si supportée
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notificationData.title, {
              body: notificationData.message,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png'
            })
          }

        } catch (error) {
          console.error('Erreur lors de l\'ajout de la notification:', error)
        }
      },

      // Marquer une notification comme lue
      markNotificationRead: async (notificationId) => {
        try {
          await db.notifications.update(notificationId, { isRead: true })
          
          set(state => ({
            notifications: state.notifications.map(n =>
              n.id === notificationId ? { ...n, isRead: true } : n
            )
          }))
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la notification:', error)
        }
      },

      // Marquer toutes les notifications comme lues
      markAllNotificationsRead: async () => {
        try {
          const { notifications } = get()
          const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
          
          for (const id of unreadIds) {
            await db.notifications.update(id, { isRead: true })
          }
          
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true }))
          }))
        } catch (error) {
          console.error('Erreur lors de la mise à jour des notifications:', error)
        }
      },

      // Supprimer une notification
      deleteNotification: async (notificationId) => {
        try {
          await db.notifications.delete(notificationId)
          
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== notificationId)
          }))
        } catch (error) {
          console.error('Erreur lors de la suppression de la notification:', error)
        }
      },

      // Nettoyer les anciennes notifications
      clearOldNotifications: async () => {
        try {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

          // Supprimer les notifications lues de plus de 30 jours
          await db.notifications
            .where('createdAt')
            .below(thirtyDaysAgo)
            .filter(n => n.isRead)
            .delete()

          await get().loadNotifications()
        } catch (error) {
          console.error('Erreur lors du nettoyage des notifications:', error)
        }
      },

      // Charger les notifications
      loadNotifications: async () => {
        try {
          const notifications = await db.notifications
            .orderBy('createdAt')
            .reverse()
            .limit(50)
            .toArray()

          set({ notifications })
        } catch (error) {
          console.error('Erreur lors du chargement des notifications:', error)
        }
      },

      // Définir le prompt d'installation
      setInstallPrompt: (prompt) => {
        set({ 
          installPrompt: prompt,
          settings: {
            ...get().settings,
            installPromptAvailable: !!prompt
          }
        })
      },

      // Installer l'application
      installApp: async () => {
        const { installPrompt } = get()
        if (!installPrompt) return

        try {
          const result = await installPrompt.prompt()
          console.log('Résultat de l\'installation:', result.outcome)
          
          if (result.outcome === 'accepted') {
            set({ 
              installPrompt: null,
              isInstalled: true,
              settings: {
                ...get().settings,
                installPromptAvailable: false
              }
            })
          }
        } catch (error) {
          console.error('Erreur lors de l\'installation:', error)
        }
      },

      // Marquer l'app comme installée
      setInstalled: (installed) => {
        set({ isInstalled: installed })
      },

      // Marquer une mise à jour comme disponible
      setUpdateAvailable: (available) => {
        set({ updateAvailable: available })
        
        if (available) {
          get().addNotification({
            type: NotificationType.SYSTEM,
            title: 'Mise à jour disponible',
            message: 'Une nouvelle version de l\'application est disponible.',
            actionUrl: '/settings'
          })
        }
      },

      // Recharger l'application
      reloadApp: () => {
        window.location.reload()
      },

      // Définir la route courante
      setCurrentRoute: (route) => {
        set(state => ({
          previousRoute: state.currentRoute,
          currentRoute: route
        }))
      },

      // Retourner à la page précédente
      goBack: () => {
        const { previousRoute } = get()
        if (previousRoute) {
          window.history.back()
        }
      },

      // Définir une erreur
      setError: (error) => {
        set({ error })
      },

      // Effacer l'erreur
      clearError: () => {
        set({ error: null })
      },

      // Obtenir le nombre de notifications non lues
      getUnreadNotificationCount: () => {
        return get().notifications.filter(n => !n.isRead).length
      },

      // Obtenir les notifications par type
      getNotificationsByType: (type) => {
        return get().notifications.filter(n => n.type === type)
      },

      // Vérifier si l'app peut être installée
      canInstallApp: () => {
        const { installPrompt, isInstalled } = get()
        return !!installPrompt && !isInstalled
      }
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        settings: state.settings,
        isInstalled: state.isInstalled,
        currentRoute: state.currentRoute,
        previousRoute: state.previousRoute
      })
    }
  )
)
