import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Stores
import { useUserStore } from '@/stores/userStore'
import { useUIStore } from '@/stores/uiStore'
import { useFinanceStore } from '@/stores/financeStore'
import { useSavingsStore } from '@/stores/savingsStore'

// Services
import { storageService } from '@/services/storage'

// Components
import Layout from '@/components/layout/Layout'
import LoadingScreen from '@/components/ui/LoadingScreen'
import NotificationContainer from '@/components/ui/NotificationContainer'

// Pages
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Savings from '@/pages/Savings'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import Onboarding from '@/pages/Onboarding'

// Hooks
import { useOnlineStatus } from '@/stores/uiStore'

function App() {
  const { user, isAuthenticated, isOnboardingCompleted } = useUserStore()
  const { theme, setTheme, isLoading, setLoading } = useUIStore()
  const { loadCategories, loadTransactions } = useFinanceStore()
  const { loadSavingsBoxes } = useSavingsStore()
  
  // Hook pour détecter le statut en ligne/hors ligne
  useOnlineStatus()

  // Initialisation de l'application
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true)
      
      try {
        // Initialiser le thème
        const savedTheme = localStorage.getItem('ui-store')
        if (savedTheme) {
          const parsedTheme = JSON.parse(savedTheme)
          if (parsedTheme.state?.theme) {
            setTheme(parsedTheme.state.theme)
          }
        } else {
          // Détecter la préférence système
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setTheme(prefersDark ? 'dark' : 'light')
        }

        // Initialiser la base de données
        await storageService.initialize()

        // Charger les données si l'utilisateur est authentifié
        if (isAuthenticated && user) {
          await Promise.all([
            loadCategories(),
            loadTransactions(),
            loadSavingsBoxes()
          ])
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [isAuthenticated, user, setTheme, setLoading, loadCategories, loadTransactions, loadSavingsBoxes])

  // Écouter les changements de préférence système pour le thème
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      document.documentElement.classList.toggle('dark', mediaQuery.matches)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Afficher l'écran de chargement pendant l'initialisation
  if (isLoading) {
    return <LoadingScreen />
  }

  // Rediriger vers l'onboarding si l'utilisateur n'est pas authentifié ou n'a pas terminé l'onboarding
  if (!isAuthenticated || !isOnboardingCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 dark:from-slate-900 dark:to-slate-800">
        <Onboarding />
        <NotificationContainer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dashboard />
                </motion.div>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <motion.div
                  key="transactions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Transactions />
                </motion.div>
              } 
            />
            <Route 
              path="/savings" 
              element={
                <motion.div
                  key="savings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Savings />
                </motion.div>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Analytics />
                </motion.div>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Settings />
                </motion.div>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
      
      {/* Container pour les notifications */}
      <NotificationContainer />
    </div>
  )
}

export default App

