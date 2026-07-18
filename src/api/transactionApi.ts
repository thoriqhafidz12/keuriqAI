import apiClient from './client'
import type {
  ApiResponse,
  Transaction,
  StoreTransactionRequest,
  UpdateTransactionRequest,
} from './types'

export const transactionApi = {
  /** Get all transactions */
  getAll: async (): Promise<Transaction[]> => {
    const res = await apiClient.get<ApiResponse<Transaction[]>>('/transactions')
    return res.data.data
  },

  /** Get a single transaction by ID */
  getById: async (id: number | string): Promise<Transaction> => {
    const res = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`)
    return res.data.data
  },

  /** Create a new transaction */
  create: async (data: StoreTransactionRequest): Promise<Transaction> => {
    const res = await apiClient.post<ApiResponse<Transaction>>('/transactions', data)
    return res.data.data
  },

  /** Update an existing transaction */
  update: async (id: number | string, data: UpdateTransactionRequest): Promise<Transaction> => {
    const res = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, data)
    return res.data.data
  },

  /** Delete a transaction */
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`)
  },

  /** Get transactions filtered by type */
  getByType: async (type: string): Promise<Transaction[]> => {
    const res = await apiClient.get<ApiResponse<Transaction[]>>(`/transactions/type/${type}`)
    return res.data.data
  },

  /** Get transactions filtered by date range */
  getByDateRange: async (from?: string, to?: string): Promise<Transaction[]> => {
    const res = await apiClient.get<ApiResponse<Transaction[]>>('/transactions/date-range', {
      params: { from, to },
    })
    return res.data.data
  },
}
