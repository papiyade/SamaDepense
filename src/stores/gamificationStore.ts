import { create } from 'zustand'
import { 
  type Achievement, 
  type UserLevel, 
  type Badge, 
  type Streak,
  type Challenge,
  DEFAULT_ACHIEVEMENTS,
  LEVEL_SYSTEM,
  AchievementCategory,
  StreakType,
  BadgeRarity 
} from '@/types'
import { db } from '@/lib/database'
import { useUserStore } from './userStore'
import { v4 as uuidv4 } from 'uuid'

interface GamificationState {
  // État
  achievements: Achievement[]
  userLevel: UserLevel | null
  badges: Badge[]
  streaks: Streak[]
  challenges: Challenge[]
  isLoading: boolean
  error: string | null

  // Actions - Achievements
  loadAchievements: () => Promise<void>
  unlockAchievement: (achievementId: string) => Promise<void>
  checkAchievements: () => Promise<void>
  updateAchievementProgress: (achievementId: string, progress: number) => Promise<void>

  // Actions - Niveaux et XP
  calculateUserLevel: (totalXP: number) => UserLevel
  checkLevelUp: () => Promise<void>
  awardXP: (amount: number, reason: string) => Promise<void>

  // Actions - Badges
  awardBadge: (badgeId: string, name: string, description: string, icon: string, color: string, rarity: BadgeRarity) => Promise<void>
  loadBadges: () => Promise<void>

  // Actions - Streaks
  updateStreak: (type: StreakType) => Promise<void>
  checkStreaks: () => Promise<void>
  resetStreak: (type: StreakType) => Promise<void>
  loadStreaks: () => Promise<void>

  // Actions - Challenges
  createChallenge: (challengeData: Omit<Challenge, 'id' | 'participants' | 'isActive' | 'isCompleted'>) => Promise<void>
  joinChallenge: (challengeId: string) => Promise<void>
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>
  completeChallenge: (challengeId: string) => Promise<void>
  loadChallenges: () => Promise<void>

  // Analyses et statistiques
  getUnlockedAchievements: () => Achievement[]
  getLockedAchievements: () => Achievement[]
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[]
  getActiveStreaks: () => Streak[]
  getLongestStreak: () => Streak | null
  getRecentBadges: (limit?: number) => Badge[]

  // Utilitaires
  getAchievementById: (id: string) => Achievement | undefined
  getBadgeById: (id: string) => Badge | undefined
  getStreakByType: (type: StreakType) => Streak | undefined
  getChallengeById: (id: string) => Challenge | undefined
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  // État initial
  achievements: [],
  userLevel: null,
  badges: [],
  streaks: [],
  challenges: [],
  isLoading: false,
  error: null,

