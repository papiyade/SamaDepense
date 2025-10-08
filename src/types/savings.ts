export interface SavingsBox {
  id: string
  userId: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  color: string
  icon: string // Nom de l'icône Lucide
  priority: SavingsPriority
  deadline?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category: SavingsCategory
  autoSave?: AutoSaveConfig
  milestones: SavingsMilestone[]
}

export const SavingsPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

export type SavingsPriority = typeof SavingsPriority[keyof typeof SavingsPriority]

export const SavingsCategory = {
  EMERGENCY: 'emergency', // Fonds d'urgence
  VACATION: 'vacation', // Vacances
  EDUCATION: 'education', // Éducation
  HOUSE: 'house', // Logement
  CAR: 'car', // Véhicule
  WEDDING: 'wedding', // Mariage
  RETIREMENT: 'retirement', // Retraite
  INVESTMENT: 'investment', // Investissement
  GIFT: 'gift', // Cadeau
  OTHER: 'other' // Autre
} as const

export type SavingsCategory = typeof SavingsCategory[keyof typeof SavingsCategory]

export interface AutoSaveConfig {
  isEnabled: boolean
  amount: number
  frequency: AutoSaveFrequency
  nextSaveDate: Date
  sourceType: 'income' | 'percentage' // Montant fixe ou pourcentage des revenus
  percentage?: number // Si sourceType = 'percentage'
}

export const AutoSaveFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const

export type AutoSaveFrequency = typeof AutoSaveFrequency[keyof typeof AutoSaveFrequency]

export interface SavingsMilestone {
  id: string
  savingsBoxId: string
  name: string
  targetAmount: number
  isCompleted: boolean
  completedAt?: Date
  reward?: string // Récompense pour atteindre ce jalon
  createdAt: Date
}

export interface SavingsBoxWithProgress extends SavingsBox {
  progressPercentage: number
  remainingAmount: number
  estimatedCompletionDate?: Date
  monthlyContribution: number
  daysToTarget?: number
  isOnTrack: boolean
  completedMilestones: number
  totalMilestones: number
}

export interface SavingsGoal {
  id: string
  userId: string
  title: string
  description?: string
  targetAmount: number
  targetDate: Date
  savingsBoxes: string[] // IDs des box liées à cet objectif
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SavingsSummary {
  totalSaved: number
  totalTarget: number
  overallProgress: number
  activeBoxes: number
  completedBoxes: number
  monthlyContributions: number
  projectedCompletion?: Date
  topPerformingBox?: SavingsBoxWithProgress
}

// Modèles de box d'épargne par défaut
export const DEFAULT_SAVINGS_TEMPLATES: Omit<SavingsBox, 'id' | 'userId' | 'currentAmount' | 'createdAt' | 'updatedAt' | 'milestones'>[] = [
  {
    name: 'Fonds d\'urgence',
    description: 'Pour les imprévus et urgences',
    targetAmount: 500000, // 500k CFA
    color: '#EF4444', // red-500
    icon: 'Shield',
    priority: SavingsPriority.HIGH,
    isActive: true,
    category: SavingsCategory.EMERGENCY
  },
  {
    name: 'Vacances',
    description: 'Pour les prochaines vacances',
    targetAmount: 300000, // 300k CFA
    color: '#06B6D4', // cyan-500
    icon: 'Plane',
    priority: SavingsPriority.MEDIUM,
    isActive: true,
    category: SavingsCategory.VACATION
  },
  {
    name: 'Nouveau téléphone',
    description: 'Pour acheter un nouveau smartphone',
    targetAmount: 200000, // 200k CFA
    color: '#8B5CF6', // violet-500
    icon: 'Smartphone',
    priority: SavingsPriority.LOW,
    isActive: true,
    category: SavingsCategory.OTHER
  },
  {
    name: 'Formation',
    description: 'Pour financer une formation',
    targetAmount: 150000, // 150k CFA
    color: '#F59E0B', // amber-500
    icon: 'GraduationCap',
    priority: SavingsPriority.MEDIUM,
    isActive: true,
    category: SavingsCategory.EDUCATION
  }
]
