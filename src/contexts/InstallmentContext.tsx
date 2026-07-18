import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Installment, InstallmentPayment, InstallmentStats } from '../types'
import { useAuth } from '../hooks/useAuth'
import { installmentApi } from '../api/installmentApi'

interface InstallmentContextValue {
  installments: Installment[]
  payments: InstallmentPayment[]
  isLoading: boolean
  error: string | null
  addInstallment: (data: Omit<Installment, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Installment>
  updateInstallment: (id: string | number, updates: Partial<Installment>) => Promise<void>
  deleteInstallment: (id: string | number) => Promise<void>
  getInstallment: (id: string | number) => Installment | undefined
  addPayment: (data: { installmentId: string | number; date: string; amount: number; description: string; periodNumber: number }) => Promise<{ payment: InstallmentPayment; stats: InstallmentStats }>
  deletePayment: (id: string | number) => Promise<void>
  getPaymentsByInstallment: (installmentId: string | number) => InstallmentPayment[]
  getInstallmentStats: (installmentId: string | number) => InstallmentStats
  updateInstallmentStatus: (installmentId: string | number) => void
}

export const InstallmentContext = createContext<InstallmentContextValue | null>(null)

export function InstallmentProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [installments, setInstallments] = useState<Installment[]>([])
  const [payments, setPayments] = useState<InstallmentPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch installments and all payments when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const [instData] = await Promise.all([installmentApi.getAll()])

        // Fetch payments for each installment
        const allPayments: InstallmentPayment[] = []
        for (const inst of instData) {
          const instPayments = await installmentApi.getPayments(inst.id)
          allPayments.push(...instPayments)
        }

        setInstallments(instData)
        setPayments(allPayments)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data cicilan.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated])

  const addInstallment = useCallback(
    async (
      data: Omit<Installment, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
    ): Promise<Installment> => {
      const newInst = await installmentApi.create({
        name: data.name,
        total_price: data.totalPrice,
        down_payment: data.downPayment,
        tenor: data.tenor,
        start_date: data.startDate,
        monthly_amount: data.monthlyAmount,
      })
      setInstallments((prev) => [...prev, newInst])
      return newInst
    },
    [],
  )

  const updateInstallment = useCallback(
    async (id: string | number, updates: Partial<Installment>): Promise<void> => {
      const updated = await installmentApi.update(id, updates)
      setInstallments((prev) => prev.map((inst) => (inst.id === id ? updated : inst)))
    },
    [],
  )

  const deleteInstallment = useCallback(
    async (id: string | number): Promise<void> => {
      await installmentApi.delete(id)
      setPayments((prev) => prev.filter((p) => p.installmentId !== id))
      setInstallments((prev) => prev.filter((inst) => inst.id !== id))
    },
    [],
  )

  const getInstallment = useCallback(
    (id: string | number) => installments.find((inst) => inst.id === id),
    [installments],
  )

  const addPayment = useCallback(
    async (data: {
      installmentId: string | number
      date: string
      amount: number
      description: string
      periodNumber: number
    }): Promise<{ payment: InstallmentPayment; stats: InstallmentStats }> => {
      const installment = installments.find((i) => i.id === data.installmentId)
      if (!installment) throw new Error('Cicilan tidak ditemukan')

      const result = await installmentApi.addPayment(data.installmentId, {
        date: data.date,
        amount: data.amount,
        period_number: data.periodNumber,
        description: data.description,
      })

      setPayments((prev) => [...prev, result.payment])

      // Update installment status if paid off
      if (result.stats.isPaidOff) {
        setInstallments((prev) =>
          prev.map((i) =>
            i.id === data.installmentId ? { ...i, status: 'paid_off' as const } : i,
          ),
        )
      }

      return result
    },
    [installments],
  )

  const deletePayment = useCallback(
    async (id: string | number): Promise<void> => {
      const payment = payments.find((p) => p.id === id)
      await installmentApi.deletePayment(id)

      // Re-check installment status if payment was part of a paid_off installment
      if (payment) {
        const installment = installments.find((i) => i.id === payment.installmentId)
        if (installment && installment.status === 'paid_off') {
          // Fetch updated stats to check if still paid off
          try {
            const stats = await installmentApi.getStats(installment.id)
            if (!stats.isPaidOff) {
              setInstallments((prev) =>
                prev.map((i) => (i.id === installment.id ? { ...i, status: 'active' as const } : i)),
              )
            }
          } catch {
            // ignore
          }
        }
      }

      setPayments((prev) => prev.filter((p) => p.id !== id))
    },
    [payments, installments],
  )

  const getPaymentsByInstallment = useCallback(
    (installmentId: string | number) =>
      payments
        .filter((p) => p.installmentId === installmentId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [payments],
  )

  const getInstallmentStats = useCallback(
    (installmentId: string | number): InstallmentStats => {
      const installment = installments.find((i) => i.id === installmentId)
      if (!installment) {
        return { totalPaid: 0, remaining: 0, paidPercentage: 0, remainingMonths: 0, isPaidOff: false }
      }

      const totalPaid = payments
        .filter((p) => p.installmentId === installmentId)
        .reduce((sum, p) => sum + p.amount, 0)

      const totalOwed = installment.totalPrice - installment.downPayment
      const remaining = Math.max(0, totalOwed - totalPaid)
      const paidPercentage = totalOwed > 0 ? totalPaid / totalOwed : 1
      const remainingMonths = installment.monthlyAmount > 0
        ? Math.ceil(remaining / installment.monthlyAmount)
        : 0
      const isPaidOff = remaining <= 0 || installment.status === 'paid_off'

      return { totalPaid, remaining, paidPercentage, remainingMonths, isPaidOff }
    },
    [installments, payments],
  )

  const updateInstallmentStatus = useCallback(
    (installmentId: string | number) => {
      const stats = getInstallmentStats(installmentId)
      if (stats.isPaidOff) {
        updateInstallment(installmentId, { status: 'paid_off' })
      }
    },
    [getInstallmentStats, updateInstallment],
  )

  const value = useMemo(
    () => ({
      installments,
      payments,
      isLoading,
      error,
      addInstallment,
      updateInstallment,
      deleteInstallment,
      getInstallment,
      addPayment,
      deletePayment,
      getPaymentsByInstallment,
      getInstallmentStats,
      updateInstallmentStatus,
    }),
    [
      installments,
      payments,
      isLoading,
      error,
      addInstallment,
      updateInstallment,
      deleteInstallment,
      getInstallment,
      addPayment,
      deletePayment,
      getPaymentsByInstallment,
      getInstallmentStats,
      updateInstallmentStatus,
    ],
  )

  return <InstallmentContext.Provider value={value}>{children}</InstallmentContext.Provider>
}
