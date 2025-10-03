// Types principaux pour l'application SamaDepense
export * from './finance'
export * from './user'
export * from './storage'

// Types utilitaires
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Types pour les filtres et recherche
export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface FilterOptions {
  dateRange?: DateRange
  categories?: string[]
  minAmount?: number
  maxAmount?: number
  type?: 'income' | 'expense' | 'all'
}

// Types pour les statistiques
export interface StatsPeriod {
  period: 'day' | 'week' | 'month' | 'year'
  value: number
}

export interface TrendData {
  label: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'stable'
}

// Types pour l'interface utilisateur
export interface NotificationConfig {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary'
}

// Types pour l'export
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json'
  dateRange: DateRange
  includeCategories: boolean
  includeSavings: boolean
  includeGoals: boolean
}

export interface ExportData {
  transactions: Transaction[]
  savingsBoxes: SavingsBox[]
  categories: Category[]
  summary: {
    totalIncome: number
    totalExpenses: number
    totalSavings: number
    period: string
  }
}

// Types pour la synchronisation (future)
export interface SyncStatus {
  lastSync: Date | null
  pendingChanges: number
  isOnline: boolean
  isSyncing: boolean
}

export interface SyncConflict {
  id: string
  type: 'transaction' | 'savings' | 'category'
  localData: any
  remoteData: any
  resolution?: 'local' | 'remote' | 'merge'
}

