import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storageService } from '@/services/storage'
import { SavingsBox, FinancialGoal, Transaction } from '@/types'

interface SavingsState {
  // État des données
  savingsBoxes: SavingsBox[]
  financialGoals: FinancialGoal[]
  isLoading: boolean
  error: string | null
  
  // Statistiques d'épargne
  totalSavings: number
  savingsRate: number // Pourcentage d'épargne
  monthlyTarget: number
  
  // Progression des objectifs
  goalsProgress: Array<{
    goalId: string
    title: string
    current: number
    target: number
    percentage: number
    daysRemaining: number
    onTrack: boolean
  }>
  
  // Actions pour les boxes d'épargne
  loadSavingsBoxes: () => Promise<void>
  createSavingsBox: (box: Omit<SavingsBox, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateSavingsBox: (id: string, updates: Partial<SavingsBox>) => Promise<void>
  deleteSavingsBox: (id: string) => Promise<void>
  transferToBox: (boxId: string, amount: number, description?: string) => Promise<void>
  
  // Actions pour les objectifs financiers
  loadFinancialGoals: () => Promise<void>
  createFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<void>
  deleteFinancialGoal: (id: string) => Promise<void>
  
  // Statistiques et calculs
  calculateSavingsRate: () => Promise<void>
  updateGoalsProgress: () => Promise<void>
  getSavingsBoxTransactions: (boxId: string) => Promise<Transaction[]>
  
  // Utilitaires
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

export const useSavingsStore = create<SavingsState>()(
  persist(
    (set, get) => ({
      // État initial
      savingsBoxes: [],
      financialGoals: [],
      isLoading: false,
      error: null,
      totalSavings: 0,
      savingsRate: 0,
      monthlyTarget: 0,
      goalsProgress: [],
      
      // Actions pour les boxes d'épargne
      loadSavingsBoxes: async () => {
        set({ isLoading: true, error: null })
        try {
          const boxes = await storageService.getSavingsBoxes()
          const totalSavings = boxes.reduce((sum, box) => sum + box.currentAmount, 0)
          
          set({ 
            savingsBoxes: boxes, 
            totalSavings,
            isLoading: false 
          })
          
          // Mettre à jour les statistiques
          await get().calculateSavingsRate()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des épargnes',
            isLoading: false 
          })
        }
      },
      
      createSavingsBox: async (boxData) => {
        set({ isLoading: true, error: null })
        try {
          // Valeurs par défaut pour une nouvelle box
          const newBox = {
            ...boxData,
            currentAmount: 0,
            isActive: true,
            milestones: [],
            ...boxData
          }
          
          await storageService.createSavingsBox(newBox)
          await get().loadSavingsBoxes()
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création de la box d\'épargne',
            isLoading: false 
          })
        }
      },
      
      updateSavingsBox: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.updateSavingsBox(id, updates)
          await get().loadSavingsBoxes()
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la box d\'épargne',
            isLoading: false 
          })
        }
      },
      
      deleteSavingsBox: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.deleteSavingsBox(id)
          await get().loadSavingsBoxes()
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la box d\'épargne',
            isLoading: false 
          })
        }
      },
      
      transferToBox: async (boxId, amount, description) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.transferToSavingsBox(boxId, amount, description || 'Transfert vers épargne')
          await get().loadSavingsBoxes()
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du transfert',
            isLoading: false 
          })
        }
      },
      
      // Actions pour les objectifs financiers
      loadFinancialGoals: async () => {
        set({ isLoading: true, error: null })
        try {
          // Pour l'instant, on utilise une implémentation basique
          // À terme, cela viendra de la base de données
          const goals: FinancialGoal[] = []
          
          set({ 
            financialGoals: goals,
            isLoading: false 
          })
          
          await get().updateGoalsProgress()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des objectifs',
            isLoading: false 
          })
        }
      },
      
      createFinancialGoal: async (goalData) => {
        set({ isLoading: true, error: null })
        try {
          // Implémentation future avec la base de données
          const newGoal: FinancialGoal = {
            ...goalData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            currentAmount: 0,
            status: 'active',
            milestones: []
          }
          
          const currentGoals = get().financialGoals
          set({ 
            financialGoals: [...currentGoals, newGoal],
            isLoading: false 
          })
          
          await get().updateGoalsProgress()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'objectif',
            isLoading: false 
          })
        }
      },
      
      updateFinancialGoal: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          const currentGoals = get().financialGoals
          const updatedGoals = currentGoals.map(goal => 
            goal.id === id 
              ? { ...goal, ...updates, updatedAt: new Date() }
              : goal
          )
          
          set({ 
            financialGoals: updatedGoals,
            isLoading: false 
          })
          
          await get().updateGoalsProgress()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'objectif',
            isLoading: false 
          })
        }
      },
      
      deleteFinancialGoal: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const currentGoals = get().financialGoals
          const filteredGoals = currentGoals.filter(goal => goal.id !== id)
          
          set({ 
            financialGoals: filteredGoals,
            isLoading: false 
          })
          
          await get().updateGoalsProgress()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'objectif',
            isLoading: false 
          })
        }
      },
      
      // Statistiques et calculs
      calculateSavingsRate: async () => {
        try {
          const now = new Date()
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          
          const summary = await storageService.getFinancialSummary({
            start: startOfMonth,
            end: endOfMonth
          })
          
          const savingsRate = summary.totalIncome > 0 
            ? (summary.totalSavings / summary.totalIncome) * 100 
            : 0
          
          set({ savingsRate })
        } catch (error) {
          console.error('Erreur lors du calcul du taux d\'épargne:', error)
        }
      },
      
      updateGoalsProgress: async () => {
        try {
          const { financialGoals } = get()
          
          const progress = financialGoals.map(goal => {
            const percentage = goal.targetAmount > 0 
              ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
              : 0
            
            const now = new Date()
            const daysRemaining = Math.ceil(
              (goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )
            
            // Calculer si l'objectif est sur la bonne voie
            const daysSinceStart = Math.ceil(
              (now.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            )
            const totalDays = Math.ceil(
              (goal.targetDate.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            )
            const expectedPercentage = totalDays > 0 ? (daysSinceStart / totalDays) * 100 : 0
            const onTrack = percentage >= expectedPercentage * 0.9 // 10% de marge
            
            return {
              goalId: goal.id,
              title: goal.title,
              current: goal.currentAmount,
              target: goal.targetAmount,
              percentage,
              daysRemaining: Math.max(0, daysRemaining),
              onTrack
            }
          })
          
          set({ goalsProgress: progress })
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la progression:', error)
        }
      },
      
      getSavingsBoxTransactions: async (boxId: string) => {
        try {
          return await storageService.getTransactionsBySavingsBox(boxId)
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erreur lors du chargement des transactions' })
          return []
        }
      },
      
      // Utilitaires
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      reset: () => set({
        savingsBoxes: [],
        financialGoals: [],
        isLoading: false,
        error: null,
        totalSavings: 0,
        savingsRate: 0,
        monthlyTarget: 0,
        goalsProgress: []
      })
    }),
    {
      name: 'savings-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        totalSavings: state.totalSavings,
        savingsRate: state.savingsRate,
        monthlyTarget: state.monthlyTarget
      })
    }
  )
)

