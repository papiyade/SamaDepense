import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { pwaManager } from '../lib/pwa'

// Composant pour le prompt d'installation
export const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    const handleInstallAvailable = () => {
      setShowPrompt(true)
    }

    const handleAppInstalled = () => {
      setShowPrompt(false)
    }

    window.addEventListener('pwa-install-available', handleInstallAvailable)
    window.addEventListener('pwa-app-installed', handleAppInstalled)

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable)
      window.removeEventListener('pwa-app-installed', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const success = await pwaManager.installApp()
      if (success) {
        setShowPrompt(false)
      }
    } catch (error) {
      console.error('Erreur installation:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Installer SamaDepense
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Accès rapide depuis votre écran d'accueil
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Fonctionne hors ligne</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Notifications de rappel</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Accès instantané</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Plus tard
              </button>
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isInstalling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Installation...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Installer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant pour les notifications de mise à jour
export const PWAUpdatePrompt: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdate(true)
    }

    window.addEventListener('pwa-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await pwaManager.updateApp()
    } catch (error) {
      console.error('Erreur mise à jour:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Mise à jour disponible
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Nouvelles fonctionnalités disponibles
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleDismiss}
                className="flex-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-sm"
              >
                Plus tard
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Mettre à jour</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant pour l'indicateur de statut réseau
export const PWANetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const handleOnlineStatus = (event: CustomEvent) => {
      const { isOnline: online } = event.detail
      setIsOnline(online)
      setShowStatus(true)
      
      // Masquer après 3 secondes
      setTimeout(() => setShowStatus(false), 3000)
    }

    window.addEventListener('pwa-online-status', handleOnlineStatus as EventListener)

    return () => {
      window.removeEventListener('pwa-online-status', handleOnlineStatus as EventListener)
    }
  }, [])

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-20 right-4 z-40"
        >
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg ${
            isOnline 
              ? 'bg-emerald-500 text-white' 
              : 'bg-orange-500 text-white'
          }`}>
            {isOnline ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Connexion rétablie' : 'Mode hors ligne'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant principal PWA
export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <PWANetworkStatus />
    </>
  )
}

