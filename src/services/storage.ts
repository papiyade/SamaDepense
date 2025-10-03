import { databaseService } from './database'
import { 
  Transaction, 
  Category, 
  SavingsBox, 
  FinancialGoal,
  ExportOptions,
  ImportResult,
  ExportResult
} from '@/types'

// Service de stockage unifié
export class StorageService {
  private static instance: StorageService
  private dbService = databaseService

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  // === TRANSACTIONS ===
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await this.dbService.createTransaction(transaction)
  }

  async getTransactions(filters?: {
    limit?: number
    offset?: number
    categoryId?: string
    type?: 'income' | 'expense'
    dateRange?: { start: Date; end: Date }
    searchTerm?: string
  }): Promise<Transaction[]> {
    let transactions = await this.dbService.getTransactions(filters)

    // Filtrage par terme de recherche
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      transactions = transactions.filter(t => 
        t.description.toLowerCase().includes(searchTerm) ||
        t.notes?.toLowerCase().includes(searchTerm) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    return transactions
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return await this.dbService.db.transactions.get(id)
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    await this.dbService.updateTransaction(id, updates)
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.dbService.deleteTransaction(id)
  }

  async getRecentTransactions(limit = 10): Promise<Transaction[]> {
    return await this.getTransactions({ limit })
  }

  // === CATÉGORIES ===
  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await this.dbService.createCategory(category)
  }

  async getCategories(type?: 'income' | 'expense' | 'both'): Promise<Category[]> {
    return await this.dbService.getCategories(type)
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return await this.dbService.db.categories.get(id)
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    await this.dbService.db.categories.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  }

  async deleteCategory(id: string): Promise<void> {
    // Vérifier s'il y a des transactions liées
    const relatedTransactions = await this.getTransactions({ categoryId: id })
    if (relatedTransactions.length > 0) {
      throw new Error('Impossible de supprimer une catégorie qui contient des transactions')
    }
    await this.dbService.db.categories.delete(id)
  }

  async getDefaultCategories(): Promise<Category[]> {
    return await this.dbService.getDefaultCategories()
  }

  // === BOXES D'ÉPARGNE ===
  async createSavingsBox(box: Omit<SavingsBox, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await this.dbService.createSavingsBox(box)
  }

  async getSavingsBoxes(activeOnly = false): Promise<SavingsBox[]> {
    return await this.dbService.getSavingsBoxes(activeOnly)
  }

  async getSavingsBoxById(id: string): Promise<SavingsBox | undefined> {
    return await this.dbService.db.savingsBoxes.get(id)
  }

  async updateSavingsBox(id: string, updates: Partial<SavingsBox>): Promise<void> {
    await this.dbService.db.savingsBoxes.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  }

  async deleteSavingsBox(id: string): Promise<void> {
    // Vérifier s'il y a des transactions liées
    const relatedTransactions = await this.getTransactions({ limit: 1 })
    const hasRelatedTransactions = relatedTransactions.some(t => t.savingsBoxId === id)
    
    if (hasRelatedTransactions) {
      throw new Error('Impossible de supprimer une box d\'épargne qui contient des transactions')
    }
    
    await this.dbService.db.savingsBoxes.delete(id)
  }

  async transferToSavingsBox(boxId: string, amount: number, description: string): Promise<string> {
    const box = await this.getSavingsBoxById(boxId)
    if (!box) {
      throw new Error('Box d\'épargne introuvable')
    }

    // Créer une transaction de transfert
    return await this.createTransaction({
      amount,
      description: description || `Transfert vers ${box.name}`,
      type: 'expense',
      categoryId: 'savings', // Catégorie spéciale pour les épargnes
      savingsBoxId: boxId,
      isRecurring: false,
      tags: ['épargne', 'transfert']
    })
  }

  // === STATISTIQUES ===
  async getFinancialSummary(dateRange: { start: Date; end: Date }) {
    return await this.dbService.getFinancialSummary(dateRange)
  }

  async getCategoryStats(dateRange: { start: Date; end: Date }) {
    return await this.dbService.getCategoryStats(dateRange)
  }

  async getMonthlyTrends(months = 12) {
    const trends = []
    const now = new Date()
    
    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const summary = await this.getFinancialSummary({ start: startDate, end: endDate })
      
      trends.push({
        month: startDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        income: summary.totalIncome,
        expenses: summary.totalExpenses,
        savings: summary.totalSavings,
        balance: summary.balance
      })
    }
    
    return trends
  }

  async getSavingsProgress(): Promise<Array<{
    boxId: string
    name: string
    current: number
    target: number
    percentage: number
    color: string
  }>> {
    const boxes = await this.getSavingsBoxes(true)
    
    return boxes.map(box => ({
      boxId: box.id,
      name: box.name,
      current: box.currentAmount,
      target: box.targetAmount,
      percentage: Math.round((box.currentAmount / box.targetAmount) * 100),
      color: box.color
    }))
  }

  // === RECHERCHE ET FILTRES ===
  async searchTransactions(query: string, filters?: {
    type?: 'income' | 'expense'
    categoryId?: string
    dateRange?: { start: Date; end: Date }
  }): Promise<Transaction[]> {
    return await this.getTransactions({
      ...filters,
      searchTerm: query
    })
  }

  async getTransactionsByCategory(categoryId: string, limit?: number): Promise<Transaction[]> {
    return await this.getTransactions({ categoryId, limit })
  }

  async getTransactionsBySavingsBox(boxId: string, limit?: number): Promise<Transaction[]> {
    const transactions = await this.dbService.db.transactions
      .filter(t => t.savingsBoxId === boxId)
      .limit(limit || 100)
      .reverse()
      .toArray()
    
    return transactions
  }

  // === IMPORT/EXPORT ===
  async exportData(options: ExportOptions): Promise<ExportResult> {
    try {
      const startTime = Date.now()
      
      // Récupérer les données selon les options
      const transactions = await this.getTransactions({
        dateRange: options.dateRange
      })
      
      const categories = await this.getCategories()
      const savingsBoxes = options.includeSavings ? await this.getSavingsBoxes() : []
      
      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        dateRange: options.dateRange,
        summary: await this.getFinancialSummary(options.dateRange),
        data: {
          transactions: options.includeCategories ? transactions : transactions.map(t => ({ ...t, categoryId: undefined })),
          categories: options.includeCategories ? categories : [],
          savingsBoxes
        }
      }

      const dataString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Créer un lien de téléchargement
      const link = document.createElement('a')
      link.href = url
      link.download = `sama-depense-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return {
        success: true,
        filePath: link.download,
        fileSize: blob.size,
        recordCount: transactions.length,
        format: options.format,
        generatedAt: new Date()
      }
    } catch (error) {
      return {
        success: false,
        fileSize: 0,
        recordCount: 0,
        format: options.format,
        generatedAt: new Date(),
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }

  async importData(file: File): Promise<ImportResult> {
    try {
      const startTime = Date.now()
      const text = await file.text()
      const data = JSON.parse(text)
      
      let importedRecords = 0
      let skippedRecords = 0
      let failedRecords = 0
      const errors: any[] = []

      // Importer les catégories en premier
      if (data.data?.categories) {
        for (const category of data.data.categories) {
          try {
            // Vérifier si la catégorie existe déjà
            const existing = await this.dbService.db.categories
              .filter(c => c.name === category.name)
              .first()
            
            if (existing) {
              skippedRecords++
            } else {
              await this.createCategory({
                ...category,
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined
              })
              importedRecords++
            }
          } catch (error) {
            failedRecords++
            errors.push({
              row: importedRecords + skippedRecords + failedRecords,
              message: `Erreur lors de l'import de la catégorie: ${error}`
            })
          }
        }
      }

      // Importer les boxes d'épargne
      if (data.data?.savingsBoxes) {
        for (const box of data.data.savingsBoxes) {
          try {
            await this.createSavingsBox({
              ...box,
              id: undefined,
              createdAt: undefined,
              updatedAt: undefined
            })
            importedRecords++
          } catch (error) {
            failedRecords++
            errors.push({
              row: importedRecords + skippedRecords + failedRecords,
              message: `Erreur lors de l'import de la box: ${error}`
            })
          }
        }
      }

      // Importer les transactions
      if (data.data?.transactions) {
        for (const transaction of data.data.transactions) {
          try {
            await this.createTransaction({
              ...transaction,
              id: undefined,
              createdAt: undefined,
              updatedAt: undefined
            })
            importedRecords++
          } catch (error) {
            failedRecords++
            errors.push({
              row: importedRecords + skippedRecords + failedRecords,
              message: `Erreur lors de l'import de la transaction: ${error}`
            })
          }
        }
      }

      const totalRecords = (data.data?.categories?.length || 0) + 
                          (data.data?.savingsBoxes?.length || 0) + 
                          (data.data?.transactions?.length || 0)

      return {
        success: true,
        totalRecords,
        importedRecords,
        skippedRecords,
        failedRecords,
        errors,
        warnings: [],
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        failedRecords: 0,
        errors: [{
          row: 0,
          message: error instanceof Error ? error.message : 'Erreur lors de l\'import'
        }],
        warnings: [],
        duration: 0
      }
    }
  }

  // === INITIALISATION ===
  async initialize(): Promise<void> {
    await this.dbService.initializeDefaultData()
  }

  async clearAllData(): Promise<void> {
    await this.dbService.clearAllData()
  }

  // === UTILITAIRES ===
  async getStorageInfo() {
    const [transactions, categories, savingsBoxes] = await Promise.all([
      this.dbService.db.transactions.count(),
      this.dbService.db.categories.count(),
      this.dbService.db.savingsBoxes.count()
    ])

    return {
      transactions,
      categories,
      savingsBoxes,
      lastUpdated: new Date()
    }
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine
  }

  async getOfflineStatus() {
    const isOnline = await this.isOnline()
    const storageInfo = await this.getStorageInfo()
    
    return {
      isOnline,
      hasLocalData: storageInfo.transactions > 0,
      lastSync: null, // À implémenter avec la synchronisation
      pendingChanges: 0 // À implémenter avec la synchronisation
    }
  }
}

// Export de l'instance singleton
export const storageService = StorageService.getInstance()

