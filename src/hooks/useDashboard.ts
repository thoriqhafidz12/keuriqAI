import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useFIFO } from './useFIFO'
import { useInstallments } from './useInstallments'
import { useAssets } from './useAssets'
import { getCurrentYear, getCurrentMonth } from '../utils/helpers'
import { getCashflowData, getMonthlySummary } from '../utils/balance'

export function useDashboard() {
  const { transactions, getBalance } = useTransactions()
  const { fifoResult } = useFIFO()
  const { installments } = useInstallments()
  const { getAggregatedData } = useAssets()

  const year = getCurrentYear()
  const month = getCurrentMonth()

  return useMemo(() => {
    const balance = getBalance()
    const monthlySummary = getMonthlySummary(transactions, year, month)
    const cashflowData = getCashflowData(transactions, year)
    const assetAgg = getAggregatedData()

    const activeInstallments = installments.filter((i) => i.status === 'active')

    // Recent 5 transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        return b.createdAt.localeCompare(a.createdAt)
      })
      .slice(0, 5)

    return {
      balance,
      monthlySummary,
      cashflowData,
      assetAgg,
      activeInstallments,
      activeInstallmentsCount: activeInstallments.length,
      recentTransactions,
      fifoResult,
    }
  }, [transactions, getBalance, fifoResult, installments, getAggregatedData, year, month])
}
