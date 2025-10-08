// Export all stores for easy importing
export { useUserStore } from './userStore'
export { useTransactionStore } from './transactionStore'
export { useSavingsStore } from './savingsStore'
export { useCategoryStore } from './categoryStore'
export { useGamificationStore } from './gamificationStore'
export { useAppStore } from './appStore'

// Store initialization helper
export const initializeStores = async () => {
  const { useAppStore } = await import('./appStore')
  const { useUserStore } = await import('./userStore')
  const { useGamificationStore } = await import('./gamificationStore')
  const { useCategoryStore } = await import('./categoryStore')
  const { useSavingsStore } = await import('./savingsStore')
  const { useTransactionStore } = await import('./transactionStore')

  try {
    // Initialize app first
    await useAppStore.getState().initializeApp()
    
    // Load user data
    await useUserStore.getState().loadUser()
    
    // If user exists, load other data
    const user = useUserStore.getState().getCurrentUser()
    if (user) {
      await Promise.all([
        useGamificationStore.getState().loadAchievements(),
        useCategoryStore.getState().loadCategories(),
        useSavingsStore.getState().loadSavingsBoxes(),
        useTransactionStore.getState().loadTransactions()
      ])
      
      // Check achievements and streaks
      await useGamificationStore.getState().checkAchievements()
      await useGamificationStore.getState().checkStreaks()
    }
    
    console.log('✅ Tous les stores initialisés')
    return true
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des stores:', error)
    return false
  }
}

// Store reset helper (for logout)
export const resetStores = async () => {
  const { useUserStore } = await import('./userStore')
  const { useTransactionStore } = await import('./transactionStore')
  const { useSavingsStore } = await import('./savingsStore')
  const { useCategoryStore } = await import('./categoryStore')
  const { useGamificationStore } = await import('./gamificationStore')

  // Reset all stores to initial state
  useUserStore.getState().logout()
  
  // Clear other stores data
  useTransactionStore.setState({
    transactions: [],
    summary: null,
    currentFilter: {},
    error: null
  })
  
  useSavingsStore.setState({
    savingsBoxes: [],
    goals: [],
    summary: null,
    error: null
  })
  
  useCategoryStore.setState({
    categories: [],
    error: null
  })
  
  useGamificationStore.setState({
    achievements: [],
    userLevel: null,
    badges: [],
    streaks: [],
    challenges: [],
    error: null
  })
  
  console.log('🔄 Stores réinitialisés')
}
