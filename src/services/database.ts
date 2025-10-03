import Dexie, { Table } from 'dexie'
import { 
  Transaction, 
  Category, 
  SavingsBox, 
  FinancialGoal, 
  Budget, 
  FinancialAlert,
  User,
  Achievement,
  SyncOperation
} from '@/types'

// Interface pour la base de données
export interface SamaDepenseDB extends Dexie {
  // Tables principales
  transactions: Table<Transaction>
  categories: Table<Category>
  savingsBoxes: Table<SavingsBox>
  financialGoals: Table<FinancialGoal>
  budgets: Table<Budget>
  alerts: Table<FinancialAlert>
  
  // Tables utilisateur
  users: Table<User>
  achievements: Table<Achievement>
  
  // Tables système
  syncOperations: Table<SyncOperation>
  appSettings: Table<{ key: string; value: any }>
}

// Configuration de la base de données
class SamaDepenseDatabase extends Dexie implements SamaDepenseDB {
  transactions!: Table<Transaction>
  categories!: Table<Category>
  savingsBoxes!: Table<SavingsBox>
  financialGoals!: Table<FinancialGoal>
  budgets!: Table<Budget>
  alerts!: Table<FinancialAlert>
  users!: Table<User>
  achievements!: Table<Achievement>
  syncOperations!: Table<SyncOperation>
  appSettings!: Table<{ key: string; value: any }>

  constructor() {
    super('SamaDepenseDB')
    
    this.version(1).stores({
      transactions: '++id, amount, type, categoryId, savingsBoxId, createdAt, isRecurring',
      categories: '++id, name, type, isDefault, parentCategoryId',
      savingsBoxes: '++id, name, targetAmount, currentAmount, isActive, deadline',
      financialGoals: '++id, title, type, targetAmount, currentAmount, targetDate, status',
      budgets: '++id, name, period, totalAmount, startDate, endDate, isActive',
      alerts: '++id, type, severity, isRead, isActive, createdAt',
      users: '++id, name, email, currency, onboardingCompleted',
      achievements: '++id, title, category, type, isUnlocked, unlockedAt',
      syncOperations: '++id, type, entity, entityId, timestamp, status',
      appSettings: '++key'
    })

    // Hooks pour la gestion automatique des timestamps
    this.transactions.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.transactions.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date()
    })

    // Appliquer les hooks à toutes les tables avec BaseEntity
    const tablesWithTimestamps = [
      this.categories, this.savingsBoxes, this.financialGoals, 
      this.budgets, this.alerts, this.users, this.achievements
    ]

    tablesWithTimestamps.forEach(table => {
      table.hook('creating', (primKey, obj, trans) => {
        obj.createdAt = new Date()
        obj.updatedAt = new Date()
      })

      table.hook('updating', (modifications, primKey, obj, trans) => {
        modifications.updatedAt = new Date()
      })
    })
  }
}

// Instance singleton de la base de données
export const db = new SamaDepenseDatabase()

// Service de gestion de la base de données
export class DatabaseService {
  private static instance: DatabaseService
  private db: SamaDepenseDatabase

