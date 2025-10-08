import { create } from 'zustand'
import { 
  type Transaction, 
  type TransactionFilter, 
  type TransactionSummary, 
  type MonthlyReport,
  TransactionType 
} from '@/types'
import { db } from '@/lib/database'
import { useUserStore } from './userStore'
import { v4 as uuidv4 } from 'uuid'
import { getMonthStart, getMonthEnd } from '@/utils/date'

interface TransactionState {
  // État
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  currentFilter: TransactionFilter
  summary: TransactionSummary | null

  // Actions CRUD
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  loadTransactions: (filter?: TransactionFilter) => Promise<void>

  // Filtres et recherche
  setFilter: (filter: Partial<TransactionFilter>) => void
  clearFilter: () => void
  searchTransactions: (searchTerm: string) => Promise<Transaction[]>

  // Analyses et rapports
  calculateSummary: (filter?: TransactionFilter) => Promise<TransactionSummary>
  getMonthlyReport: (month: number, year: number) => Promise<MonthlyReport>
  getRecentTransactions: (limit?: number) => Promise<Transaction[]>
  getTransactionsByCategory: (categoryId: string) => Promise<Transaction[]>

  // Transactions récurrentes
  processRecurringTransactions: () => Promise<void>
  createRecurringTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>

  // Utilitaires
  getTransactionById: (id: string) => Transaction | undefined
  getTotalByType: (type: TransactionType, filter?: TransactionFilter) => number
}

