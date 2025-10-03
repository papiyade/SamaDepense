import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useNotifications } from '@/stores/uiStore'

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-danger-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-primary-500" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-success-500 bg-success-50 dark:bg-success-900/20'
      case 'error':
        return 'border-l-danger-500 bg-danger-50 dark:bg-danger-900/20'
      case 'warning':
        return 'border-l-warning-500 bg-warning-50 dark:bg-warning-900/20'
      case 'info':
      default:
        return 'border-l-primary-500 bg-primary-50 dark:bg-primary-900/20'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
              relative bg-white dark:bg-slate-800 border-l-4 rounded-xl shadow-lg p-4
              ${getStyles(notification.type)}
            `}
          >
            <div className="flex items-start space-x-3">
              {/* Icône */}
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {notification.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {notification.message}
                </p>

                {/* Actions */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex space-x-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className={`
                          px-3 py-1 text-xs font-medium rounded-lg transition-colors
                          ${action.style === 'primary' 
                            ? 'bg-primary-500 text-white hover:bg-primary-600' 
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                          }
                        `}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton de fermeture */}
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barre de progression pour les notifications temporaires */}
            {notification.duration && notification.duration > 0 && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: notification.duration / 1000, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-bl-xl"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default NotificationContainer

