import type { Transaction, FIFOResult, FundSource } from '../types'
import { sortByDate } from './helpers'

/**
 * Compute FIFO (First In, First Out) fund allocation.
 *
 * When expenses occur, funds are consumed from the oldest available source first:
 *   1. Initial balance (saldo_awal)
 *   2. Oldest income (penerimaan) by date
 *
 * This returns a complete breakdown of which fund sources were used for which expenses
 * and how much remains in each source.
 */
export function computeFIFO(transactions: Transaction[]): FIFOResult {
  // Separate transactions by type
  const saldoAwal = transactions.filter((t) => t.type === 'saldo_awal')
  const incomes = transactions.filter((t) => t.type === 'penerimaan')
  const expenses = sortByDate(transactions.filter((t) => t.type === 'pengeluaran'))

  // Build ordered fund sources: saldo_awal first (oldest), then incomes sorted by date
  const fundSources: FundSource[] = []

  // Add saldo_awal entries (sorted oldest first)
  for (const tx of sortByDate(saldoAwal)) {
    fundSources.push({
      transactionId: tx.id,
      type: 'saldo_awal',
      date: tx.date,
      category: 'Saldo Awal',
      description: tx.description,
      originalAmount: tx.amount,
      usedAmount: 0,
      remainingAmount: tx.amount,
      allocations: [],
    })
  }

  // Add income entries (sorted oldest first)
  for (const tx of sortByDate(incomes)) {
    fundSources.push({
      transactionId: tx.id,
      type: 'penerimaan',
      date: tx.date,
      category: tx.category,
      source: tx.source,
      description: tx.description,
      originalAmount: tx.amount,
      usedAmount: 0,
      remainingAmount: tx.amount,
      allocations: [],
    })
  }

  // Process each expense in date order (FIFO: consume oldest funds first)
  for (const expense of expenses) {
    let remainingExpense = expense.amount

    for (const source of fundSources) {
      if (remainingExpense <= 0) break
      if (source.remainingAmount <= 0) continue

      const amountFromSource = Math.min(source.remainingAmount, remainingExpense)

      source.usedAmount += amountFromSource
      source.remainingAmount -= amountFromSource
      source.allocations.push({
        expenseId: expense.id,
        expenseDate: expense.date,
        expenseCategory: expense.category,
        amount: amountFromSource,
      })

      remainingExpense -= amountFromSource
    }
    // If remainingExpense > 0 here, expenses exceed available funds
    // (this is allowed — the balance just goes negative)
  }

  // Calculate totals
  const totalAvailable = fundSources.reduce((sum, s) => sum + s.originalAmount, 0)
  const totalUsed = fundSources.reduce((sum, s) => sum + s.usedAmount, 0)
  const totalBalance = totalAvailable - totalUsed

  return {
    sources: fundSources,
    totalBalance,
    totalAvailable,
    totalUsed,
  }
}

/**
 * Get the current balance breakdown by source.
 * Returns only sources that still have remaining funds.
 */
export function getRemainingBalances(result: FIFOResult): FundSource[] {
  return result.sources.filter((s) => s.remainingAmount > 0)
}

/**
 * Get fund sources that have been partially or fully used.
 */
export function getUsedSources(result: FIFOResult): FundSource[] {
  return result.sources.filter((s) => s.usedAmount > 0)
}
