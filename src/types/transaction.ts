export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  description: string
  categoryId: string
  savingsBoxId?: string // Si la transaction est liée à une box d'épargne
  date: Date
  createdAt: Date
  updatedAt: Date
  isRecurring: boolean
  recurringConfig?: RecurringConfig
  tags: string[]
  notes?: string
  attachments?: string[] // URLs des pièces jointes
}

export const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
  SAVINGS: 'savings'
} as const

export type TransactionType = typeof TransactionType[keyof typeof TransactionType]

export interface RecurringConfig {
  frequency: RecurringFrequency
  interval: number // Tous les X jours/semaines/mois
  endDate?: Date
  maxOccurrences?: number
  nextDueDate: Date
  isActive: boolean
}

export const RecurringFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const

export type RecurringFrequency = typeof RecurringFrequency[keyof typeof RecurringFrequency]

export interface TransactionFilter {
  startDate?: Date
  endDate?: Date
  categoryIds?: string[]
  type?: TransactionType
  minAmount?: number
  maxAmount?: number
  searchTerm?: string
  tags?: string[]
  savingsBoxId?: string
}

export interface TransactionSummary {
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  netAmount: number
  transactionCount: number
  period: {
    startDate: Date
    endDate: Date
  }
  categoryBreakdown: CategorySummary[]
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  transactionCount: number
  color: string
}

export interface MonthlyReport {
  month: number
  year: number
  summary: TransactionSummary
  budgetComparison: BudgetComparison[]
  topCategories: CategorySummary[]
  savingsProgress: number
  previousMonthComparison: {
    incomeChange: number
    expenseChange: number
    savingsChange: number
  }
}

export interface BudgetComparison {
  categoryId: string
  categoryName: string
  budgetAmount: number
  actualAmount: number
  difference: number
  percentage: number
  status: 'under' | 'over' | 'on-track'
}
