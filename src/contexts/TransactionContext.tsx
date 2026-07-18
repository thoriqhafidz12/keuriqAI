import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Transaction, BalanceResult, MonthlySummary, YearlyMonthSummary } from '../types'
import { useAuth } from '../hooks/useAuth'
import { transactionApi } from '../api/transactionApi'
import { calculateBalance, getMonthlySummary, getYearlySummary, getCashflowData } from '../utils/balance'

interface TransactionContextValue {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>
  updateTransaction: (id: string | number, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string | number) => Promise<void>
  getTransaction: (id: string | number) => Transaction | undefined
  getInitialBalance: () => Transaction | undefined
  getBalance: () => BalanceResult
  getTransactionsByType: (type: Transaction['type']) => Transaction[]
  getTransactionsByDateRange: (from?: string, to?: string) => Transaction[]
  getMonthlySummaryData: (year: number, month: number) => MonthlySummary
  getYearlySummaryData: (year: number) => YearlyMonthSummary[]
  getCashflowDataForYear: (year: number) => { month: string; penerimaan: number; pengeluaran: number }[]
}

export const TransactionContext = createContext<TransactionContextValue | null>(null)

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch transactions when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const fetchTransactions = async () => {
      try {
        const data = await transactionApi.getAll()
        setTransactions(data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat transaksi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [isAuthenticated])

  const addTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
      const newTx = await transactionApi.create({
        date: data.date,
        type: data.type,
        category: data.category,
        source: data.source,
        amount: data.amount,
        description: data.description,
      })
      setTransactions((prev) => [...prev, newTx])
      return newTx
    },
    [],
  )

  const updateTransaction = useCallback(
    async (id: string | number, updates: Partial<Transaction>): Promise<void> => {
      const updated = await transactionApi.update(id, {
        date: updates.date,
        type: updates.type,
        category: updates.category,
        source: updates.source,
        amount: updates.amount,
        description: updates.description,
      })
      setTransactions((prev) => prev.map((tx) => (tx.id === id ? updated : tx)))
    },
    [],
  )

  const deleteTransaction = useCallback(
    async (id: string | number): Promise<void> => {
      await transactionApi.delete(id)
      setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    },
    [],
  )

  const getTransaction = useCallback(
    (id: string | number) => transactions.find((tx) => tx.id === id),
    [transactions],
  )

  const getInitialBalance = useCallback(
    () => transactions.find((tx) => tx.type === 'saldo_awal'),
    [transactions],
  )

  const getBalance = useCallback(
    () => calculateBalance(transactions),
    [transactions],
  )

  const getTransactionsByType = useCallback(
    (type: Transaction['type']) => transactions.filter((tx) => tx.type === type),
    [transactions],
  )

  const getTransactionsByDateRange = useCallback(
    (from?: string, to?: string) =>
      transactions.filter((tx) => {
        if (from && tx.date < from) return false
        if (to && tx.date > to) return false
        return true
      }),
    [transactions],
  )

  const getMonthlySummaryData = useCallback(
    (year: number, month: number) => getMonthlySummary(transactions, year, month),
    [transactions],
  )

  const getYearlySummaryData = useCallback(
    (year: number) => getYearlySummary(transactions, year),
    [transactions],
  )

  const getCashflowDataForYear = useCallback(
    (year: number) => getCashflowData(transactions, year),
    [transactions],
  )

  const value = useMemo(
    () => ({
      transactions,
      isLoading,
      error,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransaction,
      getInitialBalance,
      getBalance,
      getTransactionsByType,
      getTransactionsByDateRange,
      getMonthlySummaryData,
      getYearlySummaryData,
      getCashflowDataForYear,
    }),
    [
      transactions,
      isLoading,
      error,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransaction,
      getInitialBalance,
      getBalance,
      getTransactionsByType,
      getTransactionsByDateRange,
      getMonthlySummaryData,
      getYearlySummaryData,
      getCashflowDataForYear,
    ],
  )

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
}
