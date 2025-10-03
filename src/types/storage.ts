// Types pour la gestion du stockage et de la synchronisation

export interface StorageConfig {
  version: number
  dbName: string
  stores: StorageStore[]
  migrations: Migration[]
}

export interface StorageStore {
  name: string
  keyPath: string
  autoIncrement?: boolean
  indexes: StorageIndex[]
}

export interface StorageIndex {
  name: string
  keyPath: string | string[]
  options?: {
    unique?: boolean
    multiEntry?: boolean
  }
}

export interface Migration {
  version: number
  description: string
  up: (db: IDBDatabase, transaction: IDBTransaction) => Promise<void>
  down?: (db: IDBDatabase, transaction: IDBTransaction) => Promise<void>
}

// Types pour les opérations de base de données
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  filters?: QueryFilter[]
}

export interface QueryFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains'
  value: any
}

export interface BulkOperation<T> {
  type: 'create' | 'update' | 'delete'
  data: T | T[]
  options?: {
    skipValidation?: boolean
    skipHooks?: boolean
  }
}

// Types pour la synchronisation
export interface SyncOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  entityId: string
  data: any
  timestamp: Date
  status: 'pending' | 'synced' | 'failed'
  retryCount: number
  lastError?: string
}

export interface SyncBatch {
  id: string
  operations: SyncOperation[]
  createdAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalOperations: number
  completedOperations: number
  failedOperations: number
}

export interface SyncConflictResolution {
  conflictId: string
  resolution: 'local' | 'remote' | 'merge'
  mergedData?: any
  resolvedAt: Date
  resolvedBy: 'user' | 'auto'
}

// Types pour le cache
export interface CacheEntry<T> {
  key: string
  data: T
  timestamp: Date
  expiresAt?: Date
  tags: string[]
  size: number
}

export interface CacheConfig {
  maxSize: number // en bytes
  maxAge: number // en millisecondes
  cleanupInterval: number // en millisecondes
  compressionEnabled: boolean
}

// Types pour l'import/export
export interface ImportOptions {
  format: 'json' | 'csv' | 'xlsx'
  mapping?: Record<string, string>
  validation?: boolean
  skipDuplicates?: boolean
  batchSize?: number
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf'
  entities: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: QueryFilter[]
  includeMetadata?: boolean
  compression?: boolean
}

export interface ImportResult {
  success: boolean
  totalRecords: number
  importedRecords: number
  skippedRecords: number
  failedRecords: number
  errors: ImportError[]
  warnings: string[]
  duration: number
}

export interface ImportError {
  row: number
  field?: string
  message: string
  data?: any
}

export interface ExportResult {
  success: boolean
  filePath?: string
  fileSize: number
  recordCount: number
  format: string
  generatedAt: Date
  error?: string
}

// Types pour la sauvegarde
export interface BackupConfig {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  retention: number // nombre de sauvegardes à conserver
  compression: boolean
  encryption: boolean
  includeAttachments: boolean
  cloudProvider?: 'google_drive' | 'dropbox' | 'onedrive'
}

export interface BackupMetadata {
  id: string
  version: string
  createdAt: Date
  size: number
  compressed: boolean
  encrypted: boolean
  entities: BackupEntity[]
  checksum: string
}

export interface BackupEntity {
  name: string
  count: number
  size: number
  lastModified: Date
}

export interface RestoreOptions {
  backupId: string
  entities?: string[]
  overwrite: boolean
  validateIntegrity: boolean
}

export interface RestoreResult {
  success: boolean
  restoredEntities: string[]
  totalRecords: number
  errors: string[]
  warnings: string[]
  duration: number
}

// Types pour la validation des données
export interface ValidationRule {
  field: string
  type: 'required' | 'type' | 'range' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: any, data: any) => boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface ValidationWarning {
  field: string
  message: string
  value?: any
}

// Types pour les hooks de données
export interface DataHook {
  event: 'before_create' | 'after_create' | 'before_update' | 'after_update' | 'before_delete' | 'after_delete'
  entity: string
  handler: (data: any, context: HookContext) => Promise<any>
  priority: number
}

export interface HookContext {
  user?: any
  transaction?: IDBTransaction
  metadata?: Record<string, any>
}

// Types pour les métriques de performance
export interface PerformanceMetrics {
  operationType: 'read' | 'write' | 'delete' | 'query'
  entity: string
  duration: number
  recordCount: number
  timestamp: Date
  success: boolean
  error?: string
}

export interface StorageStats {
  totalSize: number
  usedSize: number
  availableSize: number
  entities: EntityStats[]
  lastUpdated: Date
}

export interface EntityStats {
  name: string
  count: number
  size: number
  averageSize: number
  lastModified: Date
  indexes: IndexStats[]
}

export interface IndexStats {
  name: string
  size: number
  uniqueKeys: number
  lastUsed: Date
}

