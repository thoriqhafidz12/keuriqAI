/**
 * Format a number as Indonesian Rupiah currency string.
 * Example: 1000000 -> "Rp1.000.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format an ISO date string to long Indonesian format.
 * Example: "2024-01-15" -> "15 Januari 2024"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-')
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`
}

/**
 * Format an ISO date string to short Indonesian format.
 * Example: "2024-01-15" -> "15 Jan 2024"
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-')
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ]
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`
}

/**
 * Format a decimal as Indonesian percentage string.
 * Example: 0.754 -> "75,4%"
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format month number to Indonesian month name.
 */
export function formatMonth(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return months[month - 1] || ''
}

/**
 * Format a number with Indonesian grouping (dot as thousand separator).
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}
