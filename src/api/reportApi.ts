import apiClient from './client'
import type {
  ApiResponse,
  BalanceResult,
  MonthlySummary,
  YearlyMonthSummary,
  FIFOResult,
} from './types'

export const reportApi = {
  /** Get current balance summary */
  getBalance: async (): Promise<BalanceResult> => {
    const res = await apiClient.get<ApiResponse<BalanceResult>>('/reports/balance')
    return res.data.data
  },

  /** Get FIFO fund allocation report */
  getFIFO: async (): Promise<FIFOResult> => {
    const res = await apiClient.get<ApiResponse<FIFOResult>>('/reports/fifo')
    return res.data.data
  },

  /** Get monthly summary for a specific year/month */
  getMonthlySummary: async (year: number, month: number): Promise<MonthlySummary> => {
    const res = await apiClient.get<ApiResponse<MonthlySummary>>(
      `/reports/monthly-summary/${year}/${month}`,
    )
    return res.data.data
  },

  /** Get yearly summary (by month) */
  getYearlySummary: async (year: number): Promise<YearlyMonthSummary[]> => {
    const res = await apiClient.get<ApiResponse<YearlyMonthSummary[]>>(
      `/reports/yearly-summary/${year}`,
    )
    return res.data.data
  },

  /** Get cashflow data for charting */
  getCashflow: async (year: number): Promise<
    { month: string; penerimaan: number; pengeluaran: number }[]
  > => {
    const res = await apiClient.get<ApiResponse<
      { month: string; penerimaan: number; pengeluaran: number }[]
    >>(`/reports/cashflow/${year}`)
    return res.data.data
  },
}
