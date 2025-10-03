import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react'

// Stores
import { useFinanceStore, useFinancialSummary } from '@/stores/financeStore'
import { useSavingsStore, useSavingsStats } from '@/stores/savingsStore'
import { useUserStore } from '@/stores/userStore'
import { useUIState, useModals } from '@/stores/uiStore'

// Components
import Card, { StatCard, ProgressCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// Composant pour les transactions récentes
const RecentTransactions: React.FC = () => {
  const { transactions, isLoading } = useFinanceStore()
  const { categories } = useFinanceStore()
  const { openModal } = useModals()

  const recentTransactions = transactions.slice(0, 5)
  const categoryMap = new Map(categories.map(c => [c.id, c]))

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Transactions récentes
          </h3>
          <div className="skeleton-button" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="space-y-1">
                  <div className="skeleton-text w-24" />
                  <div className="skeleton-text w-16" />
                </div>
              </div>
              <div className="skeleton-text w-20" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (recentTransactions.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Transactions récentes
          </h3>
          <Button
            size="sm"
            onClick={() => openModal('isTransactionModalOpen')}
            icon={<Plus className="w-4 h-4" />}
          >
            Ajouter
          </Button>
        </div>
        <div className="empty-state py-8">
          <Wallet className="empty-state-icon" />
          <h4 className="empty-state-title">Aucune transaction</h4>
          <p className="empty-state-description">
            Commencez par ajouter votre première transaction
          </p>
          <Button
            onClick={() => openModal('isTransactionModalOpen')}
            icon={<Plus className="w-4 h-4" />}
          >
            Ajouter une transaction
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Transactions récentes
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openModal('isTransactionModalOpen')}
          icon={<Plus className="w-4 h-4" />}
        >
          Ajouter
        </Button>
      </div>

      <div className="space-y-3">
        {recentTransactions.map((transaction, index) => {
          const category = categoryMap.get(transaction.categoryId)
          
          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="list-item rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: category?.color + '20' }}
                >
                  <div 
                    className="w-5 h-5"
                    style={{ color: category?.color }}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {category?.name} • {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' 
                    ? 'text-success-600 dark:text-success-400' 
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {transaction.amount.toLocaleString()} CFA
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button variant="ghost" fullWidth size="sm">
          Voir toutes les transactions
        </Button>
      </div>
    </Card>
  )
}

// Composant pour les objectifs d'épargne
const SavingsGoals: React.FC = () => {
  const { savingsBoxes, isLoading } = useSavingsStore()
  const { openModal } = useModals()

  const activeSavingsBoxes = savingsBoxes.filter(box => box.isActive).slice(0, 3)

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Objectifs d'épargne
          </h3>
          <div className="skeleton-button" />
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="skeleton-text w-24" />
                <div className="skeleton-text w-16" />
              </div>
              <div className="skeleton h-2 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (activeSavingsBoxes.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Objectifs d'épargne
          </h3>
          <Button
            size="sm"
            onClick={() => openModal('isSavingsBoxModalOpen')}
            icon={<Plus className="w-4 h-4" />}
          >
            Créer
          </Button>
        </div>
        <div className="empty-state py-8">
          <Target className="empty-state-icon" />
          <h4 className="empty-state-title">Aucun objectif</h4>
          <p className="empty-state-description">
            Créez votre premier objectif d'épargne
          </p>
          <Button
            onClick={() => openModal('isSavingsBoxModalOpen')}
            icon={<Plus className="w-4 h-4" />}
          >
            Créer un objectif
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Objectifs d'épargne
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openModal('isSavingsBoxModalOpen')}
          icon={<Plus className="w-4 h-4" />}
        >
          Créer
        </Button>
      </div>

      <div className="space-y-4">
        {activeSavingsBoxes.map((box, index) => {
          const percentage = box.targetAmount > 0 
            ? Math.min((box.currentAmount / box.targetAmount) * 100, 100) 
            : 0

          return (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: box.color }}
                  />
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {box.name}
                  </span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {percentage.toFixed(1)}%
                </span>
              </div>

              <div className="progress-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="progress-fill"
                  style={{ backgroundColor: box.color }}
                />
              </div>

              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>{box.currentAmount.toLocaleString()} CFA</span>
                <span>{box.targetAmount.toLocaleString()} CFA</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button variant="ghost" fullWidth size="sm">
          Voir tous les objectifs
        </Button>
      </div>
    </Card>
  )
}

const Dashboard: React.FC = () => {
  const { user } = useUserStore()
  const { currentBalance, initialBalance, loadSummary, loadCategoryStats, summary } = useFinanceStore()
  const { totalSavings, savingsRate, loadSavingsBoxes } = useSavingsStore()
  const { preferences, updatePreferences } = useUIState()

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadSummary(),
        loadCategoryStats(),
        loadSavingsBoxes()
      ])
    }
    loadData()
  }, [loadSummary, loadCategoryStats, loadSavingsBoxes])

  // Calculer les statistiques
  const monthlyIncome = summary?.income.total || 0
  const monthlyExpenses = summary?.expenses.total || 0
  const netIncome = monthlyIncome - monthlyExpenses

  const toggleAmountVisibility = () => {
    updatePreferences({ hideAmounts: !preferences.hideAmounts })
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec salutation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Bonjour {user?.name || 'Utilisateur'} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Voici un aperçu de vos finances aujourd'hui
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAmountVisibility}
          icon={preferences.hideAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        >
          {preferences.hideAmounts ? 'Afficher' : 'Masquer'}
        </Button>
      </motion.div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Solde actuel"
            value={`${currentBalance.toLocaleString()} CFA`}
            change={{
              value: initialBalance > 0 ? ((currentBalance - initialBalance) / initialBalance) * 100 : 0,
              type: currentBalance >= initialBalance ? 'positive' : 'negative'
            }}
            icon={<Wallet className="w-6 h-6" />}
            color="primary"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Revenus ce mois"
            value={`${monthlyIncome.toLocaleString()} CFA`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="success"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            title="Dépenses ce mois"
            value={`${monthlyExpenses.toLocaleString()} CFA`}
            icon={<TrendingDown className="w-6 h-6" />}
            color="warning"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            title="Total épargné"
            value={`${totalSavings.toLocaleString()} CFA`}
            change={{
              value: savingsRate,
              type: savingsRate > 0 ? 'positive' : 'neutral'
            }}
            icon={<PiggyBank className="w-6 h-6" />}
            color="success"
          />
        </motion.div>
      </div>

      {/* Graphique de résumé mensuel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Résumé mensuel
            </h3>
            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-xl">
              <div className="text-2xl font-bold text-success-600 dark:text-success-400 mb-1">
                +{monthlyIncome.toLocaleString()}
              </div>
              <div className="text-sm text-success-600 dark:text-success-400">
                Revenus
              </div>
            </div>

            <div className="text-center p-4 bg-danger-50 dark:bg-danger-900/20 rounded-xl">
              <div className="text-2xl font-bold text-danger-600 dark:text-danger-400 mb-1">
                -{monthlyExpenses.toLocaleString()}
              </div>
              <div className="text-sm text-danger-600 dark:text-danger-400">
                Dépenses
              </div>
            </div>

            <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <div className={`text-2xl font-bold mb-1 ${
                netIncome >= 0 
                  ? 'text-success-600 dark:text-success-400' 
                  : 'text-danger-600 dark:text-danger-400'
              }`}>
                {netIncome >= 0 ? '+' : ''}{netIncome.toLocaleString()}
              </div>
              <div className="text-sm text-primary-600 dark:text-primary-400">
                Net
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Section principale avec transactions et épargne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <RecentTransactions />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SavingsGoals />
        </motion.div>
      </div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Actions rapides
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="ghost"
              fullWidth
              className="h-20 flex-col space-y-2"
              icon={<Plus className="w-6 h-6" />}
            >
              <span className="text-sm">Ajouter transaction</span>
            </Button>

            <Button
              variant="ghost"
              fullWidth
              className="h-20 flex-col space-y-2"
              icon={<Target className="w-6 h-6" />}
            >
              <span className="text-sm">Nouvel objectif</span>
            </Button>

            <Button
              variant="ghost"
              fullWidth
              className="h-20 flex-col space-y-2"
              icon={<TrendingUp className="w-6 h-6" />}
            >
              <span className="text-sm">Voir analytics</span>
            </Button>

            <Button
              variant="ghost"
              fullWidth
              className="h-20 flex-col space-y-2"
              icon={<Calendar className="w-6 h-6" />}
            >
              <span className="text-sm">Historique</span>
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Dashboard

