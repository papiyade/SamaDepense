import { create } from 'zustand'
import { 
  type SavingsBox, 
  type SavingsBoxWithProgress, 
  type SavingsSummary,
  type SavingsGoal,
  type SavingsMilestone,
  DEFAULT_SAVINGS_TEMPLATES
} from '@/types'
import { db } from '@/lib/database'
import { useUserStore } from './userStore'
import { useTransactionStore } from './transactionStore'
import { v4 as uuidv4 } from 'uuid'

interface SavingsState {
  // État
  savingsBoxes: SavingsBoxWithProgress[]
  goals: SavingsGoal[]
  isLoading: boolean
  error: string | null
  summary: SavingsSummary | null

  // Actions CRUD - Savings Boxes
  createSavingsBox: (boxData: Omit<SavingsBox, 'id' | 'userId' | 'currentAmount' | 'createdAt' | 'updatedAt' | 'milestones'>) => Promise<void>
  updateSavingsBox: (id: string, updates: Partial<SavingsBox>) => Promise<void>
  deleteSavingsBox: (id: string) => Promise<void>
  loadSavingsBoxes: () => Promise<void>

  // Actions d'épargne
  addToSavings: (boxId: string, amount: number, description?: string) => Promise<void>
  withdrawFromSavings: (boxId: string, amount: number, description?: string) => Promise<void>
  transferBetweenBoxes: (fromBoxId: string, toBoxId: string, amount: number) => Promise<void>

  // Milestones
  addMilestone: (boxId: string, milestone: Omit<SavingsMilestone, 'id' | 'savingsBoxId' | 'createdAt'>) => Promise<void>
  completeMilestone: (milestoneId: string) => Promise<void>
  deleteMilestone: (milestoneId: string) => Promise<void>