// Hooks utilitaires
export const useSavingsBoxes = () => {
  const store = useSavingsStore()
  return {
    savingsBoxes: store.savingsBoxes,
    totalSavings: store.totalSavings,
    isLoading: store.isLoading,
    error: store.error,
    loadSavingsBoxes: store.loadSavingsBoxes,
    createSavingsBox: store.createSavingsBox,
    updateSavingsBox: store.updateSavingsBox,
    deleteSavingsBox: store.deleteSavingsBox,
    transferToBox: store.transferToBox
  }
}

export const useFinancialGoals = () => {
  const store = useSavingsStore()
  return {
    goals: store.financialGoals,
    goalsProgress: store.goalsProgress,
    isLoading: store.isLoading,
    error: store.error,
    loadFinancialGoals: store.loadFinancialGoals,
    createFinancialGoal: store.createFinancialGoal,
    updateFinancialGoal: store.updateFinancialGoal,
    deleteFinancialGoal: store.deleteFinancialGoal,
    updateGoalsProgress: store.updateGoalsProgress
  }
}

export const useSavingsStats = () => {
  const store = useSavingsStore()
  return {
    totalSavings: store.totalSavings,
    savingsRate: store.savingsRate,
    monthlyTarget: store.monthlyTarget,
    calculateSavingsRate: store.calculateSavingsRate
  }
}

