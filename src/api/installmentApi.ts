import apiClient from './client'
import type {
  ApiResponse,
  Installment,
  InstallmentPayment,
  InstallmentPeriod,
  InstallmentStats,
  StoreInstallmentRequest,
  StoreInstallmentPaymentRequest,
} from './types'

export const installmentApi = {
  /** Get all installments */
  getAll: async (): Promise<Installment[]> => {
    const res = await apiClient.get<ApiResponse<Installment[]>>('/installments')
    return res.data.data
  },

  /** Get a single installment */
  getById: async (id: number | string): Promise<Installment> => {
    const res = await apiClient.get<ApiResponse<Installment>>(`/installments/${id}`)
    return res.data.data
  },

  /** Create a new installment */
  create: async (data: StoreInstallmentRequest): Promise<Installment> => {
    const res = await apiClient.post<ApiResponse<Installment>>('/installments', data)
    return res.data.data
  },

  /** Update an installment */
  update: async (id: number | string, data: Partial<Installment>): Promise<Installment> => {
    const res = await apiClient.put<ApiResponse<Installment>>(`/installments/${id}`, data)
    return res.data.data
  },

  /** Delete an installment */
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/installments/${id}`)
  },

  /** Get payments for an installment */
  getPayments: async (installmentId: number | string): Promise<InstallmentPayment[]> => {
    const res = await apiClient.get<ApiResponse<InstallmentPayment[]>>(
      `/installments/${installmentId}/payments`,
    )
    return res.data.data
  },

  /** Add a payment to an installment */
  addPayment: async (
    installmentId: number | string,
    data: StoreInstallmentPaymentRequest,
  ): Promise<{ payment: InstallmentPayment; stats: InstallmentStats }> => {
    const res = await apiClient.post<ApiResponse<{ payment: InstallmentPayment; stats: InstallmentStats }>>(
      `/installments/${installmentId}/payments`,
      data,
    )
    return res.data.data
  },

  /** Delete a payment */
  deletePayment: async (paymentId: number | string): Promise<void> => {
    await apiClient.delete(`/payments/${paymentId}`)
  },

  /** Get installment statistics */
  getStats: async (installmentId: number | string): Promise<InstallmentStats> => {
    const res = await apiClient.get<ApiResponse<InstallmentStats>>(
      `/installments/${installmentId}/stats`,
    )
    return res.data.data
  },

  /** Get all periods for an installment */
  getPeriods: async (installmentId: number | string): Promise<InstallmentPeriod[]> => {
    const res = await apiClient.get<ApiResponse<InstallmentPeriod[]>>(
      `/installments/${installmentId}/periods`,
    )
    return res.data.data
  },
}
