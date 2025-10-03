import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Achievement, UserStats, OnboardingProgress, PersonalizedTip } from '@/types'

interface UserState {
  // Données utilisateur
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Onboarding
  onboardingProgress: OnboardingProgress | null
  isOnboardingCompleted: boolean
  
  // Gamification
  achievements: Achievement[]
  userStats: UserStats | null
  currentLevel: number
  currentXP: number
  xpToNextLevel: number
  
  // Conseils personnalisés
  personalizedTips: PersonalizedTip[]
  unreadTipsCount: number
  
  // Actions utilisateur
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>
  
  // Actions onboarding
  startOnboarding: () => void
  completeOnboardingStep: (stepId: string) => void
  skipOnboardingStep: (stepId: string) => void
  completeOnboarding: () => void
  
  // Actions gamification
  loadAchievements: () => Promise<void>
  unlockAchievement: (achievementId: string) => Promise<void>
  addXP: (amount: number, reason: string) => Promise<void>
  updateUserStats: () => Promise<void>
  
  // Actions conseils
  loadPersonalizedTips: () => Promise<void>
  markTipAsRead: (tipId: string) => void
  bookmarkTip: (tipId: string) => void
  dismissTip: (tipId: string) => void
  
  // Utilitaires
  setError: (error: string | null) => void
  clearError: () => void
  logout: () => void
  reset: () => void
}

