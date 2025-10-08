import { format, formatDistanceToNow, isToday, isYesterday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, isSameMonth, isSameYear } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Formate une date selon le format spécifié
 */
export function formatDate(date: Date, dateFormat: string = 'DD/MM/YYYY'): string {
  const formatMap: Record<string, string> = {
    'DD/MM/YYYY': 'dd/MM/yyyy',
    'MM/DD/YYYY': 'MM/dd/yyyy',
    'YYYY-MM-DD': 'yyyy-MM-dd'
  }

  const formatString = formatMap[dateFormat] || 'dd/MM/yyyy'
  return format(date, formatString, { locale: fr })
}

/**
 * Formate une date de manière relative (il y a X jours)
 */
export function formatRelativeDate(date: Date): string {
  if (isToday(date)) {
    return "Aujourd'hui"
  }
  
  if (isYesterday(date)) {
    return 'Hier'
  }

  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: fr 
  })
}

/**
 * Formate une date pour l'affichage dans les listes
 */
export function formatListDate(date: Date): string {
  if (isToday(date)) {
    return `Aujourd'hui ${format(date, 'HH:mm')}`
  }
  
  if (isYesterday(date)) {
    return `Hier ${format(date, 'HH:mm')}`
  }

  return format(date, 'dd/MM/yyyy HH:mm', { locale: fr })
}

/**
 * Obtient le début du mois pour une date
 */
export function getMonthStart(date: Date = new Date()): Date {
  return startOfMonth(date)
}

/**
 * Obtient la fin du mois pour une date
 */
export function getMonthEnd(date: Date = new Date()): Date {
  return endOfMonth(date)
}

/**
 * Obtient le début de la semaine pour une date
 */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }) // Lundi
}

/**
 * Obtient la fin de la semaine pour une date
 */
export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 }) // Dimanche
}

/**
 * Obtient les 30 derniers jours
 */
export function getLast30Days(): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  const startDate = subDays(endDate, 30)
  
  return { startDate, endDate }
}

/**
 * Obtient les 7 derniers jours
 */
export function getLast7Days(): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  const startDate = subDays(endDate, 7)
  
  return { startDate, endDate }
}

/**
 * Génère une liste de mois pour les filtres
 */
export function getMonthOptions(count: number = 12): Array<{ value: string; label: string }> {
  const options = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = format(date, 'yyyy-MM')
    const label = format(date, 'MMMM yyyy', { locale: fr })
    
    options.push({ value, label })
  }
  
  return options
}

/**
 * Génère une liste d'années pour les filtres
 */
export function getYearOptions(count: number = 5): Array<{ value: string; label: string }> {
  const options = []
  const currentYear = new Date().getFullYear()
  
  for (let i = 0; i < count; i++) {
    const year = currentYear - i
    options.push({ 
      value: year.toString(), 
      label: year.toString() 
    })
  }
  
  return options
}

/**
 * Vérifie si une date est dans le mois courant
 */
export function isCurrentMonth(date: Date): boolean {
  return isSameMonth(date, new Date())
}

/**
 * Vérifie si une date est dans l'année courante
 */
export function isCurrentYear(date: Date): boolean {
  return isSameYear(date, new Date())
}

/**
 * Calcule le nombre de jours entre deux dates
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Obtient le nom du mois en français
 */
export function getMonthName(date: Date): string {
  return format(date, 'MMMM', { locale: fr })
}

/**
 * Obtient le nom du jour en français
 */
export function getDayName(date: Date): string {
  return format(date, 'EEEE', { locale: fr })
}

/**
 * Parse une date depuis une chaîne ISO
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString)
}

/**
 * Convertit une date en chaîne ISO
 */
export function toISOString(date: Date): string {
  return date.toISOString()
}

/**
 * Obtient la date de début et fin pour une période donnée
 */
export function getPeriodRange(period: 'week' | 'month' | 'year', date: Date = new Date()): { startDate: Date; endDate: Date } {
  switch (period) {
    case 'week':
      return {
        startDate: getWeekStart(date),
        endDate: getWeekEnd(date)
      }
    case 'month':
      return {
        startDate: getMonthStart(date),
        endDate: getMonthEnd(date)
      }
    case 'year':
      return {
        startDate: new Date(date.getFullYear(), 0, 1),
        endDate: new Date(date.getFullYear(), 11, 31)
      }
    default:
      return {
        startDate: date,
        endDate: date
      }
  }
}
