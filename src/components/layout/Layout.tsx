import React from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import Navigation from './Navigation'
import Sidebar from './Sidebar'
import { useUIState } from '@/stores/uiStore'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarOpen } = useUIState()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar pour desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Overlay pour mobile quand sidebar est ouverte */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {}} // Géré par le store
        />
      )}

      {/* Sidebar mobile */}
      <div className="lg:hidden">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: isSidebarOpen ? 0 : '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-y-0 left-0 z-50 w-64"
        >
          <Sidebar />
        </motion.div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header />

        {/* Contenu de la page */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Navigation mobile en bas */}
        <div className="lg:hidden">
          <Navigation />
        </div>
      </div>
    </div>
  )
}

export default Layout

