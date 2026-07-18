import React, { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useFIFO } from '../hooks/useFIFO'
import { useInstallments } from '../hooks/useInstallments'
import { useAssets } from '../hooks/useAssets'
import { formatCurrency, formatShortDate, formatMonth } from '../utils/formatters'
import { getCurrentYear, getCurrentMonth } from '../utils/helpers'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Badge from '../components/common/Badge'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ─── SVG Icon Components ──────────────────────────────────────────────────────

function WalletIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
      />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m0 0 6.75-6.75M12 19.5l-6.75-6.75"
      />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 19.5v-15m0 0-6.75 6.75M12 4.5l6.75 6.75"
      />
    </svg>
  )
}

function InstallmentIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
      />
    </svg>
  )
}

function AssetIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
      />
    </svg>
  )
}

function RecentIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}

// ─── Type Badge Helper ─────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  if (type === 'penerimaan') return <Badge variant="success">Penerimaan</Badge>
  if (type === 'pengeluaran') return <Badge variant="danger">Pengeluaran</Badge>
  if (type === 'saldo_awal') return <Badge variant="info">Saldo Awal</Badge>
  return <Badge>{type}</Badge>
}

// ─── Custom Tooltip for Recharts ──────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className={entry.dataKey === 'penerimaan' ? 'text-green-600' : 'text-red-500'}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ─── DashboardPage Component ──────────────────────────────────────────────────

export default function DashboardPage() {
  const {
    getBalance,
    getMonthlySummaryData,
    getCashflowDataForYear,
    transactions,
  } = useTransactions()
  const { fifoResult } = useFIFO()
  const { installments } = useInstallments()
  const { getAggregatedData } = useAssets()

  const currentYear = getCurrentYear()
  const currentMonth = getCurrentMonth()
  const year = currentYear
  const month = currentMonth

  // Compute data
  const [balance, setBalance] = React.useState<ReturnType<typeof getBalance> | null>(null)
  const [monthlySummary, setMonthlySummary] = React.useState<ReturnType<typeof getMonthlySummaryData> | null>(null)
  const [cashflowData, setCashflowData] = React.useState<ReturnType<typeof getCashflowDataForYear> | null>(null)
  const [aggData, setAggData] = React.useState<ReturnType<typeof getAggregatedData> | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    try {
      const bal = getBalance()
      const monthly = getMonthlySummaryData(year, month)
      const cashflow = getCashflowDataForYear(year)
      const aggregated = getAggregatedData()

      setBalance(bal)
      setMonthlySummary(monthly)
      setCashflowData(cashflow)
      setAggData(aggregated)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data')
      setLoading(false)
    }
  }, [getBalance, getMonthlySummaryData, getCashflowDataForYear, getAggregatedData, year, month, transactions])

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateCmp = b.date.localeCompare(a.date)
        if (dateCmp !== 0) return dateCmp
        return b.createdAt.localeCompare(a.createdAt)
      })
      .slice(0, 5)
  }, [transactions])

  // Active installment count
  const activeInstallmentCount = useMemo(() => {
    return installments.filter((i) => i.status === 'active').length
  }, [installments])

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Saldo"
          value={formatCurrency(balance?.currentBalance ?? 0)}
          icon={<WalletIcon />}
        />
        <StatCard
          title="Penerimaan Bulan Ini"
          value={formatCurrency(monthlySummary?.income ?? 0)}
          icon={<ArrowDownIcon />}
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          value={formatCurrency(monthlySummary?.expenses ?? 0)}
          icon={<ArrowUpIcon />}
        />
        <StatCard
          title="Cicilan Berjalan"
          value={String(activeInstallmentCount)}
          icon={<InstallmentIcon />}
        />
        <StatCard
          title="Nilai Buku Aset"
          value={formatCurrency(aggData?.totalBookValue ?? 0)}
          icon={<AssetIcon />}
        />
      </div>

      {/* ── Cashflow Chart ──────────────────────────────────────────────────── */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Arus Kas {currentYear}
        </h2>
        {cashflowData && cashflowData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickFormatter={(val: number) => formatCurrency(val)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  formatter={(value: string) =>
                    value === 'penerimaan' ? 'Penerimaan' : 'Pengeluaran'
                  }
                />
                <Bar dataKey="penerimaan" fill="#22c55e" name="Penerimaan" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-400 text-sm py-8 text-center">
            Belum ada data arus kas untuk tahun ini.
          </p>
        )}
      </Card>

      {/* ── Monthly Summary Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Penerimaan Bulan Ini */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Penerimaan Bulan Ini
          </h3>
          {monthlySummary && Object.keys(monthlySummary.incomeByCategory).length > 0 ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600 mb-3">
                {formatCurrency(monthlySummary.income)}
              </p>
              <div className="divide-y divide-slate-100">
                {Object.entries(monthlySummary.incomeByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="text-slate-600">{category}</span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-4 text-center">
              Belum ada penerimaan bulan ini.
            </p>
          )}
        </Card>

        {/* Pengeluaran Bulan Ini */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Pengeluaran Bulan Ini
          </h3>
          {monthlySummary && Object.keys(monthlySummary.expensesByCategory).length > 0 ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-500 mb-3">
                {formatCurrency(monthlySummary.expenses)}
              </p>
              <div className="divide-y divide-slate-100">
                {Object.entries(monthlySummary.expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="text-slate-600">{category}</span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-4 text-center">
              Belum ada pengeluaran bulan ini.
            </p>
          )}
        </Card>
      </div>

      {/* ── Recent Transactions ──────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-brand-600">
            <RecentIcon />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Transaksi Terbaru</h2>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 font-medium">Tanggal</th>
                  <th className="pb-2 font-medium">Kategori</th>
                  <th className="pb-2 font-medium">Tipe</th>
                  <th className="pb-2 font-medium text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 text-slate-600 whitespace-nowrap">
                      {formatShortDate(tx.date)}
                    </td>
                    <td className="py-2.5 text-slate-800">{tx.category}</td>
                    <td className="py-2.5">
                      <TypeBadge type={tx.type} />
                    </td>
                    <td
                      className={`py-2.5 text-right font-medium whitespace-nowrap ${
                        tx.type === 'pengeluaran' ? 'text-red-500' : 'text-green-600'
                      }`}
                    >
                      {tx.type === 'pengeluaran' ? '-' : '+'}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm py-4 text-center">
            Belum ada transaksi.
          </p>
        )}
      </Card>
    </div>
  )
}
