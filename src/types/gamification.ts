export interface Achievement {
  id: string
  name: string
  description: string
  icon: string // Nom de l'icône Lucide
  color: string
  category: AchievementCategory
  type: AchievementType
  condition: AchievementCondition
  reward: AchievementReward
  isUnlocked: boolean
  unlockedAt?: Date
  progress: number // 0-100
  isVisible: boolean // Certains achievements sont cachés jusqu'à être débloqués
}

export const AchievementCategory = {
  SAVINGS: 'savings',
  SPENDING: 'spending',
  BUDGET: 'budget',
  STREAK: 'streak',
  MILESTONE: 'milestone',
  SOCIAL: 'social'
} as const

export type AchievementCategory = typeof AchievementCategory[keyof typeof AchievementCategory]

export const AchievementType = {
  SINGLE: 'single', // Une seule fois
  PROGRESSIVE: 'progressive', // Plusieurs niveaux
  RECURRING: 'recurring' // Peut être obtenu plusieurs fois
} as const

export type AchievementType = typeof AchievementType[keyof typeof AchievementType]

export interface AchievementCondition {
  type: 'savings_amount' | 'transaction_count' | 'budget_respect' | 'streak_days' | 'category_limit'
  value: number
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time'
  categoryId?: string
}

export interface AchievementReward {
  xp: number
  badge?: string
  title?: string
  unlockFeature?: string
}

export interface UserLevel {
  level: number
  currentXP: number
  xpToNextLevel: number
  totalXP: number
  title: string
  benefits: string[]
  unlockedFeatures: string[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: BadgeRarity
  earnedAt: Date
}

export const BadgeRarity = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
} as const

export type BadgeRarity = typeof BadgeRarity[keyof typeof BadgeRarity]

export interface Streak {
  type: StreakType
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date
  isActive: boolean
}

export const StreakType = {
  DAILY_BUDGET_CHECK: 'daily_budget_check',
  SAVINGS_CONTRIBUTION: 'savings_contribution',
  EXPENSE_TRACKING: 'expense_tracking',
  BUDGET_RESPECT: 'budget_respect'
} as const

export type StreakType = typeof StreakType[keyof typeof StreakType]

export interface Challenge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  startDate: Date
  endDate: Date
  targetValue: number
  currentProgress: number
  reward: AchievementReward
  participants: number
  isActive: boolean
  isCompleted: boolean
  completedAt?: Date
}

// Achievements par défaut
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id' | 'isUnlocked' | 'unlockedAt' | 'progress'>[] = [
  {
    name: 'Premier pas',
    description: 'Créer votre première transaction',
    icon: 'Star',
    color: '#F59E0B',
    category: AchievementCategory.MILESTONE,
    type: AchievementType.SINGLE,
    condition: {
      type: 'transaction_count',
      value: 1,
      period: 'all_time'
    },
    reward: {
      xp: 50,
      badge: 'first_transaction'
    },
    isVisible: true
  },
  {
    name: 'Épargnant débutant',
    description: 'Économiser 10 000 CFA',
    icon: 'PiggyBank',
    color: '#10B981',
    category: AchievementCategory.SAVINGS,
    type: AchievementType.PROGRESSIVE,
    condition: {
      type: 'savings_amount',
      value: 10000,
      period: 'all_time'
    },
    reward: {
      xp: 100,
      badge: 'beginner_saver'
    },
    isVisible: true
  },
  {
    name: 'Maître du budget',
    description: 'Respecter son budget pendant 30 jours',
    icon: 'Target',
    color: '#8B5CF6',
    category: AchievementCategory.BUDGET,
    type: AchievementType.SINGLE,
    condition: {
      type: 'budget_respect',
      value: 30,
      period: 'daily'
    },
    reward: {
      xp: 200,
      badge: 'budget_master',
      title: 'Maître du Budget'
    },
    isVisible: true
  },
  {
    name: 'Série de 7',
    description: 'Enregistrer des transactions 7 jours consécutifs',
    icon: 'Flame',
    color: '#EF4444',
    category: AchievementCategory.STREAK,
    type: AchievementType.SINGLE,
    condition: {
      type: 'streak_days',
      value: 7,
      period: 'daily'
    },
    reward: {
      xp: 150,
      badge: 'week_streak'
    },
    isVisible: true
  }
]

// Niveaux et titres
export const LEVEL_SYSTEM = {
  xpPerLevel: 1000,
  maxLevel: 50,
  titles: [
    { level: 1, title: 'Débutant' },
    { level: 5, title: 'Apprenti Financier' },
    { level: 10, title: 'Gestionnaire Avisé' },
    { level: 15, title: 'Expert Budgétaire' },
    { level: 20, title: 'Maître de l\'Épargne' },
    { level: 25, title: 'Guru Financier' },
    { level: 30, title: 'Sage de la Finance' },
    { level: 40, title: 'Légende Financière' },
    { level: 50, title: 'Grand Maître' }
  ]
}
