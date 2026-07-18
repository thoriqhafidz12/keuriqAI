import type { Transaction, BalanceResult, MonthlySummary, YearlyMonthSummary } from '../types'
import { isInMonth, isInYear } from './helpers'

/**
 * Calculate the current balance from all transactions.
 */
export function calculateBalance(transactions: Transaction[]): BalanceResult {
  let initialBalance = 0
  let totalIncome = 0
  let totalExpenses = 0

  for (const tx of transactions) {
    switch (tx.type) {
      case 'saldo_awal':
        initialBalance += tx.amount
        break
      case 'penerimaan':
        totalIncome += tx.amount
        break
      case 'pengeluaran':
        totalExpenses += tx.amount
        break
    }
  }

  return {
    initialBalance,
    totalIncome,
    totalExpenses,
    currentBalance: initialBalance + totalIncome - totalExpenses,
  }
}

/**
 * Get monthly summary: totals and category breakdowns for a specific month.
 */
export function getMonthlySummary(
  transactions: Transaction[],
  year: number,
  month: number,
): MonthlySummary {
  const monthTxs = transactions.filter((tx) => isInMonth(tx.date, year, month))

  let income = 0
  let expenses = 0
  const incomeByCategory: Record<string, number> = {}
  const expensesByCategory: Record<string, number> = {}

  for (const tx of monthTxs) {
    if (tx.type === 'penerimaan') {
      income += tx.amount
      incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount
    } else if (tx.type === 'pengeluaran') {
      expenses += tx.amount
      expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.amount
    }
  }

  return {
    income,
    expenses,
    balance: income - expenses,
    incomeByCategory,
    expensesByCategory,
  }
}

/**
 * Get yearly summary: monthly breakdowns for a specific year.
 */
export function getYearlySummary(
  transactions: Transaction[],
  year: number,
): YearlyMonthSummary[] {
  const yearTxs = transactions.filter((tx) => isInYear(tx.date, year))

  const months: YearlyMonthSummary[] = []
  for (let m = 1; m <= 12; m++) {
    const monthTxs = yearTxs.filter((tx) => isInMonth(tx.date, year, m))
    let income = 0
    let expenses = 0
    for (const tx of monthTxs) {
      if (tx.type === 'penerimaan') income += tx.amount
      else if (tx.type === 'pengeluaran') expenses += tx.amount
    }
    months.push({ month: m, income, expenses, balance: income - expenses })
  }
  return months
}

/**
 * Get cashflow data for charting: monthly income vs expense for a given year.
 */
export function getCashflowData(
  transactions: Transaction[],
  year: number,
): { month: string; penerimaan: number; pengeluaran: number }[] {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ]
  const summary = getYearlySummary(transactions, year)
  return summary.map((m) => ({
    month: monthNames[m.month - 1],
    penerimaan: m.income,
    pengeluaran: m.expenses,
  }))
}
