import React, { useState, useEffect, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, formatShortDate } from '../utils/formatters'
import { getTodayISO } from '../utils/helpers'
import { EXPENSE_CATEGORIES } from '../types'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import DatePicker from '../components/common/DatePicker'
import Button from '../components/common/Button'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'

// ─── Expense Category Badge ───────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, BadgeVariant> = {
    Makan: 'warning',
    BBM: 'danger',
    Belanja: 'info',
    Listrik: 'warning',
    Internet: 'info',
    Transportasi: 'default',
    Kesehatan: 'danger',
    Hiburan: 'info',
    Pendidikan: 'info',
    Cicilan: 'default',
    Lainnya: 'default',
  }

  return (
    <Badge variant={colorMap[category] || 'default'}>
      {category}
    </Badge>
  )
}

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

// ─── Checkbox Component ───────────────────────────────────────────────────────

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  )
}

// ─── LaporanPengeluaranPage Component ─────────────────────────────────────────

export default function LaporanPengeluaranPage() {
  const { transactions } = useTransactions()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState(getTodayISO())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(timer)
  }, [])

  // Initialize from date to first day of current month
  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setFromDate(firstDay.toISOString().split('T')[0])
  }, [])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  const selectAllCategories = () => {
    setSelectedCategories(new Set(EXPENSE_CATEGORIES))
  }

  const clearCategories = () => {
    setSelectedCategories(new Set())
  }

  // Filter expenses
  const expenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'pengeluaran')
      .filter((tx) => {
        if (fromDate && tx.date < fromDate) return false
        if (toDate && tx.date > toDate) return false
        return true
      })
      .filter((tx) => {
        if (selectedCategories.size === 0) return true
        return selectedCategories.has(tx.category)
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [transactions, fromDate, toDate, selectedCategories])

  // Group by category
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, typeof expenses> = {}
    for (const exp of expenses) {
      if (!groups[exp.category]) groups[exp.category] = []
      groups[exp.category].push(exp)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [expenses])

  // Total
  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, tx) => sum + tx.amount, 0)
  }, [expenses])

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Laporan Pengeluaran" backTo="/laporan" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <PageHeader title="Laporan Pengeluaran" backTo="/laporan" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Pengeluaran" backTo="/laporan" />

      {/* ─── Filters ──────────────────────────────────────────────────────────── */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Filter</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <DatePicker
            label="Dari Tanggal"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <DatePicker
            label="Sampai Tanggal"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Kategori</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllCategories}
                className="text-xs text-brand-600 hover:underline"
              >
                Pilih Semua
              </button>
              <button
                type="button"
                onClick={clearCategories}
                className="text-xs text-slate-500 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {EXPENSE_CATEGORIES.map((cat) => (
              <Checkbox
                key={cat}
                label={cat}
                checked={selectedCategories.size === 0 || selectedCategories.has(cat)}
                onChange={(checked) => {
                  if (selectedCategories.size === 0) {
                    // If all were implicitly selected, select all except this one
                    const allButOne = new Set(EXPENSE_CATEGORIES.filter((c) => c !== cat))
                    setSelectedCategories(allButOne)
                  } else {
                    toggleCategory(cat)
                  }
                }}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* ─── Summary ──────────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Ringkasan</h3>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {expenses.length} transaksi dalam periode ini
        </p>
      </Card>

      {/* ─── Grouped Expenses ─────────────────────────────────────────────────── */}
      {groupedExpenses.length === 0 ? (
        <Card>
          <p className="text-slate-400 text-sm py-4 text-center">
            Tidak ada pengeluaran dalam periode dan kategori yang dipilih.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedExpenses.map(([category, items]) => {
            const subtotal = items.reduce((s, tx) => s + tx.amount, 0)
            return (
              <Card key={category}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={category} />
                    <span className="text-sm text-slate-500">({items.length} transaksi)</span>
                  </div>
                  <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="pb-2 font-medium">Tanggal</th>
                        <th className="pb-2 font-medium">Kategori</th>
                        <th className="pb-2 font-medium">Jumlah</th>
                        <th className="pb-2 font-medium">Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 text-slate-600 whitespace-nowrap">
                            {formatShortDate(tx.date)}
                          </td>
                          <td className="py-2">
                            <CategoryBadge category={tx.category} />
                          </td>
                          <td className="py-2 font-medium text-red-500">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="py-2 text-slate-600 max-w-xs truncate">
                            {tx.description || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 font-semibold">
                        <td colSpan={2} className="pt-2 text-slate-700">Subtotal {category}</td>
                        <td className="pt-2 text-right text-red-500">{formatCurrency(subtotal)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
