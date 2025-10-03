import { BaseEntity } from './index'

// Types pour l'utilisateur et ses préférences
export interface User extends BaseEntity {
  name: string
  email?: string
  avatar?: string
  currency: Currency
  language: 'fr' | 'en' | 'wo' // Français, Anglais, Wolof
  timezone: string
  initialBalance: number
  currentBalance: number
  preferences: UserPreferences
  achievements: Achievement[]
  level: UserLevel
  onboardingCompleted: boolean
  lastActiveAt: Date
}

export interface Currency {
  code: string // 'XOF', 'EUR', 'USD', etc.
  symbol: string // 'CFA', '€', '$', etc.
  name: string
  decimals: number
  position: 'before' | 'after' // Position du symbole
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationPreferences
  privacy: PrivacySettings
  display: DisplaySettings
  backup: BackupSettings
  gamification: GamificationSettings
}

export interface NotificationPreferences {
  enabled: boolean
  budgetAlerts: boolean
  goalMilestones: boolean
  recurringPayments: boolean
  savingsOpportunities: boolean
  weeklyReports: boolean
  monthlyReports: boolean
  pushNotifications: boolean
  emailNotifications: boolean
  quietHours: {
    enabled: boolean
    start: string // Format HH:mm
    end: string
  }
}

export interface PrivacySettings {
  shareAnalytics: boolean
  shareUsageData: boolean
  biometricAuth: boolean
  autoLock: boolean
  autoLockDelay: number // en minutes
  hideAmounts: boolean // Masquer les montants dans l'aperçu
}

export interface DisplaySettings {
  compactMode: boolean
  showDecimals: boolean
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  firstDayOfWeek: 'monday' | 'sunday'
  chartAnimations: boolean
  reducedMotion: boolean
}

export interface BackupSettings {
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  includeAttachments: boolean
  cloudSync: boolean
  lastBackup?: Date
}

export interface GamificationSettings {
  enabled: boolean
  showBadges: boolean
  showLevel: boolean
  showProgress: boolean
  celebrateAchievements: boolean
  competitiveMode: boolean // Pour les défis futurs
}

// Types pour la gamification
export interface Achievement extends BaseEntity {
  title: string
  description: string
  icon: string
  category: AchievementCategory
  type: AchievementType
  requirement: AchievementRequirement
  reward: AchievementReward
  isUnlocked: boolean
  unlockedAt?: Date
  progress: number // 0-100
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export type AchievementCategory = 
  | 'savings' 
  | 'budgeting' 
  | 'consistency' 
  | 'goals' 
  | 'learning' 
  | 'social'

export type AchievementType = 
  | 'milestone' 
  | 'streak' 
  | 'challenge' 
  | 'discovery' 
  | 'mastery'

export interface AchievementRequirement {
  type: 'amount_saved' | 'days_streak' | 'transactions_count' | 'goals_completed' | 'categories_used'
  value: number
  period?: 'day' | 'week' | 'month' | 'year' | 'all_time'
  conditions?: Record<string, any>
}

export interface AchievementReward {
  type: 'badge' | 'title' | 'feature' | 'discount'
  value: string
  description: string
}

export interface UserLevel {
  current: number
  title: string
  xp: number
  xpToNext: number
  totalXp: number
  benefits: string[]
}

// Types pour les statistiques utilisateur
export interface UserStats {
  totalTransactions: number
  totalSaved: number
  totalSpent: number
  averageMonthlyIncome: number
  averageMonthlyExpenses: number
  savingsRate: number // Pourcentage
  budgetAccuracy: number // Pourcentage de respect du budget
  goalsCompleted: number
  currentStreak: number // Jours consécutifs d'utilisation
  longestStreak: number
  categoriesUsed: number
  recurringTransactionsSet: number
  achievementsUnlocked: number
  levelReached: number
  joinedAt: Date
  daysActive: number
}

// Types pour l'onboarding
export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  isCompleted: boolean
  isOptional: boolean
  order: number
  data?: Record<string, any>
}

export interface OnboardingProgress {
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  skippedSteps: string[]
  isCompleted: boolean
  startedAt: Date
  completedAt?: Date
}

// Types pour les conseils et recommandations
export interface PersonalizedTip {
  id: string
  title: string
  content: string
  category: 'savings' | 'budgeting' | 'investing' | 'debt' | 'general'
  priority: 'low' | 'medium' | 'high'
  isRead: boolean
  isBookmarked: boolean
  relatedData?: {
    amount?: number
    percentage?: number
    category?: string
  }
  validUntil?: Date
  source: 'ai' | 'expert' | 'community'
}

// Types pour les défis (feature future)
export interface Challenge extends BaseEntity {
  title: string
  description: string
  type: 'savings' | 'spending' | 'budgeting' | 'learning'
  difficulty: 'easy' | 'medium' | 'hard'
  duration: number // en jours
  target: ChallengeTarget
  reward: ChallengeReward
  participants: number
  isActive: boolean
  startDate: Date
  endDate: Date
  rules: string[]
}

export interface ChallengeTarget {
  type: 'save_amount' | 'reduce_spending' | 'track_expenses' | 'complete_budget'
  value: number
  category?: string
}

export interface ChallengeReward {
  type: 'badge' | 'xp' | 'title' | 'feature_unlock'
  value: string | number
  description: string
}

export interface UserChallenge {
  challengeId: string
  userId: string
  joinedAt: Date
  progress: number
  isCompleted: boolean
  completedAt?: Date
  rank?: number
}

