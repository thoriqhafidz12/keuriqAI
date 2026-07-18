// ===== API Response Wrappers =====
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// ===== Auth Types =====
export interface User {
  id: number
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface AuthPayload {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

// ===== Transaction Types (from shared) =====
export type { Transaction, TransactionType } from '../types'

// ===== Installment Types (from shared) =====
export type { Installment, InstallmentPayment, InstallmentPeriod, InstallmentStatus, InstallmentStats } from '../types'

// ===== Asset Types (from shared) =====
export type { Asset, AssetChange, DepreciationSchedule, YearlyDepreciation } from '../types'

// ===== Report Types (from shared) =====
export type { BalanceResult, MonthlySummary, YearlyMonthSummary, FIFOResult, FundSource } from '../types'

// ===== Request Types =====
export interface StoreTransactionRequest {
  date: string
  type: 'saldo_awal' | 'penerimaan' | 'pengeluaran'
  category: string
  source?: string
  amount: number
  description?: string
}

export interface UpdateTransactionRequest {
  date?: string
  type?: 'saldo_awal' | 'penerimaan' | 'pengeluaran'
  category?: string
  source?: string
  amount?: number
  description?: string
}

export interface StoreInstallmentRequest {
  name: string
  total_price: number
  down_payment: number
  tenor: number
  start_date: string
  monthly_amount: number
}

export interface StoreInstallmentPaymentRequest {
  date: string
  amount: number
  period_number: number
  description?: string
}

export interface StoreAssetRequest {
  name: string
  category?: string
  location?: string
  acquisition_value: number
  acquisition_date: string
  acquisition_year: number
  useful_life: number
  residual_value?: number
  description?: string
}

export interface UpdateAssetRequest {
  name?: string
  category?: string
  location?: string
  acquisition_value?: number
  acquisition_date?: string
  acquisition_year?: number
  useful_life?: number
  residual_value?: number
  description?: string
}
