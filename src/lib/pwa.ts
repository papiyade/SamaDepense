// Gestionnaire PWA pour SamaDepense
import { Workbox } from 'workbox-window'

export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export class PWAManager {
  private wb: Workbox | null = null
  private installPrompt: PWAInstallPrompt | null = null
  private updateAvailable = false
  private isOnline = navigator.onLine

  constructor() {
    this.init()
  }

  private async init() {
    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      this.wb = new Workbox('/sw.js')
      
      // Écouter les mises à jour
      this.wb.addEventListener('waiting', () => {
        console.log('[PWA] Nouvelle version disponible')
        this.updateAvailable = true
        this.notifyUpdateAvailable()
      })

      // Écouter les messages du SW
      this.wb.addEventListener('message', (event) => {
        console.log('[PWA] Message du SW:', event.data)
      })

      try {
        await this.wb.register()
        console.log('[PWA] Service Worker enregistré')
      } catch (error) {
        console.error('[PWA] Erreur enregistrement SW:', error)
      }
    }

    // Écouter l'événement d'installation
    this.setupInstallPrompt()
    
    // Écouter les changements de connexion
    this.setupNetworkListeners()
    
    // Demander les permissions de notification
    this.requestNotificationPermission()
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Prompt d\'installation disponible')
      e.preventDefault()
      this.installPrompt = e as any
      this.notifyInstallAvailable()
    })

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installée')
      this.installPrompt = null
      this.notifyAppInstalled()
    })
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('[PWA] Connexion rétablie')
      this.isOnline = true
      this.notifyOnlineStatus(true)
      this.syncData()
    })

    window.addEventListener('offline', () => {
      console.log('[PWA] Connexion perdue')
      this.isOnline = false
      this.notifyOnlineStatus(false)
    })
  }

  // Installation de l'app
  async installApp(): Promise<boolean> {
    if (!this.installPrompt) {
      console.log('[PWA] Prompt d\'installation non disponible')
      return false
    }

    try {
      await this.installPrompt.prompt()
      const { outcome } = await this.installPrompt.userChoice
      
      console.log('[PWA] Choix utilisateur:', outcome)
      
      if (outcome === 'accepted') {
        this.installPrompt = null
        return true
      }
      
      return false
    } catch (error) {
      console.error('[PWA] Erreur lors de l\'installation:', error)
      return false
    }
  }

  // Mise à jour de l'app
  async updateApp(): Promise<void> {
    if (!this.wb || !this.updateAvailable) {
      return
    }

    try {
      this.wb.messageSkipWaiting()
      window.location.reload()
    } catch (error) {
      console.error('[PWA] Erreur lors de la mise à jour:', error)
    }
  }

  // Synchronisation des données
  async syncData(): Promise<void> {
    if (!this.isOnline || !this.wb) {
      return
    }

    try {
      console.log('[PWA] Synchronisation des données...')
      
      // Envoyer message au SW pour synchroniser
      this.wb.messageSW({ type: 'SYNC_DATA' })
      
      // Ou utiliser Background Sync si supporté
      if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register('background-sync')
      }
    } catch (error) {
      console.error('[PWA] Erreur lors de la synchronisation:', error)
    }
  }

  // Vérifier si l'app est installée
  isAppInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  // Vérifier si l'installation est disponible
  isInstallAvailable(): boolean {
    return this.installPrompt !== null
  }

  // Vérifier si une mise à jour est disponible
  isUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  // Vérifier le statut réseau
  getOnlineStatus(): boolean {
    return this.isOnline
  }

  // Demander permission pour les notifications
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('[PWA] Notifications non supportées')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  // Envoyer une notification
  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, defaultOptions)
      } else {
        new Notification(title, defaultOptions)
      }
    } catch (error) {
      console.error('[PWA] Erreur notification:', error)
    }
  }

  // Nettoyer les caches
  async clearCaches(): Promise<void> {
    if (!this.wb) {
      return
    }

    try {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel()
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('[PWA] Caches nettoyés')
          }
          resolve()
        }

        this.wb!.messageSW({ 
          type: 'CLEAR_CACHE' 
        })
      })
    } catch (error) {
      console.error('[PWA] Erreur lors du nettoyage des caches:', error)
    }
  }

  // Callbacks pour les événements (à surcharger)
  protected notifyInstallAvailable(): void {
    console.log('[PWA] Installation disponible')
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-install-available'))
  }

  protected notifyAppInstalled(): void {
    console.log('[PWA] App installée')
    window.dispatchEvent(new CustomEvent('pwa-app-installed'))
  }

  protected notifyUpdateAvailable(): void {
    console.log('[PWA] Mise à jour disponible')
    window.dispatchEvent(new CustomEvent('pwa-update-available'))
  }

  protected notifyOnlineStatus(isOnline: boolean): void {
    console.log('[PWA] Statut réseau:', isOnline ? 'en ligne' : 'hors ligne')
    window.dispatchEvent(new CustomEvent('pwa-online-status', { 
      detail: { isOnline } 
    }))
  }
}

// Instance globale
export const pwaManager = new PWAManager()

