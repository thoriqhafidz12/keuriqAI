/**
 * Generate a unique ID using crypto.randomUUID when available,
 * with fallback for older browsers.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Get today's date as ISO string "YYYY-MM-DD".
 */
export function getTodayISO(): string {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

/**
 * Get current datetime as ISO string.
 */
export function getNowISO(): string {
  return new Date().toISOString()
}

/**
 * Get current year.
 */
export function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Get current month (1-12).
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

/**
 * Parse "YYYY-MM-DD" to a Date object.
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Get the month and year from an ISO date string.
 */
export function getMonthYear(dateStr: string): { month: number; year: number } {
  const [year, month] = dateStr.split('-').map(Number)
  return { month, year }
}

/**
 * Check if a date is in the given month/year.
 */
export function isInMonth(dateStr: string, year: number, month: number): boolean {
  const d = getMonthYear(dateStr)
  return d.year === year && d.month === month
}

/**
 * Check if a date is in the given year.
 */
export function isInYear(dateStr: string, year: number): boolean {
  return getMonthYear(dateStr).year === year
}

/**
 * Check if a date is between two dates (inclusive).
 */
export function isInDateRange(dateStr: string, from?: string, to?: string): boolean {
  if (from && dateStr < from) return false
  if (to && dateStr > to) return false
  return true
}

/**
 * Sort transactions by date, then by createdAt.
 */
export function sortByDate<T extends { date: string; createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.createdAt.localeCompare(b.createdAt)
  })
}
