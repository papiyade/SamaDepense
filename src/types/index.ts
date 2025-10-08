// Export all types from their respective modules
export * from './user'
export * from './transaction'
export * from './category'
export * from './savings'
export * from './gamification'

// Common utility types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface SelectOption {
  value: string
  label: string
  icon?: string
  color?: string
  disabled?: boolean
}

export interface ChartDataPoint {
  name: string
  value: number
  color?: string
  percentage?: number
}

export interface NotificationData {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  metadata?: Record<string, any>
}

export const NotificationType = {
  BUDGET_ALERT: 'budget_alert',
  SAVINGS_MILESTONE: 'savings_milestone',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  GOAL_REMINDER: 'goal_reminder',
  WEEKLY_REPORT: 'weekly_report',
  MONTHLY_REPORT: 'monthly_report',
  SYSTEM: 'system'
} as const

export type NotificationType = typeof NotificationType[keyof typeof NotificationType]

export interface AppSettings {
  version: string
  isOnline: boolean
  lastSyncAt?: Date
  syncInProgress: boolean
  hasUnsyncedChanges: boolean
  installPromptAvailable: boolean
}

export interface DatabaseSchema {
  version: number
  tables: {
    users: 'id'
    transactions: 'id'
    categories: 'id'
    savingsBoxes: 'id'
    achievements: 'id'
    notifications: 'id'
  }
}
