export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  currency: Currency
  initialBalance: number
  currentBalance: number
  createdAt: Date
  updatedAt: Date
  preferences: UserPreferences
  onboardingCompleted: boolean
  level: number
  xp: number
  title?: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'fr' | 'en'
  notifications: NotificationSettings
  budgetAlerts: boolean
  monthlyBudgetLimit?: number
  currency: Currency
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
}

export interface NotificationSettings {
  enabled: boolean
  budgetAlerts: boolean
  goalReminders: boolean
  weeklyReports: boolean
  monthlyReports: boolean
  achievementUnlocked: boolean
}

export interface Currency {
  code: string // 'XOF', 'EUR', 'USD', etc.
  symbol: string // 'CFA', '€', '$', etc.
  name: string // 'Franc CFA', 'Euro', 'Dollar', etc.
  decimals: number // 0 for CFA, 2 for EUR/USD
}

export const CURRENCIES: Currency[] = [
  {
    code: 'XOF',
    symbol: 'CFA',
    name: 'Franc CFA',
    decimals: 0
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'Dollar US',
    decimals: 2
  }
]

export interface OnboardingProgress {
  currentStep: number
  completedSteps: string[]
  totalSteps: number
  isCompleted: boolean
  startedAt: Date
  completedAt?: Date
}

export const ONBOARDING_STEPS = [
  'welcome',
  'personal-info',
  'initial-balance',
  'categories',
  'savings-goals',
  'preferences',
  'completion'
] as const

export type OnboardingStep = typeof ONBOARDING_STEPS[number]

// Utility function to get default currency
export function getDefaultCurrency(): Currency {
  return CURRENCIES[0] // XOF
}
