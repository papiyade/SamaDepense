import Dexie, { type Table } from 'dexie'
import { 
  type User, 
  type Transaction, 
  type Category, 
  type SavingsBox, 
  type Achievement, 
  type NotificationData,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_ACHIEVEMENTS
} from '@/types'
import { v4 as uuidv4 } from 'uuid'

export class SamaDepenseDB extends Dexie {
  users!: Table<User>
  transactions!: Table<Transaction>
  categories!: Table<Category>
  savingsBoxes!: Table<SavingsBox>
  achievements!: Table<Achievement>
  notifications!: Table<NotificationData>

  constructor() {
    super('SamaDepenseDB')
    
    this.version(1).stores({
      users: 'id, email, createdAt',
      transactions: 'id, userId, type, categoryId, savingsBoxId, date, createdAt',
      categories: 'id, userId, type, isDefault, isActive',
      savingsBoxes: 'id, userId, isActive, createdAt',
      achievements: 'id, category, type, isUnlocked',
      notifications: 'id, type, isRead, createdAt'
    })

    // Hooks pour la synchronisation
    this.transactions.hook('creating', (_primKey, obj, _trans) => {
      obj.id = obj.id || uuidv4()
      obj.createdAt = obj.createdAt || new Date()
      obj.updatedAt = new Date()
    })

    this.transactions.hook('updating', (modifications, _primKey, _obj, _trans) => {
      ;(modifications as any).updatedAt = new Date()
    })

    this.categories.hook('creating', (_primKey, obj, _trans) => {
      obj.id = obj.id || uuidv4()
      obj.createdAt = obj.createdAt || new Date()
      obj.updatedAt = new Date()
    })

    this.savingsBoxes.hook('creating', (_primKey, obj, _trans) => {
      obj.id = obj.id || uuidv4()
      obj.createdAt = obj.createdAt || new Date()
      obj.updatedAt = new Date()
    })

    this.users.hook('creating', (_primKey, obj, _trans) => {
      obj.id = obj.id || uuidv4()
      obj.createdAt = obj.createdAt || new Date()
      obj.updatedAt = new Date()
    })

    this.achievements.hook('creating', (_primKey, obj, _trans) => {
      obj.id = obj.id || uuidv4()
    })

    this.notifications.hook('creating', (_primKey, obj, _trans) => {
      obj.id = obj.id || uuidv4()
      obj.createdAt = obj.createdAt || new Date()
    })
  }

  // Initialisation des données par défaut
  async initializeDefaultData(userId: string) {
    try {
      await this.transaction('rw', this.categories, this.achievements, async () => {
        // Créer les catégories par défaut
        const expenseCategories = DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
          ...cat,
          id: uuidv4(),
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        const incomeCategories = DEFAULT_INCOME_CATEGORIES.map(cat => ({
          ...cat,
          id: uuidv4(),
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        await this.categories.bulkAdd([...expenseCategories, ...incomeCategories])

        // Créer les achievements par défaut
        const achievements = DEFAULT_ACHIEVEMENTS.map(achievement => ({
          ...achievement,
          id: uuidv4(),
          isUnlocked: false,
          progress: 0
        }))

        await this.achievements.bulkAdd(achievements)
      })

      console.log('✅ Données par défaut initialisées')
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données par défaut:', error)
      throw error
    }
  }

  // Méthodes utilitaires pour les requêtes courantes
  async getUserTransactions(userId: string, limit?: number) {
    const transactions = await this.transactions
      .where('userId')
      .equals(userId)
      .toArray()

    // Trier par date décroissante
    const sorted = transactions.sort((a, b) => b.date.getTime() - a.date.getTime())

    if (limit) {
      return sorted.slice(0, limit)
    }

    return sorted
  }

  async getUserCategories(userId: string, type?: string) {
    const userCategories = await this.categories
      .where('userId')
      .equals(userId)
      .toArray()

    const defaultCategories = await this.categories
      .where('isDefault')
      .equals(1 as any)
      .toArray()

    const allCategories = [...userCategories, ...defaultCategories]

    if (type) {
      return allCategories.filter(cat => cat.type === type)
    }

    return allCategories
  }

  async getUserSavingsBoxes(userId: string) {
    return await this.savingsBoxes
      .where('userId')
      .equals(userId)
      .filter(box => box.isActive)
      .toArray()
  }

  async getUnreadNotifications(_userId: string) {
    return await this.notifications
      .where('isRead')
      .equals(0 as any)
      .toArray()
  }

  // Méthode pour nettoyer les anciennes données
  async cleanup() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Supprimer les notifications anciennes et lues
    await this.notifications
      .where('createdAt')
      .below(thirtyDaysAgo)
      .filter(notif => notif.isRead)
      .delete()
  }

  // Méthode pour exporter les données
  async exportUserData(userId: string) {
    const [user, transactions, categories, savingsBoxes, achievements] = await Promise.all([
      this.users.get(userId),
      this.getUserTransactions(userId),
      this.getUserCategories(userId),
      this.getUserSavingsBoxes(userId),
      this.achievements.toArray()
    ])

    return {
      user,
      transactions,
      categories,
      savingsBoxes,
      achievements,
      exportedAt: new Date()
    }
  }
}

// Instance singleton de la base de données
export const db = new SamaDepenseDB()
