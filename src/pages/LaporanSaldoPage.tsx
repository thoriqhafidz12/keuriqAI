import React, { useState, useEffect, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, formatShortDate, formatMonth } from '../utils/formatters'
import { getTodayISO, getCurrentYear, getCurrentMonth } from '../utils/helpers'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import DatePicker from '../components/common/DatePicker'
import Select from '../components/common/Select'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  if (type === 'penerimaan') return <Badge variant="success">Penerimaan</Badge>
  if (type === 'pengeluaran') return <Badge variant="danger">Pengeluaran</Badge>
  if (type === 'saldo_awal') return <Badge variant="info">Saldo Awal</Badge>
  return <Badge>{type}</Badge>
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'daily' | 'monthly' | 'yearly'

const tabs: { key: Tab; label: string }[] = [
  { key: 'daily', label: 'Harian' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'yearly', label: 'Tahunan' },
]

// ─── Month Options ────────────────────────────────────────────────────────────

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: formatMonth(i + 1),
}))

// ─── LaporanSaldoPage Component ──────────────────────────────────────────────

export default function LaporanSaldoPage() {
  const { getBalance, getTransactionsByDateRange, getMonthlySummaryData, getYearlySummaryData, transactions } = useTransactions()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('daily')

  // Daily state
  const [selectedDate, setSelectedDate] = useState(getTodayISO())

  // Monthly state
  const [selectedMonth, setSelectedMonth] = useState(String(getCurrentMonth()))
  const [selectedYearM, setSelectedYearM] = useState(String(getCurrentYear()))

  // Yearly state
  const [selectedYear, setSelectedYear] = useState(String(getCurrentYear()))

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 150)
    return () => clearTimeout(timer)
  }, [])

  const balance = useMemo(() => {
    try {
      return getBalance()
    } catch {
      return null
    }
  }, [getBalance, transactions])

  // Year options
  const yearOptions = useMemo(() => {
    const years = new Set<number>()
    transactions.forEach((tx) => {
      const y = parseInt(tx.date.split('-')[0])
      years.add(y)
    })
    const currentYear = getCurrentYear()
    years.add(currentYear)
    return Array.from(years)
      .sort((a, b) => b - a)
      .map((y) => ({ value: String(y), label: String(y) }))
  }, [transactions])

  // Daily transactions
  const dailyTransactions = useMemo(() => {
    if (activeTab !== 'daily') return []
    try {
      const txs = getTransactionsByDateRange(selectedDate, selectedDate)
      // Sort ascending for balance calculation
      const sorted = [...txs].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.createdAt.localeCompare(b.createdAt)
      })

      // Compute running balance
      let runningBalance = balance?.initialBalance ?? 0
      const withBalance = sorted.map((tx) => {
        if (tx.type === 'penerimaan') runningBalance += tx.amount
        else if (tx.type === 'pengeluaran') runningBalance -= tx.amount
        return { ...tx, balanceAfter: runningBalance }
      })

      return withBalance
    } catch {
      return []
    }
  }, [activeTab, selectedDate, getTransactionsByDateRange, balance])

  // Daily totals
  const dailyTotals = useMemo(() => {
    const income = dailyTransactions
      .filter((tx) => tx.type === 'penerimaan')
      .reduce((sum, tx) => sum + tx.amount, 0)
    const expense = dailyTransactions
      .filter((tx) => tx.type === 'pengeluaran')
      .reduce((sum, tx) => sum + tx.amount, 0)
    return { income, expense }
  }, [dailyTransactions])

  // Monthly summary
  const monthlySummary = useMemo(() => {
    if (activeTab !== 'monthly') return null
    try {
      return getMonthlySummaryData(Number(selectedYearM), Number(selectedMonth))
    } catch {
      return null
    }
  }, [activeTab, selectedMonth, selectedYearM, getMonthlySummaryData])

  // Yearly monthly summaries
  const yearlyData = useMemo(() => {
    if (activeTab !== 'yearly') return []
    try {
      return getYearlySummaryData(Number(selectedYear))
    } catch {
      return []
    }
  }, [activeTab, selectedYear, getYearlySummaryData])

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Laporan Saldo" backTo="/laporan" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <PageHeader title="Laporan Saldo" backTo="/laporan" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button className="text-brand-600 mt-2 text-sm" onClick={() => setError(null)}>
            Coba Lagi
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Saldo" backTo="/laporan" />

      {/* ─── Balance Summary ──────────────────────────────────────────────────── */}
      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-slate-500">Saldo Awal</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(balance.initialBalance)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Total Penerimaan</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(balance.totalIncome)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Total Pengeluaran</p>
            <p className="text-xl font-bold text-red-500">{formatCurrency(balance.totalExpenses)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Saldo Saat Ini</p>
            <p className="text-xl font-bold text-brand-600">{formatCurrency(balance.currentBalance)}</p>
          </Card>
        </div>
      )}

      {/* ─── Tabs ──────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Daily Tab ────────────────────────────────────────────────────────── */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <DatePicker
              label="Pilih Tanggal"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {dailyTransactions.length > 0 ? (
            <>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">Penerimaan: {formatCurrency(dailyTotals.income)}</span>
                <span className="text-red-500">Pengeluaran: {formatCurrency(dailyTotals.expense)}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 font-medium">Tanggal</th>
                      <th className="pb-2 font-medium">Tipe</th>
                      <th className="pb-2 font-medium">Kategori</th>
                      <th className="pb-2 font-medium">Deskripsi</th>
                      <th className="pb-2 font-medium text-right">Jumlah</th>
                      <th className="pb-2 font-medium text-right">Saldo Setelah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">
                          {formatShortDate(tx.date)}
                        </td>
                        <td className="py-2.5">
                          <TypeBadge type={tx.type} />
                        </td>
                        <td className="py-2.5 text-slate-800">{tx.category}</td>
                        <td className="py-2.5 text-slate-600 max-w-xs truncate">
                          {tx.description || '-'}
                        </td>
                        <td className={`py-2.5 text-right font-medium whitespace-nowrap ${
                          tx.type === 'pengeluaran' ? 'text-red-500' : tx.type === 'penerimaan' ? 'text-green-600' : 'text-slate-800'
                        }`}>
                          {tx.type === 'pengeluaran' ? '-' : '+'}
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-slate-800 whitespace-nowrap">
                          {formatCurrency(tx.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <Card>
              <p className="text-slate-400 text-sm py-4 text-center">
                Tidak ada transaksi pada tanggal ini.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ─── Monthly Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-48">
              <Select
                label="Bulan"
                options={monthOptions}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select
                label="Tahun"
                options={yearOptions}
                value={selectedYearM}
                onChange={(e) => setSelectedYearM(e.target.value)}
              />
            </div>
          </div>

          {monthlySummary ? (
            <Card>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Ringkasan {formatMonth(Number(selectedMonth))} {selectedYearM}
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500">Penerimaan</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(monthlySummary.income)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pengeluaran</p>
                  <p className="text-xl font-bold text-red-500">{formatCurrency(monthlySummary.expenses)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Selisih</p>
                  <p className={`text-xl font-bold ${
                    monthlySummary.balance >= 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {formatCurrency(monthlySummary.balance)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(monthlySummary.incomeByCategory).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Penerimaan per Kategori</h4>
                    <div className="divide-y divide-slate-100">
                      {Object.entries(monthlySummary.incomeByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => (
                          <div key={category} className="flex justify-between py-1.5 text-sm">
                            <span className="text-slate-600">{category}</span>
                            <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {Object.keys(monthlySummary.expensesByCategory).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Pengeluaran per Kategori</h4>
                    <div className="divide-y divide-slate-100">
                      {Object.entries(monthlySummary.expensesByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => (
                          <div key={category} className="flex justify-between py-1.5 text-sm">
                            <span className="text-slate-600">{category}</span>
                            <span className="font-medium text-red-500">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-slate-400 text-sm py-4 text-center">
                Tidak ada data untuk bulan ini.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ─── Yearly Tab ───────────────────────────────────────────────────────── */}
      {activeTab === 'yearly' && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <Select
              label="Pilih Tahun"
              options={yearOptions}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            />
          </div>

          {yearlyData.length > 0 && yearlyData.some((m) => m.income > 0 || m.expenses > 0) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 font-medium">Bulan</th>
                    <th className="pb-2 font-medium text-right">Penerimaan</th>
                    <th className="pb-2 font-medium text-right">Pengeluaran</th>
                    <th className="pb-2 font-medium text-right">Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {yearlyData.map((m) => (
                    <tr
                      key={m.month}
                      className={`hover:bg-slate-50 transition-colors ${
                        m.month === getCurrentMonth() && Number(selectedYear) === getCurrentYear() ? 'bg-brand-50' : ''
                      }`}
                    >
                      <td className={`py-2.5 font-medium whitespace-nowrap ${
                        m.month === getCurrentMonth() && Number(selectedYear) === getCurrentYear() ? 'text-brand-700' : 'text-slate-700'
                      }`}>
                        {formatMonth(m.month)}
                      </td>
                      <td className="py-2.5 text-right text-green-600 font-medium">
                        {m.income > 0 ? formatCurrency(m.income) : '-'}
                      </td>
                      <td className="py-2.5 text-right text-red-500 font-medium">
                        {m.expenses > 0 ? formatCurrency(m.expenses) : '-'}
                      </td>
                      <td className={`py-2.5 text-right font-semibold ${
                        m.balance >= 0 ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {formatCurrency(m.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 font-semibold">
                    <td className="pt-3 text-slate-700">Total</td>
                    <td className="pt-3 text-right text-green-600">
                      {formatCurrency(yearlyData.reduce((s, m) => s + m.income, 0))}
                    </td>
                    <td className="pt-3 text-right text-red-500">
                      {formatCurrency(yearlyData.reduce((s, m) => s + m.expenses, 0))}
                    </td>
                    <td className={`pt-3 text-right ${
                      yearlyData.reduce((s, m) => s + m.balance, 0) >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {formatCurrency(yearlyData.reduce((s, m) => s + m.balance, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <Card>
              <p className="text-slate-400 text-sm py-4 text-center">
                Tidak ada data untuk tahun ini.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
