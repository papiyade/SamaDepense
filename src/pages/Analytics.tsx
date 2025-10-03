import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react'

// Components
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Analysez vos habitudes financières avec des graphiques détaillés
          </p>
        </div>

        <Button
          variant="ghost"
          icon={<Calendar className="w-4 h-4" />}
        >
          Changer la période
        </Button>
      </motion.div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Évolution mensuelle
            </h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="empty-state py-8">
            <div className="empty-state-icon">📊</div>
            <p className="empty-state-description">
              Ajoutez des transactions pour voir l'évolution de vos finances
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Répartition par catégorie
            </h3>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          <div className="empty-state py-8">
            <div className="empty-state-icon">🥧</div>
            <p className="empty-state-description">
              Vos dépenses par catégorie apparaîtront ici
            </p>
          </div>
        </Card>
      </div>

      {/* Insights et recommandations */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Insights et recommandations
          </h3>
          <TrendingUp className="w-5 h-5 text-slate-400" />
        </div>
        <div className="empty-state py-8">
          <div className="empty-state-icon">💡</div>
          <h4 className="empty-state-title">Insights personnalisés</h4>
          <p className="empty-state-description">
            Nous analyserons vos habitudes financières pour vous donner des conseils personnalisés
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Analytics