  // Charger les achievements
  loadAchievements: async () => {
    set({ isLoading: true, error: null })

    try {
      const achievements = await db.achievements.toArray()
      
      // Si aucun achievement n'existe, créer les achievements par défaut
      if (achievements.length === 0) {
        const defaultAchievements = DEFAULT_ACHIEVEMENTS.map(achievement => ({
          ...achievement,
          id: uuidv4(),
          isUnlocked: false,
          progress: 0
        }))

        await db.achievements.bulkAdd(defaultAchievements)
        set({ achievements: defaultAchievements, isLoading: false })
      } else {
        set({ achievements, isLoading: false })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des achievements:', error)
      set({ 
        error: 'Impossible de charger les achievements', 
        isLoading: false 
      })
    }
  },

  // Débloquer un achievement
  unlockAchievement: async (achievementId) => {
    try {
      const achievement = get().getAchievementById(achievementId)
      if (!achievement || achievement.isUnlocked) return

      const updatedAchievement = {
        ...achievement,
        isUnlocked: true,
        unlockedAt: new Date(),
        progress: 100
      }

      await db.achievements.update(achievementId, updatedAchievement)

      // Ajouter XP et badge
      await get().awardXP(achievement.reward.xp, `Achievement: ${achievement.name}`)
      
      if (achievement.reward.badge) {
        await get().awardBadge(
          achievement.reward.badge,
          achievement.name,
          achievement.description,
          achievement.icon,
          achievement.color,
          BadgeRarity.COMMON
        )
      }

      // Mettre à jour le titre utilisateur si applicable
      if (achievement.reward.title) {
        const user = useUserStore.getState().getCurrentUser()
        if (user) {
          await useUserStore.getState().updateUser({
            title: achievement.reward.title
          })
        }
      }

      await get().loadAchievements()

      // Notification (à implémenter)
      console.log(`🎉 Achievement débloqué: ${achievement.name}`)

    } catch (error) {
      console.error('Erreur lors du déblocage de l\'achievement:', error)
      set({ error: 'Impossible de débloquer l\'achievement' })
    }
  },

  // Vérifier les achievements
  checkAchievements: async () => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    const { achievements } = get()
    
    try {
      // Obtenir les données nécessaires pour les vérifications
      const transactions = await db.getUserTransactions(user.id)
      const savingsBoxes = await db.getUserSavingsBoxes(user.id)
      
      for (const achievement of achievements) {
        if (achievement.isUnlocked) continue

        let shouldUnlock = false
        let progress = 0

        switch (achievement.condition.type) {
          case 'transaction_count':
            const count = transactions.length
            progress = Math.min((count / achievement.condition.value) * 100, 100)
            shouldUnlock = count >= achievement.condition.value
            break

          case 'savings_amount':
            const totalSaved = savingsBoxes.reduce((sum, box) => sum + box.currentAmount, 0)
            progress = Math.min((totalSaved / achievement.condition.value) * 100, 100)
            shouldUnlock = totalSaved >= achievement.condition.value
            break

          case 'budget_respect':
            // Logique pour vérifier le respect du budget
            // À implémenter avec les données de budget
            break

          case 'streak_days':
            const streak = get().getStreakByType(StreakType.EXPENSE_TRACKING)
            if (streak) {
              progress = Math.min((streak.currentStreak / achievement.condition.value) * 100, 100)
              shouldUnlock = streak.currentStreak >= achievement.condition.value
            }
            break
        }

        // Mettre à jour le progrès
        if (progress !== achievement.progress) {
          await get().updateAchievementProgress(achievement.id, progress)
        }

        // Débloquer si les conditions sont remplies
        if (shouldUnlock) {
          await get().unlockAchievement(achievement.id)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des achievements:', error)
    }
  },

  // Mettre à jour le progrès d'un achievement
  updateAchievementProgress: async (achievementId, progress) => {
    try {
      await db.achievements.update(achievementId, { progress })
      
      set(state => ({
        achievements: state.achievements.map(a =>
          a.id === achievementId ? { ...a, progress } : a
        )
      }))
    } catch (error) {
      console.error('Erreur lors de la mise à jour du progrès:', error)
    }
  },

  // Calculer le niveau utilisateur
  calculateUserLevel: (totalXP) => {
    const level = Math.floor(totalXP / LEVEL_SYSTEM.xpPerLevel) + 1
    const currentXP = totalXP % LEVEL_SYSTEM.xpPerLevel
    const xpToNextLevel = LEVEL_SYSTEM.xpPerLevel - currentXP

    // Trouver le titre correspondant au niveau
    const titleData = LEVEL_SYSTEM.titles
      .reverse()
      .find(t => level >= t.level)
    
    const title = titleData?.title || 'Débutant'

    const userLevel: UserLevel = {
      level: Math.min(level, LEVEL_SYSTEM.maxLevel),
      currentXP,
      xpToNextLevel: level >= LEVEL_SYSTEM.maxLevel ? 0 : xpToNextLevel,
      totalXP,
      title,
      benefits: [], // À définir selon le niveau
      unlockedFeatures: [] // À définir selon le niveau
    }

    return userLevel
  },

  // Vérifier les montées de niveau
  checkLevelUp: async () => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    const newLevel = get().calculateUserLevel(user.xp)
    const currentLevel = get().userLevel

    if (!currentLevel || newLevel.level > currentLevel.level) {
      set({ userLevel: newLevel })

      // Récompenses de niveau
      if (currentLevel && newLevel.level > currentLevel.level) {
        console.log(`🎉 Niveau ${newLevel.level} atteint! Nouveau titre: ${newLevel.title}`)
        
        // Ajouter un badge de niveau
        await get().awardBadge(
          `level-${newLevel.level}`,
          `Niveau ${newLevel.level}`,
          `Atteint le niveau ${newLevel.level}`,
          'Star',
          '#F59E0B',
          newLevel.level >= 20 ? BadgeRarity.LEGENDARY : 
          newLevel.level >= 10 ? BadgeRarity.EPIC :
          newLevel.level >= 5 ? BadgeRarity.RARE : BadgeRarity.COMMON
        )
      }
    }
  },

  // Attribuer de l'XP
  awardXP: async (amount, reason) => {
    const user = useUserStore.getState().getCurrentUser()
    if (!user) return

    await useUserStore.getState().addXP(amount)
    await get().checkLevelUp()

    console.log(`+${amount} XP: ${reason}`)
  },

  // Attribuer un badge
  awardBadge: async (badgeId, name, description, icon, color, rarity) => {
    try {
      // Vérifier si le badge existe déjà
      const existingBadge = get().getBadgeById(badgeId)
      if (existingBadge) return

      const newBadge: Badge = {
        id: badgeId,
        name,
        description,
        icon,
        color,
        rarity,
        earnedAt: new Date()
      }

      // Note: Les badges ne sont pas encore dans la DB, on les stocke en mémoire
      set(state => ({
        badges: [...state.badges, newBadge]
      }))

      console.log(`🏆 Badge obtenu: ${name}`)
    } catch (error) {
      console.error('Erreur lors de l\'attribution du badge:', error)
    }
  },

  // Charger les badges
  loadBadges: async () => {
    // Pour l'instant, les badges sont stockés en mémoire
    // À implémenter avec la DB plus tard
  },

  // Mettre à jour une série
  updateStreak: async (type) => {
    try {
      let streak = get().getStreakByType(type)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (!streak) {
        // Créer une nouvelle série
        streak = {
          type,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
          isActive: true
        }
        
        set(state => ({
          streaks: [...state.streaks, streak!]
        }))
      } else {
        const lastActivity = new Date(streak.lastActivityDate)
        lastActivity.setHours(0, 0, 0, 0)
        
        const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 1) {
          // Continuer la série
          const newCurrentStreak = streak.currentStreak + 1
          const updatedStreak = {
            ...streak,
            currentStreak: newCurrentStreak,
            longestStreak: Math.max(streak.longestStreak, newCurrentStreak),
            lastActivityDate: today,
            isActive: true
          }

          set(state => ({
            streaks: state.streaks.map(s => s.type === type ? updatedStreak : s)
          }))
        } else if (daysDiff === 0) {
          // Même jour, pas de changement
          return
        } else {
          // Série cassée, recommencer
          const updatedStreak = {
            ...streak,
            currentStreak: 1,
            lastActivityDate: today,
            isActive: true
          }

          set(state => ({
            streaks: state.streaks.map(s => s.type === type ? updatedStreak : s)
          }))
        }
      }

      // Vérifier les achievements liés aux séries
      await get().checkAchievements()

    } catch (error) {
      console.error('Erreur lors de la mise à jour de la série:', error)
    }
  },

