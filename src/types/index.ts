// ===== Transaction Types =====
export type TransactionType = 'saldo_awal' | 'penerimaan' | 'pengeluaran'

export interface Transaction {
  id: string | number  // string for localStorage, number for backend
  date: string // ISO date "YYYY-MM-DD"
  type: TransactionType
  category: string
  source?: string // Only for penerimaan
  amount: number // Always positive
  description: string
  createdAt: string
  updatedAt: string
}

// ===== FIFO Types =====
export interface FIFOAllocation {
  incomeTransactionId: string | number
  expenseTransactionId: string | number
  amountUsed: number
}

export interface FundSource {
  transactionId: string | number
  type: 'saldo_awal' | 'penerimaan'
  date: string
  category: string
  source?: string
  description: string
  originalAmount: number
  usedAmount: number
  remainingAmount: number
  allocations: { expenseId: string | number; expenseDate: string; expenseCategory: string; amount: number }[]
}

export interface FIFOResult {
  sources: FundSource[]
  totalBalance: number
  totalAvailable: number
  totalUsed: number
}

// ===== Installment Types =====
export type InstallmentStatus = 'active' | 'paid_off'

export interface Installment {
  id: string | number
  name: string
  totalPrice: number
  downPayment: number
  tenor: number // months
  startDate: string // ISO date
  monthlyAmount: number
  status: InstallmentStatus
  createdAt: string
  updatedAt: string
}

export interface InstallmentPayment {
  id: string | number
  installmentId: string | number
  periodNumber?: number // Period number (1..tenor)
  date: string
  amount: number
  description: string
  expenseTransactionId: string | number // Auto-generated expense
  createdAt: string
}

export interface InstallmentPeriod {
  periodNumber: number
  amount: number
  dueDate: string
  status: 'paid' | 'unpaid'
  payment?: {
    id: string | number
    date: string
    amount: number
    description: string
  } | null
}

export interface InstallmentStats {
  totalPaid: number
  remaining: number
  paidPercentage: number
  remainingMonths: number
  isPaidOff: boolean
}

// ===== Asset Types =====
export interface Asset {
  id: string | number
  registerNumber?: string // Auto-generated, read-only
  name: string
  category?: string
  location?: string
  acquisitionValue: number
  acquisitionDate: string // ISO date
  acquisitionYear: number
  usefulLife: number // years
  residualValue: number
  description?: string // keterangan
  createdAt: string
  updatedAt: string
}

export interface AssetChange {
  id: string | number
  field: string
  oldValue: string | null
  newValue: string | null
  userName: string
  createdAt: string
}

export interface YearlyDepreciation {
  year: number
  annualDepreciation: number
  accumulatedDepreciation: number
  bookValue: number
}

export interface DepreciationSchedule {
  assetId: string
  assetName: string
  acquisitionValue: number
  residualValue: number
  usefulLife: number
  annualDepreciation: number
  years: YearlyDepreciation[]
  totalAccumulatedDepreciation: number
  currentBookValue: number
  isFullyDepreciated: boolean
}

// ===== Auth Types =====
export interface AuthData {
  passwordHash: string
  createdAt: string
}

export interface User {
  id: number
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

// ===== Balance Types =====
export interface BalanceResult {
  initialBalance: number
  totalIncome: number
  totalExpenses: number
  currentBalance: number
}

export interface MonthlySummary {
  income: number
  expenses: number
  balance: number
  incomeByCategory: Record<string, number>
  expensesByCategory: Record<string, number>
}

export interface YearlyMonthSummary {
  month: number
  income: number
  expenses: number
  balance: number
}

// ===== Constants =====
export const INCOME_CATEGORIES = [
  'Gaji', 'Bonus', 'Penjualan', 'THR', 'Cashback', 'Investasi', 'Lainnya',
] as const

export const EXPENSE_CATEGORIES = [
  'Makan', 'BBM', 'Belanja', 'Listrik', 'Internet',
  'Transportasi', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Cicilan', 'Lainnya',
] as const

export const INCOME_SOURCES = [
  'Gaji', 'Bonus', 'Penjualan', 'THR', 'Cashback', 'Investasi', 'Lainnya',
] as const

// ===== Storage Keys =====
export const STORAGE_KEYS = {
  auth: 'keuriqAI:auth',
  transactions: 'keuriqAI:transactions',
  installments: 'keuriqAI:installments',
  payments: 'keuriqAI:payments',
  assets: 'keuriqAI:assets',
  version: 'keuriqAI:version',
  session: 'keuriqAI:session',
} as const

export const APP_VERSION = '1.0.0'
