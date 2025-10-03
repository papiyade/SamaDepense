import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  CreditCard, 
  PiggyBank, 
  BarChart3, 
  Settings,
  Wallet,
  X,
  User,
  Trophy,
  Lightbulb
} from 'lucide-react'

// Stores
import { useUserStore } from '@/stores/userStore'
import { useUIState } from '@/stores/uiStore'
import { useFinanceStore } from '@/stores/financeStore'

// Components
import Button from '@/components/ui/Button'

const Sidebar: React.FC = () => {
  const { user } = useUserStore()
  const { setSidebarOpen } = useUIState()
  const { currentBalance } = useFinanceStore()

  const navItems = [
    {
      to: '/',
      icon: Home,
      label: 'Tableau de bord',
      exact: true
    },
    {
      to: '/transactions',
      icon: CreditCard,
      label: 'Transactions'
    },
    {
      to: '/savings',
      icon: PiggyBank,
      label: 'Épargne'
    },
    {
      to: '/analytics',
      icon: BarChart3,
      label: 'Analytics'
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Paramètres'
    }
  ]

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* En-tête */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            SamaDepense
          </h1>
        </div>
        
        {/* Bouton fermer pour mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
          icon={<X className="w-4 h-4" />}
        />
      </div>

      {/* Profil utilisateur */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            
            {/* Badge de niveau */}
            {user?.level && user.level.current > 1 && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-warning-400 to-warning-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {user.level.current}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {user?.name || 'Utilisateur'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user?.level.title || 'Débutant'}
            </p>
          </div>
        </div>

        {/* Solde actuel */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Solde actuel
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {currentBalance.toLocaleString()} CFA
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Indicateur actif */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveTab"
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Section gamification */}
      {user?.preferences.gamification.enabled && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="space-y-3">
            {/* Progression XP */}
            <div className="bg-gradient-to-r from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Niveau {user?.level.current || 1}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.level.xp || 0} XP
                </span>
              </div>
              
              <div className="progress-bar h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: user?.level.xpToNext 
                      ? `${((user.level.xp || 0) / (user.level.xpToNext + (user.level.xp || 0))) * 100}%`
                      : '0%'
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="progress-fill bg-gradient-to-r from-primary-500 to-success-500"
                />
              </div>
            </div>

            {/* Conseils rapides */}
            <div className="bg-warning-50 dark:bg-warning-900/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Conseil du jour
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Suivez vos dépenses quotidiennes pour mieux contrôler votre budget.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Version */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          SamaDepense v1.0.0
        </p>
      </div>
    </div>
  )
}

export default Sidebar