  // Vérifier toutes les séries
  checkStreaks: async () => {
    const { streaks } = get()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const streak of streaks) {
      const lastActivity = new Date(streak.lastActivityDate)
      lastActivity.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff > 1 && streak.isActive) {
        // Série cassée
        await get().resetStreak(streak.type)
      }
    }
  },

  // Réinitialiser une série
  resetStreak: async (type) => {
    set(state => ({
      streaks: state.streaks.map(s => 
        s.type === type 
          ? { ...s, currentStreak: 0, isActive: false }
          : s
      )
    }))
  },

  // Charger les séries
  loadStreaks: async () => {
    // Pour l'instant, les séries sont stockées en mémoire
    // À implémenter avec la DB plus tard
  },

  // Créer un défi
  createChallenge: async (challengeData) => {
    const newChallenge: Challenge = {
      ...challengeData,
      id: uuidv4(),
      participants: 0,
      isActive: true,
      isCompleted: false
    }

    set(state => ({
      challenges: [...state.challenges, newChallenge]
    }))
  },

  // Rejoindre un défi
  joinChallenge: async (challengeId) => {
    set(state => ({
      challenges: state.challenges.map(c =>
        c.id === challengeId 
          ? { ...c, participants: c.participants + 1 }
          : c
      )
    }))
  },

  // Mettre à jour le progrès d'un défi
  updateChallengeProgress: async (challengeId, progress) => {
    set(state => ({
      challenges: state.challenges.map(c =>
        c.id === challengeId 
          ? { ...c, currentProgress: progress }
          : c
      )
    }))

    // Vérifier si le défi est terminé
    const challenge = get().getChallengeById(challengeId)
    if (challenge && progress >= challenge.targetValue) {
      await get().completeChallenge(challengeId)
    }
  },

  // Terminer un défi
  completeChallenge: async (challengeId) => {
    const challenge = get().getChallengeById(challengeId)
    if (!challenge) return

    set(state => ({
      challenges: state.challenges.map(c =>
        c.id === challengeId 
          ? { ...c, isCompleted: true, completedAt: new Date() }
          : c
      )
    }))

    // Attribuer les récompenses
    await get().awardXP(challenge.reward.xp, `Défi terminé: ${challenge.name}`)
    
    if (challenge.reward.badge) {
      await get().awardBadge(
        challenge.reward.badge,
        challenge.name,
        challenge.description,
        challenge.icon,
        challenge.color,
        BadgeRarity.RARE
      )
    }
  },

  // Charger les défis
  loadChallenges: async () => {
    // Pour l'instant, les défis sont stockés en mémoire
    // À implémenter avec la DB plus tard
  },

  // Analyses et statistiques
  getUnlockedAchievements: () => {
    return get().achievements.filter(a => a.isUnlocked)
  },

  getLockedAchievements: () => {
    return get().achievements.filter(a => !a.isUnlocked)
  },

  getAchievementsByCategory: (category) => {
    return get().achievements.filter(a => a.category === category)
  },

  getActiveStreaks: () => {
    return get().streaks.filter(s => s.isActive && s.currentStreak > 0)
  },

  getLongestStreak: () => {
    const { streaks } = get()
    return streaks.reduce((longest, current) => 
      current.longestStreak > (longest?.longestStreak || 0) ? current : longest
    , null as Streak | null)
  },

  getRecentBadges: (limit = 5) => {
    return get().badges
      .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
      .slice(0, limit)
  },

  // Utilitaires
  getAchievementById: (id) => {
    return get().achievements.find(a => a.id === id)
  },

  getBadgeById: (id) => {
    return get().badges.find(b => b.id === id)
  },

  getStreakByType: (type) => {
    return get().streaks.find(s => s.type === type)
  },

  getChallengeById: (id) => {
    return get().challenges.find(c => c.id === id)
  }
}))