  // Goals
  createGoal: (goalData: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>
  completeGoal: (id: string) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  // Auto-épargne
  processAutoSavings: () => Promise<void>
  toggleAutoSave: (boxId: string, enabled: boolean) => Promise<void>

  // Analyses et rapports
  calculateSummary: () => Promise<SavingsSummary>
  getSavingsProgress: (boxId: string) => number
  getProjectedCompletion: (boxId: string) => Date | null
  getTopPerformingBox: () => SavingsBoxWithProgress | null

  // Templates
  createFromTemplate: (templateIndex: number, customData?: Partial<SavingsBox>) => Promise<void>
  getTemplates: () => typeof DEFAULT_SAVINGS_TEMPLATES

  // Utilitaires
  getSavingsBoxById: (id: string) => SavingsBoxWithProgress | undefined
  getTotalSaved: () => number
  getTotalTarget: () => number
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  // État initial
  savingsBoxes: [],
  goals: [],
  isLoading: false,
  error: null,
  summary: null,

  // Créer une box d'épargne
  createSavingsBox: async (boxData) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) {
      set({ error: 'Utilisateur non connecté' })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const newBox: SavingsBox = {
        ...boxData,
        id: uuidv4(),
        userId: user.id,
        currentAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        milestones: []
      }

      await db.savingsBoxes.add(newBox)
      await get().loadSavingsBoxes()
      
      // Ajouter XP pour créer une box
      await useUserStore.getState().addXP(25)
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Erreur lors de la création de la box:', error)
      set({ 
        error: 'Impossible de créer la box d\'épargne', 
        isLoading: false 
      })
    }
  },

  // Mettre à jour une box d'épargne
  updateSavingsBox: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const existingBox = get().getSavingsBoxById(id)
      if (!existingBox) {
        throw new Error('Box d\'épargne non trouvée')
      }

      const updatedBox = {
        ...existingBox,
        ...updates,
        updatedAt: new Date()
      }

      await db.savingsBoxes.update(id, updatedBox)
      await get().loadSavingsBoxes()
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      set({ 
        error: 'Impossible de mettre à jour la box', 
        isLoading: false 
      })
    }
  },

  // Supprimer une box d'épargne
  deleteSavingsBox: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const box = get().getSavingsBoxById(id)
      if (!box) {
        throw new Error('Box non trouvée')
      }

      // Si la box contient de l'argent, le remettre dans le solde principal
      if (box.currentAmount > 0) {
        const user = useUserStore.getState().getCurrentUser()
        if (user) {
          await useUserStore.getState().updateUser({
            currentBalance: user.currentBalance + box.currentAmount
          })
        }
      }

      await db.savingsBoxes.delete(id)
      await get().loadSavingsBoxes()
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      set({ 
        error: 'Impossible de supprimer la box', 
        isLoading: false 
      })
    }
  },

  // Charger les boxes d'épargne
  loadSavingsBoxes: async () => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    set({ isLoading: true, error: null })

    try {
      const boxes = await db.getUserSavingsBoxes(user.id)
      
      // Calculer les progrès pour chaque box
      const boxesWithProgress: SavingsBoxWithProgress[] = boxes.map(box => {
        const progressPercentage = box.targetAmount > 0 
          ? (box.currentAmount / box.targetAmount) * 100 
          : 0

        const remainingAmount = Math.max(0, box.targetAmount - box.currentAmount)
        
        // Estimation de la date de completion basée sur les contributions moyennes
        let estimatedCompletionDate: Date | undefined
        if (remainingAmount > 0) {
          // Logique simplifiée - à améliorer avec l'historique réel
          const monthlyContribution = 50000 // Estimation par défaut
          const monthsToComplete = Math.ceil(remainingAmount / monthlyContribution)
          estimatedCompletionDate = new Date()
          estimatedCompletionDate.setMonth(estimatedCompletionDate.getMonth() + monthsToComplete)
        }

        const completedMilestones = box.milestones.filter(m => m.isCompleted).length
        const isOnTrack = progressPercentage >= 50 // Logique simplifiée

        return {
          ...box,
          progressPercentage,
          remainingAmount,
          estimatedCompletionDate,
          monthlyContribution: 50000, // À calculer depuis l'historique
          daysToTarget: box.deadline ? Math.ceil((box.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : undefined,
          isOnTrack,
          completedMilestones,
          totalMilestones: box.milestones.length
        }
      })

      set({ 
        savingsBoxes: boxesWithProgress, 
        isLoading: false 
      })

      // Calculer le résumé
      const summary = await get().calculateSummary()
      set({ summary })

    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      set({ 
        error: 'Impossible de charger les boxes d\'épargne', 
        isLoading: false 
      })
    }
  },

  // Ajouter de l'argent à une box
  addToSavings: async (boxId, amount, description = 'Ajout à l\'épargne') => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    const box = get().getSavingsBoxById(boxId)
    if (!box) {
      set({ error: 'Box d\'épargne non trouvée' })
      return
    }

    if (user.currentBalance < amount) {
      set({ error: 'Solde insuffisant' })
      return
    }

    try {
      // Mettre à jour la box
      await get().updateSavingsBox(boxId, {
        currentAmount: box.currentAmount + amount
      })

      // Mettre à jour le solde utilisateur
      await useUserStore.getState().updateUser({
        currentBalance: user.currentBalance - amount
      })

      // Créer une transaction d'épargne
      await useTransactionStore.getState().addTransaction({
        type: 'savings' as any,
        amount,
        description,
        categoryId: 'savings', // Catégorie spéciale pour l'épargne
        savingsBoxId: boxId,
        date: new Date(),
        isRecurring: false,
        tags: ['épargne']
      })

      // Ajouter XP
      await useUserStore.getState().addXP(Math.floor(amount / 1000))

      // Vérifier les milestones
      const updatedBox = get().getSavingsBoxById(boxId)
      if (updatedBox) {
        for (const milestone of updatedBox.milestones) {
          if (!milestone.isCompleted && updatedBox.currentAmount >= milestone.targetAmount) {
            await get().completeMilestone(milestone.id)
          }
        }
      }

    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      set({ error: 'Impossible d\'ajouter à l\'épargne' })
    }
  },

  // Retirer de l'argent d'une box
  withdrawFromSavings: async (boxId, amount, description = 'Retrait de l\'épargne') => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    const box = get().getSavingsBoxById(boxId)
    if (!box) {
      set({ error: 'Box d\'épargne non trouvée' })
      return
    }

    if (box.currentAmount < amount) {
      set({ error: 'Montant insuffisant dans la box' })
      return
    }

    try {
      // Mettre à jour la box
      await get().updateSavingsBox(boxId, {
        currentAmount: box.currentAmount - amount
      })

      // Mettre à jour le solde utilisateur
      await useUserStore.getState().updateUser({
        currentBalance: user.currentBalance + amount
      })

      // Créer une transaction de retrait
      await useTransactionStore.getState().addTransaction({
        type: 'expense' as any,
        amount,
        description,
        categoryId: 'savings-withdrawal',
        savingsBoxId: boxId,
        date: new Date(),
        isRecurring: false,
        tags: ['retrait', 'épargne']
      })

    } catch (error) {
      console.error('Erreur lors du retrait:', error)
      set({ error: 'Impossible de retirer de l\'épargne' })
    }
  },

  // Transférer entre boxes
  transferBetweenBoxes: async (fromBoxId, toBoxId, amount) => {
    const fromBox = get().getSavingsBoxById(fromBoxId)
    const toBox = get().getSavingsBoxById(toBoxId)

    if (!fromBox || !toBox) {
      set({ error: 'Box d\'épargne non trouvée' })
      return
    }

    if (fromBox.currentAmount < amount) {
      set({ error: 'Montant insuffisant dans la box source' })
      return
    }

    try {
      await get().updateSavingsBox(fromBoxId, {
        currentAmount: fromBox.currentAmount - amount
      })

      await get().updateSavingsBox(toBoxId, {
        currentAmount: toBox.currentAmount + amount
      })

      // Créer une transaction de transfert
      await useTransactionStore.getState().addTransaction({
        type: 'transfer' as any,
        amount,
        description: `Transfert de ${fromBox.name} vers ${toBox.name}`,
        categoryId: 'transfer',
        date: new Date(),
        isRecurring: false,
        tags: ['transfert', 'épargne']
      })

    } catch (error) {
      console.error('Erreur lors du transfert:', error)
      set({ error: 'Impossible de transférer entre les boxes' })
    }
  },

  // Ajouter un milestone
  addMilestone: async (boxId, milestoneData) => {
    const box = get().getSavingsBoxById(boxId)
    if (!box) return

    const newMilestone: SavingsMilestone = {
      ...milestoneData,
      id: uuidv4(),
      savingsBoxId: boxId,
      isCompleted: false,
      createdAt: new Date()
    }

    const updatedMilestones = [...box.milestones, newMilestone]
    await get().updateSavingsBox(boxId, { milestones: updatedMilestones })
  },

  // Compléter un milestone
  completeMilestone: async (milestoneId) => {
    const { savingsBoxes } = get()
    
    for (const box of savingsBoxes) {
      const milestone = box.milestones.find(m => m.id === milestoneId)
      if (milestone && !milestone.isCompleted) {
        const updatedMilestones = box.milestones.map(m =>
          m.id === milestoneId 
            ? { ...m, isCompleted: true, completedAt: new Date() }
            : m
        )
        
        await get().updateSavingsBox(box.id, { milestones: updatedMilestones })
        
        // Ajouter XP bonus pour le milestone
        await useUserStore.getState().addXP(50)
        break
      }
    }
  },

  // Supprimer un milestone
  deleteMilestone: async (milestoneId) => {
    const { savingsBoxes } = get()
    
    for (const box of savingsBoxes) {
      const milestoneIndex = box.milestones.findIndex(m => m.id === milestoneId)
      if (milestoneIndex !== -1) {
        const updatedMilestones = box.milestones.filter(m => m.id !== milestoneId)
        await get().updateSavingsBox(box.id, { milestones: updatedMilestones })
        break
      }
    }
  },

  // Créer un objectif
  createGoal: async (goalData) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    const newGoal: SavingsGoal = {
      ...goalData,
      id: uuidv4(),
      userId: user.id,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Note: Les goals ne sont pas encore implémentés dans la DB
    // await db.goals.add(newGoal)
    
    set(state => ({
      goals: [...state.goals, newGoal]
    }))
  },

  // Mettre à jour un objectif
  updateGoal: async (id, updates) => {
    set(state => ({
      goals: state.goals.map(goal =>
        goal.id === id 
          ? { ...goal, ...updates, updatedAt: new Date() }
          : goal
      )
    }))
  },

  // Compléter un objectif
  completeGoal: async (id) => {
    await get().updateGoal(id, {
      isCompleted: true,
      completedAt: new Date()
    })

    // Ajouter XP bonus
    await useUserStore.getState().addXP(200)
  },

  // Supprimer un objectif
  deleteGoal: async (id) => {
    set(state => ({
      goals: state.goals.filter(goal => goal.id !== id)
    }))
  },

  // Traiter l'auto-épargne
  processAutoSavings: async () => {
    const { savingsBoxes } = get()
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    for (const box of savingsBoxes) {
      if (box.autoSave?.isEnabled) {
        const now = new Date()
        if (now >= box.autoSave.nextSaveDate) {
          let amount = box.autoSave.amount

          if (box.autoSave.sourceType === 'percentage' && box.autoSave.percentage) {
            // Calculer le pourcentage des revenus du mois
            const monthlyIncome = 100000 // À calculer depuis les transactions
            amount = (monthlyIncome * box.autoSave.percentage) / 100
          }

          if (user.currentBalance >= amount) {
            await get().addToSavings(box.id, amount, 'Épargne automatique')
            
            // Programmer la prochaine épargne
            const nextDate = new Date(now)
            switch (box.autoSave.frequency) {
              case 'daily':
                nextDate.setDate(nextDate.getDate() + 1)
                break
              case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7)
                break
              case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1)
                break
            }

            await get().updateSavingsBox(box.id, {
              autoSave: {
                ...box.autoSave,
                nextSaveDate: nextDate
              }
            })
          }
        }
      }
    }
  },

  // Activer/désactiver l'auto-épargne
  toggleAutoSave: async (boxId, enabled) => {
    const box = get().getSavingsBoxById(boxId)
    if (!box || !box.autoSave) return

    await get().updateSavingsBox(boxId, {
      autoSave: {
        ...box.autoSave,
        isEnabled: enabled
      }
    })
  },

  // Calculer le résumé
  calculateSummary: async () => {
    const { savingsBoxes } = get()
    
    const totalSaved = savingsBoxes.reduce((sum, box) => sum + box.currentAmount, 0)
    const totalTarget = savingsBoxes.reduce((sum, box) => sum + box.targetAmount, 0)
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
    
    const activeBoxes = savingsBoxes.filter(box => box.isActive).length
    const completedBoxes = savingsBoxes.filter(box => box.progressPercentage >= 100).length
    
    const monthlyContributions = savingsBoxes.reduce((sum, box) => sum + box.monthlyContribution, 0)
    
    const topPerformingBox = savingsBoxes.reduce((best, current) => 
      current.progressPercentage > (best?.progressPercentage || 0) ? current : best
    , null as SavingsBoxWithProgress | null)

    const summary: SavingsSummary = {
      totalSaved,
      totalTarget,
      overallProgress,
      activeBoxes,
      completedBoxes,
      monthlyContributions,
      topPerformingBox: topPerformingBox || undefined
    }

    return summary
  },

  // Obtenir le progrès d'une box
  getSavingsProgress: (boxId) => {
    const box = get().getSavingsBoxById(boxId)
    return box ? box.progressPercentage : 0
  },

  // Obtenir la date de completion projetée
  getProjectedCompletion: (boxId) => {
    const box = get().getSavingsBoxById(boxId)
    return box?.estimatedCompletionDate || null
  },

  // Obtenir la box la plus performante
  getTopPerformingBox: () => {
    const { savingsBoxes } = get()
    return savingsBoxes.reduce((best, current) => 
      current.progressPercentage > (best?.progressPercentage || 0) ? current : best
    , null as SavingsBoxWithProgress | null)
  },

  // Créer depuis un template
  createFromTemplate: async (templateIndex, customData = {}) => {
    const template = DEFAULT_SAVINGS_TEMPLATES[templateIndex]
    if (!template) return

    await get().createSavingsBox({
      ...template,
      ...customData
    })
  },

  // Obtenir les templates
  getTemplates: () => DEFAULT_SAVINGS_TEMPLATES,

  // Utilitaires
  getSavingsBoxById: (id) => {
    return get().savingsBoxes.find(box => box.id === id)
  },

  getTotalSaved: () => {
    return get().savingsBoxes.reduce((sum, box) => sum + box.currentAmount, 0)
  },

  getTotalTarget: () => {
    return get().savingsBoxes.reduce((sum, box) => sum + box.targetAmount, 0)
  }
}))
