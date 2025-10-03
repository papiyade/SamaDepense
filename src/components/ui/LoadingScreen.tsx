import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Wallet } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Chargement de SamaDepense..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        {/* Logo animé */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-success-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Wallet className="w-10 h-10 text-white" />
            </motion.div>
            
            {/* Cercle de chargement */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-20 h-20 mx-auto border-4 border-transparent border-t-primary-300 rounded-full"
            />
          </div>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2"
        >
          SamaDepense
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-slate-600 dark:text-slate-400 mb-8"
        >
          Votre assistant financier personnel
        </motion.p>

        {/* Message de chargement */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-center space-x-3"
        >
          <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {message}
          </span>
        </motion.div>

        {/* Points de chargement animés */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center space-x-2 mt-6"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
              className="w-2 h-2 bg-primary-400 rounded-full"
            />
          ))}
        </motion.div>

        {/* Barre de progression */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="mt-8 mx-auto max-w-xs"
        >
          <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/3 bg-gradient-to-r from-primary-500 to-success-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-xs text-slate-500 dark:text-slate-500 mt-8"
        >
          Version 1.0.0
        </motion.p>
      </div>
    </div>
  )
}

export default LoadingScreen

