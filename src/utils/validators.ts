/**
 * Validate that a string value is not empty.
 */
export function validateRequired(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return 'Wajib diisi'
  }
  return null
}

/**
 * Validate that a number is positive (> 0).
 */
export function validatePositiveNumber(value: number): string | null {
  if (isNaN(value) || value <= 0) {
    return 'Harus lebih dari 0'
  }
  return null
}

/**
 * Validate that a number is not negative.
 */
export function validateNotNegative(value: number): string | null {
  if (isNaN(value) || value < 0) {
    return 'Tidak boleh negatif'
  }
  return null
}

/**
 * Validate that a date string is in valid format "YYYY-MM-DD".
 */
export function validateDate(value: string): string | null {
  if (!value) return 'Wajib diisi'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return 'Format tanggal tidak valid'
  }
  return null
}

/**
 * Validate year is reasonable (between 2000 and 2100).
 */
export function validateYear(value: number): string | null {
  if (isNaN(value) || value < 2000 || value > 2100) {
    return 'Tahun tidak valid'
  }
  return null
}

/**
 * Run all validators on a field and return the first error.
 */
export function validateField(value: unknown, validators: Array<(v: never) => string | null>): string | null {
  for (const validator of validators) {
    const error = validator(value as never)
    if (error) return error
  }
  return null
}
