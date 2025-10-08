import { create } from 'zustand'
import { 
  type Category, 
  type CategoryWithStats,
  CategoryType,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES 
} from '@/types'
import { db } from '@/lib/database'
import { useUserStore } from './userStore'
import { v4 as uuidv4 } from 'uuid'

interface CategoryState {
  // État
  categories: CategoryWithStats[]
  isLoading: boolean
  error: string | null

  // Actions CRUD
  createCategory: (categoryData: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isDefault'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  loadCategories: (type?: CategoryType) => Promise<void>

  // Gestion des budgets
  setBudget: (categoryId: string, monthlyLimit: number, alertThreshold?: number) => Promise<void>
  removeBudget: (categoryId: string) => Promise<void>
  toggleBudgetAlert: (categoryId: string, enabled: boolean) => Promise<void>

  // Analyses et statistiques
  calculateCategoryStats: (categoryId: string) => Promise<CategoryWithStats | null>
  getCategorySpending: (categoryId: string, startDate?: Date, endDate?: Date) => Promise<number>
  getBudgetUsage: (categoryId: string) => Promise<number>
  getTopCategories: (limit?: number, type?: CategoryType) => CategoryWithStats[]

  // Organisation
  reorderCategories: (categoryIds: string[]) => Promise<void>
  toggleCategoryActive: (categoryId: string, active: boolean) => Promise<void>

  // Utilitaires
  getCategoryById: (id: string) => CategoryWithStats | undefined
  getCategoriesByType: (type: CategoryType) => CategoryWithStats[]
  getDefaultCategories: () => Category[]
  searchCategories: (searchTerm: string) => CategoryWithStats[]
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  // État initial
  categories: [],
  isLoading: false,
  error: null,

  // Créer une catégorie
  createCategory: async (categoryData) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) {
      set({ error: 'Utilisateur non connecté' })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const newCategory: Category = {
        ...categoryData,
        id: uuidv4(),
        userId: user.id,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.categories.add(newCategory)
      await get().loadCategories()
      
      // Ajouter XP pour créer une catégorie
      await useUserStore.getState().addXP(15)
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error)
      set({ 
        error: 'Impossible de créer la catégorie', 
        isLoading: false 
      })
    }
  },

  // Mettre à jour une catégorie
  updateCategory: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const existingCategory = get().getCategoryById(id)
      if (!existingCategory) {
        throw new Error('Catégorie non trouvée')
      }

      // Ne pas permettre la modification des catégories par défaut (sauf le budget)
      if (existingCategory.isDefault && Object.keys(updates).some(key => key !== 'budget')) {
        throw new Error('Impossible de modifier une catégorie par défaut')
      }

      const updatedCategory = {
        ...existingCategory,
        ...updates,
        updatedAt: new Date()
      }

      await db.categories.update(id, updatedCategory)
      await get().loadCategories()
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      set({ 
        error: 'Impossible de mettre à jour la catégorie', 
        isLoading: false 
      })
    }
  },

  // Supprimer une catégorie
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const category = get().getCategoryById(id)
      if (!category) {
        throw new Error('Catégorie non trouvée')
      }

      if (category.isDefault) {
        throw new Error('Impossible de supprimer une catégorie par défaut')
      }

      // Vérifier s'il y a des transactions liées à cette catégorie
      const user = useUserStore.getState().getCurrentUser()
      if (user) {
        const transactions = await db.getUserTransactions(user.id)
        const hasTransactions = transactions.some(t => t.categoryId === id)
        
        if (hasTransactions) {
          // Plutôt que de supprimer, désactiver la catégorie
          await get().toggleCategoryActive(id, false)
          set({ isLoading: false })
          return
        }
      }

      await db.categories.delete(id)
      await get().loadCategories()
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      set({ 
        error: 'Impossible de supprimer la catégorie', 
        isLoading: false 
      })
    }
  },

  // Charger les catégories
  loadCategories: async (type) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    set({ isLoading: true, error: null })

    try {
      const categories = await db.getUserCategories(user.id, type)
      
      // Calculer les statistiques pour chaque catégorie
      const categoriesWithStats: CategoryWithStats[] = await Promise.all(
        categories.map(async (category) => {
          const stats = await get().calculateCategoryStats(category.id)
          return stats || {
            ...category,
            currentMonthSpent: 0,
            budgetUsagePercentage: 0,
            transactionCount: 0,
            averageTransaction: 0,
            trend: 'stable' as const
          }
        })
      )

      set({ 
        categories: categoriesWithStats, 
        isLoading: false 
      })

    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      set({ 
        error: 'Impossible de charger les catégories', 
        isLoading: false 
      })
    }
  },

  // Définir un budget pour une catégorie
  setBudget: async (categoryId, monthlyLimit, alertThreshold = 80) => {
    const budget = {
      monthlyLimit,
      alertThreshold,
      isActive: true,
      rollover: false
    }

    await get().updateCategory(categoryId, { budget })
  },

  // Supprimer le budget d'une catégorie
  removeBudget: async (categoryId) => {
    await get().updateCategory(categoryId, { budget: undefined })
  },

  // Activer/désactiver les alertes budget
  toggleBudgetAlert: async (categoryId, enabled) => {
    const category = get().getCategoryById(categoryId)
    if (!category?.budget) return

    const updatedBudget = {
      ...category.budget,
      isActive: enabled
    }

    await get().updateCategory(categoryId, { budget: updatedBudget })
  },

  // Calculer les statistiques d'une catégorie
  calculateCategoryStats: async (categoryId) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return null

    const category = get().getCategoryById(categoryId)
    if (!category) return null

    try {
      // Obtenir toutes les transactions de cette catégorie
      const allTransactions = await db.getUserTransactions(user.id)
      const categoryTransactions = allTransactions.filter(t => t.categoryId === categoryId)

      // Calculer les dépenses du mois courant
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const currentMonthTransactions = categoryTransactions.filter(
        t => t.date >= monthStart && t.date <= monthEnd
      )

      const currentMonthSpent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
      const transactionCount = categoryTransactions.length
      const averageTransaction = transactionCount > 0 ? currentMonthSpent / transactionCount : 0

      // Calculer l'utilisation du budget
      let budgetUsagePercentage = 0
      if (category.budget?.monthlyLimit) {
        budgetUsagePercentage = (currentMonthSpent / category.budget.monthlyLimit) * 100
      }

      // Calculer la tendance (comparaison avec le mois précédent)
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      const prevMonthTransactions = categoryTransactions.filter(
        t => t.date >= prevMonthStart && t.date <= prevMonthEnd
      )

      const prevMonthSpent = prevMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
      
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (currentMonthSpent > prevMonthSpent * 1.1) {
        trend = 'up'
      } else if (currentMonthSpent < prevMonthSpent * 0.9) {
        trend = 'down'
      }

      const categoryWithStats: CategoryWithStats = {
        ...category,
        currentMonthSpent,
        budgetUsagePercentage,
        transactionCount,
        averageTransaction,
        trend
      }

      return categoryWithStats

    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      return null
    }
  },

  // Obtenir les dépenses d'une catégorie
  getCategorySpending: async (categoryId, startDate, endDate) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return 0

    try {
      const transactions = await db.getUserTransactions(user.id)
      const categoryTransactions = transactions.filter(t => {
        if (t.categoryId !== categoryId) return false
        if (startDate && t.date < startDate) return false
        if (endDate && t.date > endDate) return false
        return true
      })

      return categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
    } catch (error) {
      console.error('Erreur lors du calcul des dépenses:', error)
      return 0
    }
  },

  // Obtenir l'utilisation du budget
  getBudgetUsage: async (categoryId) => {
    const category = get().getCategoryById(categoryId)
    if (!category?.budget) return 0

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const spent = await get().getCategorySpending(categoryId, monthStart, monthEnd)
    return (spent / category.budget.monthlyLimit) * 100
  },

  // Obtenir les top catégories
  getTopCategories: (limit = 5, type) => {
    const { categories } = get()
    
    let filteredCategories = categories
    if (type) {
      filteredCategories = categories.filter(c => c.type === type)
    }

    return filteredCategories
      .sort((a, b) => b.currentMonthSpent - a.currentMonthSpent)
      .slice(0, limit)
  },

  // Réorganiser les catégories
  reorderCategories: async (categoryIds) => {
    try {
      const updates = categoryIds.map((id, index) => ({
        id,
        sortOrder: index + 1
      }))

      for (const update of updates) {
        await get().updateCategory(update.id, { sortOrder: update.sortOrder })
      }

      await get().loadCategories()
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error)
      set({ error: 'Impossible de réorganiser les catégories' })
    }
  },

  // Activer/désactiver une catégorie
  toggleCategoryActive: async (categoryId, active) => {
    await get().updateCategory(categoryId, { isActive: active })
  },

  // Utilitaires
  getCategoryById: (id) => {
    return get().categories.find(c => c.id === id)
  },

  getCategoriesByType: (type) => {
    return get().categories.filter(c => c.type === type && c.isActive)
  },

  getDefaultCategories: () => {
    return [
      ...DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
        ...cat,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      ...DEFAULT_INCOME_CATEGORIES.map(cat => ({
        ...cat,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ]
  },

  searchCategories: (searchTerm) => {
    const { categories } = get()
    const searchLower = searchTerm.toLowerCase()
    
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchLower) ||
      c.description?.toLowerCase().includes(searchLower)
    )
  }
}))