// Données par défaut pour l'onboarding
const defaultOnboardingSteps = [
  {
    id: 'welcome',
    title: 'Bienvenue dans SamaDepense',
    description: 'Découvrez comment gérer vos finances facilement',
    component: 'WelcomeStep',
    isCompleted: false,
    isOptional: false,
    order: 1
  },
  {
    id: 'initial-balance',
    title: 'Solde initial',
    description: 'Définissez votre solde de départ',
    component: 'InitialBalanceStep',
    isCompleted: false,
    isOptional: false,
    order: 2
  },
  {
    id: 'categories',
    title: 'Catégories',
    description: 'Personnalisez vos catégories de dépenses',
    component: 'CategoriesStep',
    isCompleted: false,
    isOptional: true,
    order: 3
  },
  {
    id: 'savings-boxes',
    title: 'Épargne',
    description: 'Créez vos premières boxes d\'épargne',
    component: 'SavingsBoxesStep',
    isCompleted: false,
    isOptional: true,
    order: 4
  },
  {
    id: 'preferences',
    title: 'Préférences',
    description: 'Configurez l\'application selon vos besoins',
    component: 'PreferencesStep',
    isCompleted: false,
    isOptional: true,
    order: 5
  }
]

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      onboardingProgress: null,
      isOnboardingCompleted: false,
      
      achievements: [],
      userStats: null,
      currentLevel: 1,
      currentXP: 0,
      xpToNextLevel: 100,
      
      personalizedTips: [],
      unreadTipsCount: 0,
      
      // Actions utilisateur
      createUser: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const newUser: User = {
            ...userData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            achievements: [],
            level: {
              current: 1,
              title: 'Débutant',
              xp: 0,
              xpToNext: 100,
              totalXp: 0,
              benefits: ['Accès aux fonctionnalités de base']
            },
            onboardingCompleted: false,
            lastActiveAt: new Date()
          }
          
          set({ 
            user: newUser,
            isAuthenticated: true,
            isLoading: false,
            currentLevel: 1,
            currentXP: 0,
            xpToNextLevel: 100
          })
          
          // Initialiser l'onboarding
          get().startOnboarding()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création du profil',
            isLoading: false 
          })
        }
      },
      
      updateUser: async (updates) => {
        set({ isLoading: true, error: null })
        try {
          const currentUser = get().user
          if (!currentUser) throw new Error('Aucun utilisateur connecté')
          
          const updatedUser = {
            ...currentUser,
            ...updates,
            updatedAt: new Date()
          }
          
          set({ 
            user: updatedUser,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil',
            isLoading: false 
          })
        }
      },
      
      updatePreferences: async (preferences) => {
        const currentUser = get().user
        if (!currentUser) return
        
        const updatedPreferences = {
          ...currentUser.preferences,
          ...preferences
        }
        
        await get().updateUser({ preferences: updatedPreferences })
      },
      
      // Actions onboarding
      startOnboarding: () => {
        const onboardingProgress: OnboardingProgress = {
          currentStep: 0,
          totalSteps: defaultOnboardingSteps.length,
          completedSteps: [],
          skippedSteps: [],
          isCompleted: false,
          startedAt: new Date()
        }
        
        set({ 
          onboardingProgress,
          isOnboardingCompleted: false 
        })
      },
      
      completeOnboardingStep: (stepId) => {
        const progress = get().onboardingProgress
        if (!progress) return
        
        const updatedProgress = {
          ...progress,
          completedSteps: [...progress.completedSteps, stepId],
          currentStep: progress.currentStep + 1
        }
        
        // Vérifier si l'onboarding est terminé
        const requiredSteps = defaultOnboardingSteps.filter(step => !step.isOptional)
        const completedRequiredSteps = requiredSteps.filter(step => 
          updatedProgress.completedSteps.includes(step.id)
        )
        
        if (completedRequiredSteps.length === requiredSteps.length) {
          updatedProgress.isCompleted = true
          updatedProgress.completedAt = new Date()
          
          set({ 
            onboardingProgress: updatedProgress,
            isOnboardingCompleted: true 
          })
          
          // Marquer l'utilisateur comme ayant terminé l'onboarding
          get().updateUser({ onboardingCompleted: true })
          
          // Ajouter de l'XP pour avoir terminé l'onboarding
          get().addXP(50, 'Onboarding terminé')
        } else {
          set({ onboardingProgress: updatedProgress })
        }
      },
      
      skipOnboardingStep: (stepId) => {
        const progress = get().onboardingProgress
        if (!progress) return
        
        const updatedProgress = {
          ...progress,
          skippedSteps: [...progress.skippedSteps, stepId],
          currentStep: progress.currentStep + 1
        }
        
        set({ onboardingProgress: updatedProgress })
      },
      
      completeOnboarding: () => {
        const progress = get().onboardingProgress
        if (!progress) return
        
        const updatedProgress = {
          ...progress,
          isCompleted: true,
          completedAt: new Date()
        }
        
        set({ 
          onboardingProgress: updatedProgress,
          isOnboardingCompleted: true 
        })
        
        get().updateUser({ onboardingCompleted: true })
        get().addXP(100, 'Onboarding complété')
      },
      
      // Actions gamification
      loadAchievements: async () => {
        try {
          // Pour l'instant, on utilise des achievements par défaut
          // À terme, cela viendra de la base de données
          const defaultAchievements: Achievement[] = [
            {
              id: 'first-transaction',
              title: 'Premier pas',
              description: 'Enregistrez votre première transaction',
              icon: 'star',
              category: 'consistency',
              type: 'milestone',
              requirement: {
                type: 'transactions_count',
                value: 1
              },
              reward: {
                type: 'badge',
                value: 'first-transaction-badge',
                description: 'Badge Premier pas'
              },
              isUnlocked: false,
              progress: 0,
              rarity: 'common',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'savings-starter',
              title: 'Épargnant débutant',
              description: 'Créez votre première box d\'épargne',
              icon: 'piggy-bank',
              category: 'savings',
              type: 'milestone',
              requirement: {
                type: 'amount_saved',
                value: 1000
              },
              reward: {
                type: 'badge',
                value: 'savings-starter-badge',
                description: 'Badge Épargnant débutant'
              },
              isUnlocked: false,
              progress: 0,
              rarity: 'common',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
          
          set({ achievements: defaultAchievements })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erreur lors du chargement des achievements' })
        }
      },
      
      unlockAchievement: async (achievementId) => {
        try {
          const achievements = get().achievements
          const updatedAchievements = achievements.map(achievement => 
            achievement.id === achievementId
              ? { 
                  ...achievement, 
                  isUnlocked: true, 
                  unlockedAt: new Date(),
                  progress: 100
                }
              : achievement
          )
          
          set({ achievements: updatedAchievements })
          
          // Ajouter de l'XP pour l'achievement débloqué
          const unlockedAchievement = achievements.find(a => a.id === achievementId)
          if (unlockedAchievement) {
            const xpReward = unlockedAchievement.rarity === 'legendary' ? 100 :
                           unlockedAchievement.rarity === 'epic' ? 75 :
                           unlockedAchievement.rarity === 'rare' ? 50 : 25
            
            await get().addXP(xpReward, `Achievement: ${unlockedAchievement.title}`)
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erreur lors du déblocage de l\'achievement' })
        }
      },
      
      addXP: async (amount, reason) => {
        try {
          const { currentXP, xpToNextLevel, currentLevel } = get()
          let newXP = currentXP + amount
          let newLevel = currentLevel
          let newXPToNext = xpToNextLevel
          
          // Vérifier si on passe au niveau suivant
          while (newXP >= newXPToNext) {
            newXP -= newXPToNext
            newLevel += 1
            newXPToNext = newLevel * 100 // Formule simple pour l'XP requis
          }
          
          set({ 
            currentXP: newXP,
            currentLevel: newLevel,
            xpToNextLevel: newXPToNext - newXP
          })
          
          // Mettre à jour le niveau de l'utilisateur
          if (newLevel > currentLevel) {
            const levelTitles = [
              'Débutant', 'Apprenti', 'Gestionnaire', 'Expert', 
              'Maître', 'Guru', 'Légende'
            ]
            
            const newLevelData = {
              current: newLevel,
              title: levelTitles[Math.min(newLevel - 1, levelTitles.length - 1)],
              xp: newXP,
              xpToNext: newXPToNext - newXP,
              totalXp: (get().user?.level.totalXp || 0) + amount,
              benefits: [`Niveau ${newLevel} atteint`]
            }
            
            await get().updateUser({ level: newLevelData })
          }
        } catch (error) {
          console.error('Erreur lors de l\'ajout d\'XP:', error)
        }
      },
      
      updateUserStats: async () => {
        try {
          // Calculer les statistiques utilisateur
          // Cette fonction sera implémentée avec les données réelles
          const stats: UserStats = {
            totalTransactions: 0,
            totalSaved: 0,
            totalSpent: 0,
            averageMonthlyIncome: 0,
            averageMonthlyExpenses: 0,
            savingsRate: 0,
            budgetAccuracy: 0,
            goalsCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            categoriesUsed: 0,
            recurringTransactionsSet: 0,
            achievementsUnlocked: get().achievements.filter(a => a.isUnlocked).length,
            levelReached: get().currentLevel,
            joinedAt: get().user?.createdAt || new Date(),
            daysActive: 1
          }
          
          set({ userStats: stats })
        } catch (error) {
          console.error('Erreur lors de la mise à jour des statistiques:', error)
        }
      },
      
      // Actions conseils
      loadPersonalizedTips: async () => {
        try {
          // Pour l'instant, on utilise des conseils par défaut
          const defaultTips: PersonalizedTip[] = [
            {
              id: 'tip-1',
              title: 'Commencez par suivre vos dépenses',
              content: 'La première étape pour bien gérer ses finances est de savoir où va votre argent. Enregistrez toutes vos dépenses pendant une semaine.',
              category: 'budgeting',
              priority: 'high',
              isRead: false,
              isBookmarked: false,
              source: 'expert'
            },
            {
              id: 'tip-2',
              title: 'Règle des 50/30/20',
              content: 'Allouez 50% de vos revenus aux besoins essentiels, 30% aux loisirs et 20% à l\'épargne.',
              category: 'budgeting',
              priority: 'medium',
              isRead: false,
              isBookmarked: false,
              source: 'expert'
            }
          ]
          
          set({ 
            personalizedTips: defaultTips,
            unreadTipsCount: defaultTips.filter(tip => !tip.isRead).length
          })
        } catch (error) {
          console.error('Erreur lors du chargement des conseils:', error)
        }
      },
      
      markTipAsRead: (tipId) => {
        const tips = get().personalizedTips
        const updatedTips = tips.map(tip => 
          tip.id === tipId ? { ...tip, isRead: true } : tip
        )
        
        set({ 
          personalizedTips: updatedTips,
          unreadTipsCount: updatedTips.filter(tip => !tip.isRead).length
        })
      },
      
      bookmarkTip: (tipId) => {
        const tips = get().personalizedTips
        const updatedTips = tips.map(tip => 
          tip.id === tipId ? { ...tip, isBookmarked: !tip.isBookmarked } : tip
        )
        
        set({ personalizedTips: updatedTips })
      },
      
      dismissTip: (tipId) => {
        const tips = get().personalizedTips
        const updatedTips = tips.filter(tip => tip.id !== tipId)
        
        set({ 
          personalizedTips: updatedTips,
          unreadTipsCount: updatedTips.filter(tip => !tip.isRead).length
        })
      },
      
      // Utilitaires
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          onboardingProgress: null,
          isOnboardingCompleted: false,
          achievements: [],
          userStats: null,
          currentLevel: 1,
          currentXP: 0,
          xpToNextLevel: 100,
          personalizedTips: [],
          unreadTipsCount: 0
        })
      },
      
      reset: () => {
        get().logout()
      }
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        onboardingProgress: state.onboardingProgress,
        isOnboardingCompleted: state.isOnboardingCompleted,
        currentLevel: state.currentLevel,
        currentXP: state.currentXP,
        xpToNextLevel: state.xpToNextLevel
      })
    }
  )
)

// Hooks utilitaires
export const useAuth = () => {
  const store = useUserStore()
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    createUser: store.createUser,
    updateUser: store.updateUser,
    logout: store.logout
  }
}

export const useOnboarding = () => {
  const store = useUserStore()
  return {
    progress: store.onboardingProgress,
    isCompleted: store.isOnboardingCompleted,
    startOnboarding: store.startOnboarding,
    completeStep: store.completeOnboardingStep,
    skipStep: store.skipOnboardingStep,
    completeOnboarding: store.completeOnboarding
  }
}

export const useGamification = () => {
  const store = useUserStore()
  return {
    achievements: store.achievements,
    userStats: store.userStats,
    currentLevel: store.currentLevel,
    currentXP: store.currentXP,
    xpToNextLevel: store.xpToNextLevel,
    loadAchievements: store.loadAchievements,
    unlockAchievement: store.unlockAchievement,
    addXP: store.addXP,
    updateUserStats: store.updateUserStats
  }
}

