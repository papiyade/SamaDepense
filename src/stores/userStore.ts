import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type User, type UserPreferences, type OnboardingProgress, getDefaultCurrency } from '@/types'
import { db } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'

interface UserState {
  // État
  user: User | null
  isLoading: boolean
  error: string | null
  onboardingProgress: OnboardingProgress | null

  // Actions
  createUser: (userData: Partial<User>) => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  loadUser: (userId?: string) => Promise<void>
  logout: () => void
  
  // Onboarding
  startOnboarding: () => void
  completeOnboardingStep: (step: string) => void
  completeOnboarding: () => Promise<void>
  
  // Gamification
  addXP: (amount: number) => Promise<void>
  levelUp: () => Promise<void>
  
  // Utilitaires
  getCurrentUser: () => User | null
  isOnboardingComplete: () => boolean
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'fr',
  notifications: {
    enabled: true,
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: true,
    monthlyReports: true,
    achievementUnlocked: true
  },
  budgetAlerts: true,
  currency: getDefaultCurrency(),
  dateFormat: 'DD/MM/YYYY'
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      isLoading: false,
      error: null,
      onboardingProgress: null,

      // Créer un nouvel utilisateur
      createUser: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          const newUser: User = {
            id: uuidv4(),
            name: userData.name || 'Utilisateur',
            email: userData.email,
            avatar: userData.avatar,
            currency: userData.currency || getDefaultCurrency(),
            initialBalance: userData.initialBalance || 0,
            currentBalance: userData.initialBalance || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: { ...defaultPreferences, ...userData.preferences },
            onboardingCompleted: false,
            level: 1,
            xp: 0
          }

          await db.users.add(newUser)
          await db.initializeDefaultData(newUser.id)
          
          set({ 
            user: newUser, 
            isLoading: false,
            onboardingProgress: {
              currentStep: 0,
              completedSteps: [],
              totalSteps: 7,
              isCompleted: false,
              startedAt: new Date()
            }
          })
        } catch (error) {
          console.error('Erreur lors de la création de l\'utilisateur:', error)
          set({ 
            error: 'Impossible de créer l\'utilisateur', 
            isLoading: false 
          })
        }
      },

      // Mettre à jour l'utilisateur
      updateUser: async (updates) => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          const updatedUser = {
            ...user,
            ...updates,
            updatedAt: new Date()
          }

          await db.users.update(user.id, updatedUser)
          set({ user: updatedUser, isLoading: false })
        } catch (error) {
          console.error('Erreur lors de la mise à jour:', error)
          set({ 
            error: 'Impossible de mettre à jour l\'utilisateur', 
            isLoading: false 
          })
        }
      },

      // Mettre à jour les préférences
      updatePreferences: async (preferences) => {
        const { user } = get()
        if (!user) return

        const updatedPreferences = {
          ...user.preferences,
          ...preferences
        }

        await get().updateUser({ preferences: updatedPreferences })
      },

      // Charger un utilisateur
      loadUser: async (userId) => {
        set({ isLoading: true, error: null })

        try {
          let user: User | undefined

          if (userId) {
            user = await db.users.get(userId)
          } else {
            // Charger le premier utilisateur trouvé
            const users = await db.users.toArray()
            user = users[0]
          }

          if (user) {
            set({ user, isLoading: false })
          } else {
            set({ user: null, isLoading: false })
          }
        } catch (error) {
          console.error('Erreur lors du chargement:', error)
          set({ 
            error: 'Impossible de charger l\'utilisateur', 
            isLoading: false 
          })
        }
      },

      // Déconnexion
      logout: () => {
        set({ 
          user: null, 
          onboardingProgress: null, 
          error: null 
        })
      },

      // Démarrer l'onboarding
      startOnboarding: () => {
        set({
          onboardingProgress: {
            currentStep: 0,
            completedSteps: [],
            totalSteps: 7,
            isCompleted: false,
            startedAt: new Date()
          }
        })
      },

      // Compléter une étape d'onboarding
      completeOnboardingStep: (step) => {
        const { onboardingProgress } = get()
        if (!onboardingProgress) return

        const updatedProgress = {
          ...onboardingProgress,
          completedSteps: [...onboardingProgress.completedSteps, step],
          currentStep: onboardingProgress.currentStep + 1
        }

        set({ onboardingProgress: updatedProgress })
      },

      // Terminer l'onboarding
      completeOnboarding: async () => {
        const { user } = get()
        if (!user) return

        await get().updateUser({ onboardingCompleted: true })
        await get().addXP(100) // Bonus XP pour terminer l'onboarding

        set({
          onboardingProgress: {
            ...get().onboardingProgress!,
            isCompleted: true,
            completedAt: new Date()
          }
        })
      },

      // Ajouter de l'XP
      addXP: async (amount) => {
        const { user } = get()
        if (!user) return

        const newXP = user.xp + amount
        const newLevel = Math.floor(newXP / 1000) + 1 // 1000 XP par niveau

        if (newLevel > user.level) {
          await get().levelUp()
        }

        await get().updateUser({ xp: newXP, level: newLevel })
      },

      // Monter de niveau
      levelUp: async () => {
        // Logique pour les récompenses de niveau
        // Sera implémentée avec le système de gamification
        console.log('🎉 Niveau supérieur atteint!')
      },

      // Utilitaires
      getCurrentUser: () => get().user,
      
      isOnboardingComplete: () => {
        const { user } = get()
        return user?.onboardingCompleted || false
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        onboardingProgress: state.onboardingProgress
      })
    }
  )
)