  private constructor() {
    this.db = db
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Méthodes utilitaires pour les transactions
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = await this.db.transactions.add({
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as Transaction)
    
    // Mettre à jour le solde de la box d'épargne si applicable
    if (transaction.savingsBoxId) {
      await this.updateSavingsBoxBalance(transaction.savingsBoxId, transaction.amount, transaction.type)
    }
    
    return id.toString()
  }

  async getTransactions(options?: {
    limit?: number
    offset?: number
    categoryId?: string
    type?: 'income' | 'expense'
    dateRange?: { start: Date; end: Date }
  }): Promise<Transaction[]> {
    let query = this.db.transactions.orderBy('createdAt').reverse()

    if (options?.categoryId) {
      query = query.filter(t => t.categoryId === options.categoryId)
    }

    if (options?.type) {
      query = query.filter(t => t.type === options.type)
    }

    if (options?.dateRange) {
      query = query.filter(t => 
        t.createdAt >= options.dateRange!.start && 
        t.createdAt <= options.dateRange!.end
      )
    }

    if (options?.offset) {
      query = query.offset(options.offset)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    return await query.toArray()
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    await this.db.transactions.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  }

  async deleteTransaction(id: string): Promise<void> {
    const transaction = await this.db.transactions.get(id)
    if (transaction && transaction.savingsBoxId) {
      // Ajuster le solde de la box d'épargne
      const reverseAmount = transaction.type === 'income' ? -transaction.amount : transaction.amount
      await this.updateSavingsBoxBalance(transaction.savingsBoxId, reverseAmount, transaction.type)
    }
    await this.db.transactions.delete(id)
  }

  // Méthodes pour les catégories
  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID()
    await this.db.categories.add({
      ...category,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Category)
    return id
  }

  async getCategories(type?: 'income' | 'expense' | 'both'): Promise<Category[]> {
    if (type && type !== 'both') {
      return await this.db.categories
        .filter(c => c.type === type || c.type === 'both')
        .toArray()
    }
    return await this.db.categories.toArray()
  }

  async getDefaultCategories(): Promise<Category[]> {
    return await this.db.categories.filter(c => c.isDefault).toArray()
  }

  // Méthodes pour les boxes d'épargne
  async createSavingsBox(box: Omit<SavingsBox, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID()
    await this.db.savingsBoxes.add({
      ...box,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as SavingsBox)
    return id
  }

  async getSavingsBoxes(activeOnly = false): Promise<SavingsBox[]> {
    if (activeOnly) {
      return await this.db.savingsBoxes.filter(box => box.isActive).toArray()
    }
    return await this.db.savingsBoxes.toArray()
  }

  async updateSavingsBoxBalance(boxId: string, amount: number, transactionType: 'income' | 'expense'): Promise<void> {
    const box = await this.db.savingsBoxes.get(boxId)
    if (!box) return

    const adjustment = transactionType === 'income' ? amount : -amount
    const newAmount = Math.max(0, box.currentAmount + adjustment)

    await this.db.savingsBoxes.update(boxId, {
      currentAmount: newAmount,
      updatedAt: new Date()
    })
  }

  // Méthodes pour les statistiques
  async getFinancialSummary(dateRange: { start: Date; end: Date }) {
    const transactions = await this.getTransactions({ dateRange })
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const savingsBoxes = await this.getSavingsBoxes(true)
    const totalSavings = savingsBoxes.reduce((sum, box) => sum + box.currentAmount, 0)
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalSavings,
      balance: income - expenses,
      transactionCount: transactions.length,
      savingsBoxCount: savingsBoxes.length
    }
  }

  async getCategoryStats(dateRange: { start: Date; end: Date }) {
    const transactions = await this.getTransactions({ dateRange })
    const categories = await this.getCategories()
    
    const categoryMap = new Map(categories.map(c => [c.id, c]))
    const stats = new Map<string, { name: string; amount: number; count: number; color: string }>()
    
    transactions.forEach(transaction => {
      const category = categoryMap.get(transaction.categoryId)
      if (!category) return
      
      const existing = stats.get(transaction.categoryId) || {
        name: category.name,
        amount: 0,
        count: 0,
        color: category.color
      }
      
      existing.amount += transaction.amount
      existing.count += 1
      stats.set(transaction.categoryId, existing)
    })
    
    return Array.from(stats.values()).sort((a, b) => b.amount - a.amount)
  }

  // Méthodes pour l'initialisation
  async initializeDefaultData(): Promise<void> {
    const existingCategories = await this.getCategories()
    if (existingCategories.length > 0) return

    // Catégories par défaut
    const defaultCategories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Dépenses
      { name: 'Alimentation', description: 'Courses, restaurants, nourriture', color: '#ef4444', icon: 'utensils', type: 'expense', isDefault: true, keywords: ['course', 'restaurant', 'nourriture', 'marché'] },
      { name: 'Transport', description: 'Essence, transport public, taxi', color: '#3b82f6', icon: 'car', type: 'expense', isDefault: true, keywords: ['essence', 'taxi', 'bus', 'transport'] },
      { name: 'Logement', description: 'Loyer, électricité, eau', color: '#8b5cf6', icon: 'home', type: 'expense', isDefault: true, keywords: ['loyer', 'électricité', 'eau', 'gaz'] },
      { name: 'Santé', description: 'Médecin, pharmacie, assurance', color: '#10b981', icon: 'heart', type: 'expense', isDefault: true, keywords: ['médecin', 'pharmacie', 'hôpital', 'santé'] },
      { name: 'Loisirs', description: 'Sorties, divertissement, hobbies', color: '#f59e0b', icon: 'gamepad-2', type: 'expense', isDefault: true, keywords: ['cinéma', 'sport', 'jeu', 'sortie'] },
      { name: 'Éducation', description: 'École, formation, livres', color: '#06b6d4', icon: 'book', type: 'expense', isDefault: true, keywords: ['école', 'formation', 'livre', 'cours'] },
      
      // Revenus
      { name: 'Salaire', description: 'Salaire principal', color: '#22c55e', icon: 'banknote', type: 'income', isDefault: true, keywords: ['salaire', 'paie', 'traitement'] },
      { name: 'Freelance', description: 'Travail indépendant', color: '#a855f7', icon: 'briefcase', type: 'income', isDefault: true, keywords: ['freelance', 'consultation', 'projet'] },
      { name: 'Autres revenus', description: 'Revenus divers', color: '#64748b', icon: 'plus-circle', type: 'income', isDefault: true, keywords: ['bonus', 'prime', 'cadeau'] }
    ]

    for (const category of defaultCategories) {
      await this.createCategory(category)
    }
  }

  // Méthodes pour la sauvegarde et restauration
  async exportData(): Promise<any> {
    const [transactions, categories, savingsBoxes, goals, budgets] = await Promise.all([
      this.db.transactions.toArray(),
      this.db.categories.toArray(),
      this.db.savingsBoxes.toArray(),
      this.db.financialGoals.toArray(),
      this.db.budgets.toArray()
    ])

    return {
      version: 1,
      exportedAt: new Date(),
      data: {
        transactions,
        categories,
        savingsBoxes,
        financialGoals: goals,
        budgets
      }
    }
  }

  async importData(data: any): Promise<void> {
    await this.db.transaction('rw', [
      this.db.transactions,
      this.db.categories,
      this.db.savingsBoxes,
      this.db.financialGoals,
      this.db.budgets
    ], async () => {
      if (data.data.categories) {
        await this.db.categories.bulkAdd(data.data.categories)
      }
      if (data.data.savingsBoxes) {
        await this.db.savingsBoxes.bulkAdd(data.data.savingsBoxes)
      }
      if (data.data.transactions) {
        await this.db.transactions.bulkAdd(data.data.transactions)
      }
      if (data.data.financialGoals) {
        await this.db.financialGoals.bulkAdd(data.data.financialGoals)
      }
      if (data.data.budgets) {
        await this.db.budgets.bulkAdd(data.data.budgets)
      }
    })
  }

  async clearAllData(): Promise<void> {
    await this.db.transaction('rw', [
      this.db.transactions,
      this.db.categories,
      this.db.savingsBoxes,
      this.db.financialGoals,
      this.db.budgets,
      this.db.alerts
    ], async () => {
      await Promise.all([
        this.db.transactions.clear(),
        this.db.categories.clear(),
        this.db.savingsBoxes.clear(),
        this.db.financialGoals.clear(),
        this.db.budgets.clear(),
        this.db.alerts.clear()
      ])
    })
  }
}

// Export de l'instance singleton
export const databaseService = DatabaseService.getInstance()

