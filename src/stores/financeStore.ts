import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storageService } from '@/services/storage'
import { Transaction, Category, FinancialSummary } from '@/types'

interface FinanceState {
  // État des données
  transactions: Transaction[]
  categories: Category[]
  currentBalance: number
  initialBalance: number
  isLoading: boolean
  error: string | null
  
  // Filtres et recherche
  filters: {
    dateRange: { start: Date; end: Date } | null
    categoryId: string | null
    type: 'income' | 'expense' | 'all'
    searchTerm: string
  }
  
  // Statistiques
  summary: FinancialSummary | null
  categoryStats: Array<{
    categoryId: string
    name: string
    amount: number
    count: number
    color: string
  }>
  
  // Actions
  loadTransactions: () => Promise<void>
  loadCategories: () => Promise<void>
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  createCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  
  // Filtres
  setFilters: (filters: Partial<FinanceState['filters']>) => void
  clearFilters: () => void
  
  // Statistiques
  loadSummary: (dateRange?: { start: Date; end: Date }) => Promise<void>
  loadCategoryStats: (dateRange?: { start: Date; end: Date }) => Promise<void>
  
  // Utilitaires
  setBalance: (balance: number) => void
  setInitialBalance: (balance: number) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

const defaultDateRange = {
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date()
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      // État initial
      transactions: [],
      categories: [],
      currentBalance: 0,
      initialBalance: 0,
      isLoading: false,
      error: null,
      
      filters: {
        dateRange: defaultDateRange,
        categoryId: null,
        type: 'all',
        searchTerm: ''
      },
      
      summary: null,
      categoryStats: [],
      
      // Actions pour les transactions
      loadTransactions: async () => {
        set({ isLoading: true, error: null })
        try {
          const { filters } = get()
          const transactions = await storageService.getTransactions({
            dateRange: filters.dateRange || undefined,
            categoryId: filters.categoryId || undefined,
            type: filters.type === 'all' ? undefined : filters.type,
            searchTerm: filters.searchTerm || undefined
          })
          
          set({ transactions, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des transactions',
            isLoading: false 
          })
        }
      },
      
      loadCategories: async () => {
        try {
          const categories = await storageService.getCategories()
          set({ categories })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erreur lors du chargement des catégories' })
        }
      },
      
      createTransaction: async (transactionData) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.createTransaction(transactionData)
          
          // Recharger les transactions et mettre à jour le solde
          await get().loadTransactions()
          
          // Mettre à jour le solde courant
          const { currentBalance } = get()
          const newBalance = transactionData.type === 'income' 
            ? currentBalance + transactionData.amount
            : currentBalance - transactionData.amount
          
          set({ currentBalance: newBalance, isLoading: false })
          
          // Recharger les statistiques
          await get().loadSummary()
          await get().loadCategoryStats()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création de la transaction',
            isLoading: false 
          })
        }
      },
      
      updateTransaction: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.updateTransaction(id, updates)
          await get().loadTransactions()
          await get().loadSummary()
          await get().loadCategoryStats()
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la transaction',
            isLoading: false 
          })
        }
      },
      
      deleteTransaction: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.deleteTransaction(id)
          await get().loadTransactions()
          await get().loadSummary()
          await get().loadCategoryStats()
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la transaction',
            isLoading: false 
          })
        }
      },
      
      // Actions pour les catégories
      createCategory: async (categoryData) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.createCategory(categoryData)
          await get().loadCategories()
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création de la catégorie',
            isLoading: false 
          })
        }
      },
      
      updateCategory: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.updateCategory(id, updates)
          await get().loadCategories()
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la catégorie',
            isLoading: false 
          })
        }
      },
      
      deleteCategory: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.deleteCategory(id)
          await get().loadCategories()
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la catégorie',
            isLoading: false 
          })
        }
      },
      
      // Actions pour les filtres
      setFilters: (newFilters) => {
        const currentFilters = get().filters
        const updatedFilters = { ...currentFilters, ...newFilters }
        set({ filters: updatedFilters })
        
        // Recharger les transactions avec les nouveaux filtres
        get().loadTransactions()
      },
      
      clearFilters: () => {
        set({
          filters: {
            dateRange: defaultDateRange,
            categoryId: null,
            type: 'all',
            searchTerm: ''
          }
        })
        get().loadTransactions()
      },
      
      // Actions pour les statistiques
      loadSummary: async (dateRange) => {
        try {
          const range = dateRange || get().filters.dateRange || defaultDateRange
          const summary = await storageService.getFinancialSummary(range)
          
          // Créer un objet FinancialSummary complet
          const fullSummary: FinancialSummary = {
            period: {
              start: range.start,
              end: range.end,
              type: 'month'
            },
            balance: {
              initial: get().initialBalance,
              current: get().currentBalance,
              change: summary.balance,
              changePercentage: get().initialBalance > 0 ? (summary.balance / get().initialBalance) * 100 : 0
            },
            income: {
              total: summary.totalIncome,
              average: summary.totalIncome / Math.max(1, summary.transactionCount),
              transactions: summary.transactionCount,
              topCategories: []
            },
            expenses: {
              total: summary.totalExpenses,
              average: summary.totalExpenses / Math.max(1, summary.transactionCount),
              transactions: summary.transactionCount,
              topCategories: [],
              fixed: 0,
              variable: summary.totalExpenses
            },
            savings: {
              total: summary.totalSavings,
              percentage: summary.totalIncome > 0 ? (summary.totalSavings / summary.totalIncome) * 100 : 0,
              boxes: [],
              goals: []
            },
            trends: {
              income: [],
              expenses: [],
              savings: []
            }
          }
          
          set({ summary: fullSummary })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erreur lors du chargement du résumé' })
        }
      },
      
      loadCategoryStats: async (dateRange) => {
        try {
          const range = dateRange || get().filters.dateRange || defaultDateRange
          const stats = await storageService.getCategoryStats(range)
          set({ categoryStats: stats })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques' })
        }
      },
      
      // Utilitaires
      setBalance: (balance) => set({ currentBalance: balance }),
      setInitialBalance: (balance) => set({ initialBalance: balance }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      reset: () => set({
        transactions: [],
        categories: [],
        currentBalance: 0,
        initialBalance: 0,
        isLoading: false,
        error: null,
        filters: {
          dateRange: defaultDateRange,
          categoryId: null,
          type: 'all',
          searchTerm: ''
        },
        summary: null,
        categoryStats: []
      })
    }),
    {
      name: 'finance-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentBalance: state.currentBalance,
        initialBalance: state.initialBalance,
        filters: state.filters
      })
    }
  )
)

// Hooks utilitaires
export const useTransactions = () => {
  const store = useFinanceStore()
  return {
    transactions: store.transactions,
    isLoading: store.isLoading,
    error: store.error,
    loadTransactions: store.loadTransactions,
    createTransaction: store.createTransaction,
    updateTransaction: store.updateTransaction,
    deleteTransaction: store.deleteTransaction
  }
}

export const useCategories = () => {
  const store = useFinanceStore()
  return {
    categories: store.categories,
    isLoading: store.isLoading,
    error: store.error,
    loadCategories: store.loadCategories,
    createCategory: store.createCategory,
    updateCategory: store.updateCategory,
    deleteCategory: store.deleteCategory
  }
}

export const useFinancialSummary = () => {
  const store = useFinanceStore()
  return {
    summary: store.summary,
    categoryStats: store.categoryStats,
    loadSummary: store.loadSummary,
    loadCategoryStats: store.loadCategoryStats
  }
}

export const useFinanceFilters = () => {
  const store = useFinanceStore()
  return {
    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters
  }
}

