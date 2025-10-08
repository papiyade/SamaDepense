import { type Currency, CURRENCIES } from '@/types'

/**
 * Formate un montant selon la devise spécifiée
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals
  })

  const formattedAmount = formatter.format(Math.abs(amount))
  
  // Pour le CFA, on met le symbole après
  if (currency.code === 'XOF') {
    return `${formattedAmount} ${currency.symbol}`
  }
  
  // Pour les autres devises, symbole avant
  return `${currency.symbol}${formattedAmount}`
}

/**
 * Formate un montant avec signe (+ ou -)
 */
export function formatCurrencyWithSign(amount: number, currency: Currency): string {
  const sign = amount >= 0 ? '+' : '-'
  const formatted = formatCurrency(amount, currency)
  return `${sign}${formatted}`
}

/**
 * Parse un montant depuis une chaîne
 */
export function parseCurrencyAmount(value: string, _currency: Currency): number {
  // Supprimer tous les caractères non numériques sauf le point et la virgule
  const cleanValue = value.replace(/[^\d.,]/g, '')
  
  // Remplacer la virgule par un point pour la conversion
  const normalizedValue = cleanValue.replace(',', '.')
  
  const parsed = parseFloat(normalizedValue)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Obtient la devise par son code
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(currency => currency.code === code)
}

/**
 * Obtient la devise par défaut (CFA)
 */
export function getDefaultCurrency(): Currency {
  return CURRENCIES[0] // XOF
}

/**
 * Convertit un montant d'une devise à une autre (simulation)
 * Dans une vraie app, ceci ferait appel à une API de taux de change
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: Currency, 
  toCurrency: Currency
): number {
  // Taux de change fictifs pour la démo
  const exchangeRates: Record<string, Record<string, number>> = {
    'XOF': { 'EUR': 0.00152, 'USD': 0.00163 },
    'EUR': { 'XOF': 655.957, 'USD': 1.07 },
    'USD': { 'XOF': 613.5, 'EUR': 0.93 }
  }

  if (fromCurrency.code === toCurrency.code) {
    return amount
  }

  const rate = exchangeRates[fromCurrency.code]?.[toCurrency.code]
  if (!rate) {
    console.warn(`Taux de change non disponible: ${fromCurrency.code} -> ${toCurrency.code}`)
    return amount
  }

  return amount * rate
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calcule la différence en pourcentage entre deux montants
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * Arrondit un montant selon les décimales de la devise
 */
export function roundToCurrency(amount: number, currency: Currency): number {
  const factor = Math.pow(10, currency.decimals)
  return Math.round(amount * factor) / factor
}

/**
 * Vérifie si un montant est valide
 */
export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && isFinite(amount) && amount >= 0
}

/**
 * Formate un montant pour l'affichage dans les graphiques
 */
export function formatChartAmount(amount: number, currency: Currency): string {
  // Pour les gros montants, utiliser des abréviations
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${currency.symbol}`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k ${currency.symbol}`
  }
  
  return formatCurrency(amount, currency)
}