const defaultFilter: TransactionFilter = {}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  // État initial
  transactions: [],
  isLoading: false,
  error: null,
  currentFilter: defaultFilter,
  summary: null,

  // Ajouter une transaction
  addTransaction: async (transactionData) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) {
      set({ error: 'Utilisateur non connecté' })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const newTransaction: Transaction = {
        ...transactionData,
        id: uuidv4(),
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.transactions.add(newTransaction)
      
      // Mettre à jour le solde utilisateur
      const balanceChange = transactionData.type === TransactionType.INCOME 
        ? transactionData.amount 
        : -transactionData.amount

      await useUserStore.getState().updateUser({
        currentBalance: user.currentBalance + balanceChange
      })

      // Ajouter XP pour la transaction
      await useUserStore.getState().addXP(10)

      // Recharger les transactions
      await get().loadTransactions(get().currentFilter)
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error)
      set({ 
        error: 'Impossible d\'ajouter la transaction', 
        isLoading: false 
      })
    }
  },

  // Mettre à jour une transaction
  updateTransaction: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const existingTransaction = get().getTransactionById(id)
      if (!existingTransaction) {
        throw new Error('Transaction non trouvée')
      }

      const updatedTransaction = {
        ...existingTransaction,
        ...updates,
        updatedAt: new Date()
      }

      await db.transactions.update(id, updatedTransaction)
      
      // Recalculer le solde si le montant a changé
      if (updates.amount !== undefined || updates.type !== undefined) {
        const user = useUserStore.getState().getCurrentUser()
        if (user) {
          // Annuler l'ancienne transaction
          const oldBalanceChange = existingTransaction.type === TransactionType.INCOME 
            ? -existingTransaction.amount 
            : existingTransaction.amount

          // Appliquer la nouvelle transaction
          const newBalanceChange = updatedTransaction.type === TransactionType.INCOME 
            ? updatedTransaction.amount 
            : -updatedTransaction.amount

          const totalChange = oldBalanceChange + newBalanceChange

          await useUserStore.getState().updateUser({
            currentBalance: user.currentBalance + totalChange
          })
        }
      }

      await get().loadTransactions(get().currentFilter)
      set({ isLoading: false })
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      set({ 
        error: 'Impossible de mettre à jour la transaction', 
        isLoading: false 
      })
    }
  },

  // Supprimer une transaction
  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const transaction = get().getTransactionById(id)
      if (!transaction) {
        throw new Error('Transaction non trouvée')
      }

      await db.transactions.delete(id)

      // Ajuster le solde utilisateur
      const user = useUserStore.getState().getCurrentUser()
      if (user) {
        const balanceChange = transaction.type === TransactionType.INCOME 
          ? -transaction.amount 
          : transaction.amount

        await useUserStore.getState().updateUser({
          currentBalance: user.currentBalance + balanceChange
        })
      }

      await get().loadTransactions(get().currentFilter)
      set({ isLoading: false })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      set({ 
        error: 'Impossible de supprimer la transaction', 
        isLoading: false 
      })
    }
  },

  // Charger les transactions
  loadTransactions: async (filter = {}) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    set({ isLoading: true, error: null })

    try {
      let transactions = await db.getUserTransactions(user.id)

      // Appliquer les filtres
      if (filter.startDate) {
        transactions = transactions.filter(t => t.date >= filter.startDate!)
      }
      if (filter.endDate) {
        transactions = transactions.filter(t => t.date <= filter.endDate!)
      }
      if (filter.type) {
        transactions = transactions.filter(t => t.type === filter.type)
      }
      if (filter.categoryIds?.length) {
        transactions = transactions.filter(t => filter.categoryIds!.includes(t.categoryId))
      }
      if (filter.minAmount !== undefined) {
        transactions = transactions.filter(t => t.amount >= filter.minAmount!)
      }
      if (filter.maxAmount !== undefined) {
        transactions = transactions.filter(t => t.amount <= filter.maxAmount!)
      }
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase()
        transactions = transactions.filter(t => 
          t.description.toLowerCase().includes(searchLower) ||
          t.notes?.toLowerCase().includes(searchLower)
        )
      }
      if (filter.savingsBoxId) {
        transactions = transactions.filter(t => t.savingsBoxId === filter.savingsBoxId)
      }

      set({ 
        transactions, 
        currentFilter: filter,
        isLoading: false 
      })

      // Calculer le résumé
      const summary = await get().calculateSummary(filter)
      set({ summary })

    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      set({ 
        error: 'Impossible de charger les transactions', 
        isLoading: false 
      })
    }
  },

  // Définir un filtre
  setFilter: (filter) => {
    const newFilter = { ...get().currentFilter, ...filter }
    get().loadTransactions(newFilter)
  },

  // Effacer les filtres
  clearFilter: () => {
    get().loadTransactions({})
  },

  // Rechercher des transactions
  searchTransactions: async (searchTerm) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return []

    const transactions = await db.getUserTransactions(user.id)
    const searchLower = searchTerm.toLowerCase()
    
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchLower) ||
      t.notes?.toLowerCase().includes(searchLower) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  },

  // Calculer le résumé
  calculateSummary: async (filter = {}) => {
    const { transactions } = get()
    
    const filteredTransactions = transactions.filter(t => {
      if (filter.startDate && t.date < filter.startDate) return false
      if (filter.endDate && t.date > filter.endDate) return false
      if (filter.type && t.type !== filter.type) return false
      return true
    })

    const totalIncome = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0)

    const totalSavings = filteredTransactions
      .filter(t => t.type === TransactionType.SAVINGS)
      .reduce((sum, t) => sum + t.amount, 0)

    // Calculer la répartition par catégorie
    const categoryBreakdown = new Map()
    filteredTransactions.forEach(t => {
      if (!categoryBreakdown.has(t.categoryId)) {
        categoryBreakdown.set(t.categoryId, {
          categoryId: t.categoryId,
          categoryName: 'Catégorie', // À récupérer depuis le store des catégories
          amount: 0,
          transactionCount: 0,
          color: '#6B7280'
        })
      }
      const category = categoryBreakdown.get(t.categoryId)
      category.amount += t.amount
      category.transactionCount += 1
    })

    const categoryBreakdownArray = Array.from(categoryBreakdown.values())
    const totalAmount = totalIncome + totalExpenses + totalSavings

    categoryBreakdownArray.forEach(category => {
      category.percentage = totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0
    })

    const summary: TransactionSummary = {
      totalIncome,
      totalExpenses,
      totalSavings,
      netAmount: totalIncome - totalExpenses - totalSavings,
      transactionCount: filteredTransactions.length,
      period: {
        startDate: filter.startDate || new Date(Math.min(...filteredTransactions.map(t => t.date.getTime()))),
        endDate: filter.endDate || new Date(Math.max(...filteredTransactions.map(t => t.date.getTime())))
      },
      categoryBreakdown: categoryBreakdownArray
    }

    return summary
  },

  // Obtenir le rapport mensuel
  getMonthlyReport: async (month, year) => {
    const startDate = getMonthStart(new Date(year, month - 1))
    const endDate = getMonthEnd(new Date(year, month - 1))
    
    const filter: TransactionFilter = { startDate, endDate }
    const summary = await get().calculateSummary(filter)
    
    // Calculer les comparaisons avec le mois précédent
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevStartDate = getMonthStart(new Date(prevYear, prevMonth - 1))
    const prevEndDate = getMonthEnd(new Date(prevYear, prevMonth - 1))
    
    const prevSummary = await get().calculateSummary({ 
      startDate: prevStartDate, 
      endDate: prevEndDate 
    })

    const report: MonthlyReport = {
      month,
      year,
      summary,
      budgetComparison: [], // À implémenter avec les budgets
      topCategories: summary.categoryBreakdown.slice(0, 5),
      savingsProgress: (summary.totalSavings / summary.totalIncome) * 100,
      previousMonthComparison: {
        incomeChange: ((summary.totalIncome - prevSummary.totalIncome) / prevSummary.totalIncome) * 100,
        expenseChange: ((summary.totalExpenses - prevSummary.totalExpenses) / prevSummary.totalExpenses) * 100,
        savingsChange: ((summary.totalSavings - prevSummary.totalSavings) / prevSummary.totalSavings) * 100
      }
    }

    return report
  },

  // Obtenir les transactions récentes
  getRecentTransactions: async (limit = 10) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return []

    return await db.getUserTransactions(user.id, limit)
  },

  // Obtenir les transactions par catégorie
  getTransactionsByCategory: async (categoryId) => {
    const { transactions } = get()
    return transactions.filter(t => t.categoryId === categoryId)
  },

  // Traiter les transactions récurrentes
  processRecurringTransactions: async () => {
    // À implémenter : logique pour créer automatiquement les transactions récurrentes
    console.log('Traitement des transactions récurrentes...')
  },

  // Créer une transaction récurrente
  createRecurringTransaction: async (transactionData) => {
    // À implémenter : logique pour les transactions récurrentes
    await get().addTransaction(transactionData)
  },

  // Utilitaires
  getTransactionById: (id) => {
    return get().transactions.find(t => t.id === id)
  },

  getTotalByType: (type, _filter = {}) => {
    const { transactions } = get()
    return transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0)
  }
}))
