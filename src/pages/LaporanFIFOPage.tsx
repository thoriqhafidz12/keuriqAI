import React, { useState, useEffect } from 'react'
import { useFIFO } from '../hooks/useFIFO'
import { formatCurrency, formatShortDate } from '../utils/formatters'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { FundSource } from '../types'

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

// ─── Source Type Badge ─────────────────────────────────────────────────────────

function SourceTypeBadge({ type }: { type: string }) {
  if (type === 'saldo_awal') return <Badge variant="info">Saldo Awal</Badge>
  return <Badge variant="success">Penerimaan</Badge>
}

// ─── LaporanFIFOPage Component ────────────────────────────────────────────────

export default function LaporanFIFOPage() {
  const { fifoResult } = useFIFO()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())

  useEffect(() => {
    setLoading(false)
  }, [fifoResult])

  const toggleExpand = (txId: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev)
      if (next.has(txId)) next.delete(txId)
      else next.add(txId)
      return next
    })
  }

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Laporan FIFO" backTo="/laporan" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <PageHeader title="Laporan FIFO" backTo="/laporan" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan FIFO" backTo="/laporan" />

      {/* ─── Summary Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-slate-500">Total Dana</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(fifoResult.totalAvailable)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Dana Terpakai</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(fifoResult.totalUsed)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Sisa Dana</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(fifoResult.totalBalance)}</p>
        </Card>
      </div>

      {/* ─── Fund Sources Table ──────────────────────────────────────────────── */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Sumber Dana</h2>

        {fifoResult.sources.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">
            Belum ada sumber dana.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 font-medium w-8"></th>
                  <th className="pb-2 font-medium">Sumber Dana</th>
                  <th className="pb-2 font-medium">Tanggal</th>
                  <th className="pb-2 font-medium">Kategori</th>
                  <th className="pb-2 font-medium text-right">Nominal Awal</th>
                  <th className="pb-2 font-medium text-right">Terpakai</th>
                  <th className="pb-2 font-medium text-right">Sisa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fifoResult.sources.map((source) => {
                  const isExpanded = expandedSources.has(source.transactionId)
                  const hasAllocations = source.allocations.length > 0

                  return (
                    <React.Fragment key={source.transactionId}>
                      <tr
                        className={`transition-colors ${
                          hasAllocations ? 'cursor-pointer hover:bg-slate-50' : ''
                        }`}
                        onClick={() => hasAllocations && toggleExpand(source.transactionId)}
                      >
                        <td className="py-2.5">
                          {hasAllocations && (
                            <button className="text-slate-400 hover:text-slate-600">
                              {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                            </button>
                          )}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <SourceTypeBadge type={source.type} />
                            <span className="text-slate-800 font-medium truncate max-w-[150px]">
                              {source.description}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">
                          {formatShortDate(source.date)}
                        </td>
                        <td className="py-2.5 text-slate-700">{source.category}</td>
                        <td className="py-2.5 text-right font-medium text-slate-800">
                          {formatCurrency(source.originalAmount)}
                        </td>
                        <td className="py-2.5 text-right font-medium text-red-500">
                          {source.usedAmount > 0 ? formatCurrency(source.usedAmount) : '-'}
                        </td>
                        <td className="py-2.5 text-right font-semibold whitespace-nowrap">
                          <span className={source.remainingAmount > 0 ? 'text-green-600' : 'text-slate-400'}>
                            {formatCurrency(source.remainingAmount)}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Row: Allocations */}
                      {isExpanded && hasAllocations && (
                        <tr className="bg-slate-50">
                          <td colSpan={7} className="py-2 pl-12 pr-4">
                            <div className="text-xs text-slate-400 mb-1">Alokasi Pengeluaran:</div>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-left text-slate-400 border-b border-slate-200">
                                  <th className="pb-1 font-medium">Tanggal</th>
                                  <th className="pb-1 font-medium">Kategori</th>
                                  <th className="pb-1 font-medium text-right">Jumlah</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {source.allocations.map((alloc, idx) => (
                                  <tr key={idx}>
                                    <td className="py-1 text-slate-600">{formatShortDate(alloc.expenseDate)}</td>
                                    <td className="py-1 text-slate-700">{alloc.expenseCategory}</td>
                                    <td className="py-1 text-right font-medium text-red-500">
                                      {formatCurrency(alloc.amount)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 font-semibold">
                  <td colSpan={4} className="pt-3 text-slate-700">Total</td>
                  <td className="pt-3 text-right text-slate-800">
                    {formatCurrency(fifoResult.totalAvailable)}
                  </td>
                  <td className="pt-3 text-right text-red-500">
                    {formatCurrency(fifoResult.totalUsed)}
                  </td>
                  <td className="pt-3 text-right text-green-600">
                    {formatCurrency(fifoResult.totalBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
