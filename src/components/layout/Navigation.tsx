import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  CreditCard, 
  PiggyBank, 
  BarChart3, 
  Settings 
} from 'lucide-react'

const Navigation: React.FC = () => {
  const navItems = [
    {
      to: '/',
      icon: Home,
      label: 'Accueil',
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-30">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-xl transition-colors relative ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Indicateur actif */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-100 dark:bg-primary-900/20 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Icône */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10"
                  >
                    <Icon className="w-5 h-5 mb-1" />
                  </motion.div>
                  
                  {/* Label */}
                  <span className="text-xs font-medium relative z-10">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation

