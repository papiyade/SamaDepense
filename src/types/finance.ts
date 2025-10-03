import { BaseEntity } from './index'

// Types pour les transactions financières
export interface Transaction extends BaseEntity {
  amount: number
  description: string
  type: 'income' | 'expense'
  categoryId: string
  savingsBoxId?: string // Optionnel, pour assigner à une box d'épargne
  isRecurring: boolean
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurringEndDate?: Date
  tags: string[]
  notes?: string
  attachments?: string[] // URLs des pièces jointes
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
}

// Types pour les catégories
export interface Category extends BaseEntity {
  name: string
  description?: string
  color: string
  icon: string
  type: 'income' | 'expense' | 'both'
  isDefault: boolean
  parentCategoryId?: string // Pour les sous-catégories
  budget?: {
    monthly: number
    yearly: number
  }
  keywords: string[] // Pour la catégorisation automatique
}

// Types pour les boxes d'épargne
export interface SavingsBox extends BaseEntity {
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  color: string
  icon: string
  priority: 'low' | 'medium' | 'high'
  deadline?: Date
  isActive: boolean
  autoSaveRules?: AutoSaveRule[]
  milestones: Milestone[]
}

export interface AutoSaveRule {
  id: string
  type: 'percentage' | 'fixed' | 'roundup'
  value: number
  condition?: 'income' | 'expense_category' | 'always'
  categoryId?: string
  isActive: boolean
}

export interface Milestone {
  id: string
  amount: number
  description: string
  isReached: boolean
  reachedAt?: Date
  reward?: string
}

// Types pour les objectifs financiers
export interface FinancialGoal extends BaseEntity {
  title: string
  description?: string
  type: 'savings' | 'expense_reduction' | 'income_increase' | 'debt_payoff'
  targetAmount: number
  currentAmount: number
  targetDate: Date
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  relatedSavingsBoxId?: string
  milestones: GoalMilestone[]
  strategies: string[] // Conseils pour atteindre l'objectif
}

export interface GoalMilestone {
  id: string
  percentage: number
  amount: number
  description: string
  isReached: boolean
  reachedAt?: Date
}

// Types pour le budget
export interface Budget extends BaseEntity {
  name: string
  period: 'weekly' | 'monthly' | 'yearly'
  totalAmount: number
  categories: BudgetCategory[]
  startDate: Date
  endDate: Date
  isActive: boolean
  alertThreshold: number // Pourcentage pour déclencher les alertes
}

export interface BudgetCategory {
  categoryId: string
  allocatedAmount: number
  spentAmount: number
  percentage: number
}

// Types pour les statistiques financières
export interface FinancialSummary {
  period: {
    start: Date
    end: Date
    type: 'day' | 'week' | 'month' | 'year'
  }
  balance: {
    initial: number
    current: number
    change: number
    changePercentage: number
  }
  income: {
    total: number
    average: number
    transactions: number
    topCategories: CategorySummary[]
  }
  expenses: {
    total: number
    average: number
    transactions: number
    topCategories: CategorySummary[]
    fixed: number
    variable: number
  }
  savings: {
    total: number
    percentage: number
    boxes: SavingsBoxSummary[]
    goals: GoalProgress[]
  }
  trends: {
    income: TrendPoint[]
    expenses: TrendPoint[]
    savings: TrendPoint[]
  }
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  transactionCount: number
  color: string
}

export interface SavingsBoxSummary {
  boxId: string
  boxName: string
  currentAmount: number
  targetAmount: number
  percentage: number
  color: string
}

export interface GoalProgress {
  goalId: string
  goalTitle: string
  currentAmount: number
  targetAmount: number
  percentage: number
  daysRemaining: number
  onTrack: boolean
}

export interface TrendPoint {
  date: Date
  value: number
  label: string
}

// Types pour les alertes et notifications
export interface FinancialAlert extends BaseEntity {
  type: 'budget_exceeded' | 'goal_milestone' | 'low_balance' | 'recurring_payment' | 'savings_opportunity'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  isActive: boolean
  relatedEntityId?: string // ID de la transaction, box, etc.
  relatedEntityType?: 'transaction' | 'savings_box' | 'goal' | 'budget'
  actionRequired: boolean
  suggestedActions?: string[]
  expiresAt?: Date
}

// Types pour l'analyse des habitudes
export interface SpendingPattern {
  categoryId: string
  categoryName: string
  averageAmount: number
  frequency: number
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonality?: {
    month: number
    multiplier: number
  }[]
  recommendations: string[]
}

export interface IncomePattern {
  source: string
  averageAmount: number
  frequency: 'regular' | 'irregular'
  reliability: number // 0-1
  trend: 'increasing' | 'decreasing' | 'stable'
  nextExpected?: Date
}

// Types pour les rapports
export interface FinancialReport {
  id: string
  title: string
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  period: DateRange
  summary: FinancialSummary
  insights: ReportInsight[]
  recommendations: string[]
  generatedAt: Date
}

export interface ReportInsight {
  type: 'spending_increase' | 'savings_opportunity' | 'budget_variance' | 'goal_progress'
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  actionable: boolean
  relatedData?: any
}

export interface DateRange {
  start: Date
  end: Date
}

