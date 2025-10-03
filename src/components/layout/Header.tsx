import React from 'react'
import { motion } from 'framer-motion'
import { 
  Menu, 
  Bell, 
  Settings, 
  User, 
  Wifi, 
  WifiOff,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'

// Stores
import { useUserStore } from '@/stores/userStore'
import { useUIState, useTheme, useNotifications } from '@/stores/uiStore'
import { useFinanceStore } from '@/stores/financeStore'

// Components
import Button from '@/components/ui/Button'

const Header: React.FC = () => {
  const { user } = useUserStore()
  const { toggleSidebar, isOffline, lastSyncTime } = useUIState()
  const { theme, toggleTheme } = useTheme()
  const { notifications } = useNotifications()
  const { currentBalance } = useFinanceStore()

  const unreadNotifications = notifications.filter(n => !n.actions?.some(a => a.label === 'Marquer comme lu')).length

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'dark':
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Côté gauche */}
          <div className="flex items-center space-x-4">
            {/* Bouton menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
              icon={<Menu className="w-5 h-5" />}
            />

            {/* Logo et titre pour mobile */}
            <div className="lg:hidden">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                SamaDepense
              </h1>
            </div>

            {/* Indicateur de statut réseau */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                isOffline 
                  ? 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-400'
                  : 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400'
              }`}
            >
              {isOffline ? (
                <WifiOff className="w-3 h-3" />
              ) : (
                <Wifi className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">
                {isOffline ? 'Hors ligne' : 'En ligne'}
              </span>
            </motion.div>

            {/* Dernière synchronisation */}
            {lastSyncTime && !isOffline && (
              <div className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
                Sync: {lastSyncTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
          </div>

          {/* Côté droit */}
          <div className="flex items-center space-x-2">
            {/* Solde actuel (masqué sur mobile) */}
            <div className="hidden sm:block">
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Solde actuel
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {currentBalance.toLocaleString()} CFA
                </div>
              </div>
            </div>

            {/* Bouton thème */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              icon={getThemeIcon()}
              className="hidden sm:flex"
            />

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                icon={<Bell className="w-5 h-5" />}
              />
              {unreadNotifications > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </motion.div>
              )}
            </div>

            {/* Paramètres */}
            <Button
              variant="ghost"
              size="sm"
              icon={<Settings className="w-5 h-5" />}
              className="hidden sm:flex"
            />

            {/* Profil utilisateur */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.name || 'Utilisateur'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Niveau {user?.level.current || 1}
                </div>
              </div>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </Button>

                {/* Badge de niveau */}
                {user?.level && user.level.current > 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-warning-400 to-warning-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {user.level.current}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression XP (si gamification activée) */}
      {user?.preferences.gamification.enabled && user.level && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="h-1 bg-slate-200 dark:bg-slate-700"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${((user.level.totalXp - (user.level.current - 1) * 100) / 100) * 100}%` 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary-500 to-success-500"
          />
        </motion.div>
      )}
    </header>
  )
}

export default Header

