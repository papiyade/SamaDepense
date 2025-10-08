export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon: string // Nom de l'icône Lucide
  type: CategoryType
  isDefault: boolean // Catégories par défaut vs personnalisées
  userId?: string // null pour les catégories par défaut
  parentId?: string // Pour les sous-catégories
  budget?: CategoryBudget
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  sortOrder: number
}

export const CategoryType = {
  INCOME: 'income',
  EXPENSE: 'expense',
  SAVINGS: 'savings'
} as const

export type CategoryType = typeof CategoryType[keyof typeof CategoryType]

export interface CategoryBudget {
  monthlyLimit: number
  alertThreshold: number // Pourcentage (ex: 80 pour 80%)
  isActive: boolean
  rollover: boolean // Reporter le budget non utilisé
}

export interface CategoryWithStats extends Category {
  currentMonthSpent: number
  budgetUsagePercentage: number
  transactionCount: number
  averageTransaction: number
  trend: 'up' | 'down' | 'stable'
}

// Catégories par défaut pour les dépenses
export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Alimentation',
    description: 'Courses, restaurants, snacks',
    color: '#10B981', // green-500
    icon: 'ShoppingCart',
    type: CategoryType.EXPENSE,
    isDefault: true,
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Transport',
    description: 'Essence, transport public, taxi',
    color: '#3B82F6', // blue-500
    icon: 'Car',
    type: CategoryType.EXPENSE,
    isDefault: true,
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Logement',
    description: 'Loyer, électricité, eau, internet',
    color: '#8B5CF6', // violet-500
    icon: 'Home',
    type: CategoryType.EXPENSE,
    isDefault: true,
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Santé',
    description: 'Médecin, pharmacie, assurance',
    color: '#EF4444', // red-500
    icon: 'Heart',
    type: CategoryType.EXPENSE,
    isDefault: true,
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Éducation',
    description: 'Scolarité, formation, livres',
    color: '#F59E0B', // amber-500
    icon: 'GraduationCap',
    type: CategoryType.EXPENSE,
    isDefault: true,
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Loisirs',
    description: 'Sorties, cinéma, sport, hobbies',
    color: '#EC4899', // pink-500
    icon: 'Gamepad2',
    type: CategoryType.EXPENSE,
    isDefault: true,
    isActive: true,
    sortOrder: 6
  },
  {
    name: 'Vêtements',
    description: 'Habits, chaussures, accessoires',
    color: '#06B6D4', // cyan-500
    icon: 'Shirt',
    type: CategoryType.EXPENSE,
    isDefault: true,
    isActive: true,
    sortOrder: 7
  },
  {
    name: 'Autres',
    description: 'Dépenses diverses',
    color: '#6B7280', // gray-500
    icon: 'MoreHorizontal',
    type: CategoryType.EXPENSE,
    isDefault: true,
    isActive: true,
    sortOrder: 8
  }
]

// Catégories par défaut pour les revenus
export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Salaire',
    description: 'Salaire principal',
    color: '#10B981', // green-500
    icon: 'Banknote',
    type: CategoryType.INCOME,
    isDefault: true,
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Freelance',
    description: 'Travail indépendant',
    color: '#3B82F6', // blue-500
    icon: 'Briefcase',
    type: CategoryType.INCOME,
    isDefault: true,
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Investissements',
    description: 'Dividendes, plus-values',
    color: '#8B5CF6', // violet-500
    icon: 'TrendingUp',
    type: CategoryType.INCOME,
    isDefault: true,
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Cadeaux',
    description: 'Argent reçu en cadeau',
    color: '#EC4899', // pink-500
    icon: 'Gift',
    type: CategoryType.INCOME,
    isDefault: true,
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Autres revenus',
    description: 'Revenus divers',
    color: '#6B7280', // gray-500
    icon: 'Plus',
    type: CategoryType.INCOME,
    isDefault: true,
    isActive: true,
    sortOrder: 5
  }
]
