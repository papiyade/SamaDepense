import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Calendar } from 'lucide-react'

// Components
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Transactions: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Transactions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gérez toutes vos transactions financières
          </p>
        </div>

        <Button
          icon={<Plus className="w-4 h-4" />}
        >
          Nouvelle transaction
        </Button>
      </motion.div>

      {/* Filtres et recherche */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                className="input pl-10"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="ghost" icon={<Filter className="w-4 h-4" />}>
              Filtres
            </Button>
            <Button variant="ghost" icon={<Calendar className="w-4 h-4" />}>
              Période
            </Button>
          </div>
        </div>
      </Card>

      {/* Liste des transactions */}
      <Card>
        <div className="empty-state py-12">
          <div className="empty-state-icon">💳</div>
          <h3 className="empty-state-title">Aucune transaction</h3>
          <p className="empty-state-description">
            Commencez par ajouter votre première transaction pour suivre vos finances
          </p>
          <Button icon={<Plus className="w-4 h-4" />}>
            Ajouter une transaction
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Transactions

