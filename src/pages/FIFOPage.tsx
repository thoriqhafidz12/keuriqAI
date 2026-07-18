import React, { useState, useMemo } from 'react'
import { useFIFO } from '../hooks/useFIFO'
import { formatCurrency, formatDate } from '../utils/formatters'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Badge from '../components/common/Badge'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import type { FundSource } from '../types'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function WalletIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
    </svg>
  )
}

function TrendingUpIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  )
}

function TrendingDownIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281M21.5 8.5l-2.28 5.941" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────

function SourceTypeBadge({ type }: { type: FundSource['type'] }) {
  if (type === 'saldo_awal') return <Badge variant="info">Saldo Awal</Badge>
  return <Badge variant="success">Penerimaan</Badge>
}

// ─── Progress bar for fund usage ──────────────────────────────────────────────

function UsageBar({ used, total }: { used: number; total: number }) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0
  const barColor =
    percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-10 text-right font-medium">
        {Math.round(percentage)}%
      </span>
    </div>
  )
}

// ─── FundSourceRow Component (expandable) ─────────────────────────────────────

function FundSourceRow({ source }: { source: FundSource }) {
  const [expanded, setExpanded] = useState(false)

  const hasAllocations = source.allocations && source.allocations.length > 0

  return (
    <Card className="p-4 overflow-hidden">
      {/* Main row */}
      <div className="flex flex-col gap-3">
        {/* Header: type badge + date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SourceTypeBadge type={source.type} />
            <span className="text-sm text-slate-500">{formatDate(source.date)}</span>
            <span className="text-sm text-slate-400">|</span>
            <span className="text-sm text-slate-600">{source.category}</span>
            {source.source && (
              <>
                <span className="text-sm text-slate-400">|</span>
                <span className="text-sm text-slate-500">{source.source}</span>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {source.description && (
          <p className="text-sm text-slate-600">{source.description}</p>
        )}

        {/* Amount columns */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Nilai Awal</p>
            <p className="font-semibold text-slate-800">
              {formatCurrency(source.originalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Terpakai</p>
            <p className="font-semibold text-red-500">
              {formatCurrency(source.usedAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Sisa</p>
            <p
              className={`font-semibold ${
                source.remainingAmount > 0 ? 'text-green-600' : 'text-slate-400'
              }`}
            >
              {formatCurrency(source.remainingAmount)}
            </p>
          </div>
        </div>

        {/* Usage progress bar */}
        <UsageBar used={source.usedAmount} total={source.originalAmount} />

        {/* Expand allocations toggle */}
        {hasAllocations && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
              Alokasi Pengeluaran ({source.allocations.length})
            </button>
          </div>
        )}
      </div>

      {/* Expanded allocations */}
      {expanded && hasAllocations && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 font-medium px-3">
              <div className="col-span-3">Tanggal</div>
              <div className="col-span-3">Kategori</div>
              <div className="col-span-6 text-right">Jumlah</div>
            </div>
            {source.allocations.map((alloc, idx) => (
              <div
                key={`${alloc.expenseId}-${idx}`}
                className="grid grid-cols-12 gap-2 text-sm bg-slate-50 rounded-lg px-3 py-2"
              >
                <div className="col-span-3 text-slate-600">
                  {formatDate(alloc.expenseDate)}
                </div>
                <div className="col-span-3 text-slate-800">
                  {alloc.expenseCategory}
                </div>
                <div className="col-span-6 text-right font-medium text-red-500">
                  {formatCurrency(alloc.amount)}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-12 gap-2 text-sm px-3 pt-1">
              <div className="col-span-6 font-medium text-slate-700">Total Terpakai</div>
              <div className="col-span-6 text-right font-bold text-red-500">
                {formatCurrency(source.usedAmount)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── FIFOPage Component ───────────────────────────────────────────────────────

export default function FIFOPage() {
  const { fifoResult } = useFIFO()

  const [sources, setSources] = useState<FundSource[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [totalAvailable, setTotalAvailable] = useState(0)
  const [totalUsed, setTotalUsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  React.useEffect(() => {
    try {
      setSources(fifoResult.sources)
      setTotalBalance(fifoResult.totalBalance)
      setTotalAvailable(fifoResult.totalAvailable)
      setTotalUsed(fifoResult.totalUsed)
      setLoading(false)
    } catch (err) {
      setPageError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data FIFO',
      )
      setLoading(false)
    }
  }, [fifoResult])

  // Sources with remaining amount > 0
  const remainingSources = useMemo(
    () => sources.filter((s) => s.remainingAmount > 0),
    [sources],
  )

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Dana (FIFO)" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────────

  if (pageError) {
    return (
      <div>
        <PageHeader title="Dana (FIFO)" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{pageError}</p>
        </Card>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader title="Dana (FIFO)" />

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Dana Tersedia"
          value={formatCurrency(totalAvailable)}
          icon={<WalletIcon />}
        />
        <StatCard
          title="Total Dana Terpakai"
          value={formatCurrency(totalUsed)}
          icon={<TrendingUpIcon />}
        />
        <StatCard
          title="Sisa Saldo"
          value={formatCurrency(totalBalance)}
          icon={<TrendingDownIcon />}
        />
      </div>

      {/* ── FIFO Explanation Card ────────────────────────────────────────────── */}
      <Card className="p-4 bg-brand-50 border-brand-200">
        <div className="flex items-start gap-3">
          <div className="text-brand-600 mt-0.5">
            <InfoIcon />
          </div>
          <div className="text-sm text-brand-800">
            <p className="font-medium mb-1">
              Metode First-In, First-Out (FIFO)
            </p>
            <p>
              Dana yang masuk pertama akan digunakan pertama kali untuk membiayai
              pengeluaran. Sistem menelusuri sumber dana dari saldo awal dan
              penerimaan, lalu mengalokasikannya secara berurutan ke setiap
              pengeluaran.
            </p>
          </div>
        </div>
      </Card>

      {/* ── All Fund Sources ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Sumber Dana ({sources.length})
        </h2>

        {sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map((source) => (
              <FundSourceRow key={source.transactionId} source={source} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum Ada Sumber Dana"
            description="Sumber dana akan muncul setelah Anda mencatat penerimaan atau saldo awal."
            icon={
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
                />
              </svg>
            }
          />
        )}
      </div>

      {/* ── Remaining Balance Section ────────────────────────────────────────── */}
      {remainingSources.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Sisa Saldo per Sumber Dana
          </h2>

          <Card className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-3 font-medium">Tipe</th>
                    <th className="pb-3 font-medium">Tanggal</th>
                    <th className="pb-3 font-medium">Kategori</th>
                    <th className="pb-3 font-medium">Keterangan</th>
                    <th className="pb-3 font-medium text-right">Sisa Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {remainingSources.map((source) => (
                    <tr key={source.transactionId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <SourceTypeBadge type={source.type} />
                      </td>
                      <td className="py-3 text-slate-600 whitespace-nowrap">
                        {formatDate(source.date)}
                      </td>
                      <td className="py-3 text-slate-800">{source.category}</td>
                      <td className="py-3 text-slate-500 max-w-xs truncate">
                        {source.description || '-'}
                      </td>
                      <td className="py-3 text-right font-semibold text-green-600 whitespace-nowrap">
                        {formatCurrency(source.remainingAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200">
                    <td colSpan={4} className="py-3 text-sm font-semibold text-slate-700 text-right">
                      Total Sisa Saldo
                    </td>
                    <td className="py-3 text-right font-bold text-green-600 whitespace-nowrap">
                      {formatCurrency(
                        remainingSources.reduce((sum, s) => sum + s.remainingAmount, 0),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
