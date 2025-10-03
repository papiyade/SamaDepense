import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, TrendingUp } from 'lucide-react'

// Components
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Savings: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Épargne
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gérez vos objectifs d'épargne et suivez vos progrès
          </p>
        </div>

        <Button
          icon={<Plus className="w-4 h-4" />}
        >
          Nouvel objectif
        </Button>
      </motion.div>

      {/* Statistiques d'épargne */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total épargné</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0 CFA</p>
            </div>
            <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-xl">
              <Target className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Taux d'épargne</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0%</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Objectifs actifs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
            </div>
            <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-xl">
              <Target className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des objectifs d'épargne */}
      <Card>
        <div className="empty-state py-12">
          <div className="empty-state-icon">🎯</div>
          <h3 className="empty-state-title">Aucun objectif d'épargne</h3>
          <p className="empty-state-description">
            Créez votre premier objectif d'épargne pour commencer à économiser intelligemment
          </p>
          <Button icon={<Plus className="w-4 h-4" />}>
            Créer un objectif
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Savings

