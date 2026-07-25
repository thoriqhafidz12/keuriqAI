import { useState, useEffect, useMemo } from 'react'
import { useInstallments } from '../hooks/useInstallments'
import { formatCurrency, formatDate } from '../utils/formatters'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'

function formatPercentage(val: number): string {
  return (val * 100).toFixed(1) + '%'
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'active' | 'paid_off' | 'history'

const tabs: { key: Tab; label: string }[] = [
  { key: 'active', label: 'Sedang Berjalan' },
  { key: 'paid_off', label: 'Lunas' },
  { key: 'history', label: 'Riwayat Pembayaran' },
]

// ─── LaporanCicilanPage Component ─────────────────────────────────────────────

export default function LaporanCicilanPage() {
  const { installments, payments, getInstallmentStats } = useInstallments()

  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('active')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 150)
    return () => clearTimeout(timer)
  }, [])

  // Active installments
  const activeInstallments = useMemo(
    () => installments.filter((i) => i.status === 'active'),
    [installments],
  )

  // Paid off installments
  const paidOffInstallments = useMemo(
    () => installments.filter((i) => i.status === 'paid_off'),
    [installments],
  )

  // All payments sorted by date desc
  const allPaymentsSorted = useMemo(() => {
    return [...payments].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [payments])

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Laporan Cicilan" backTo="/laporan" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <PageHeader title="Laporan Cicilan" backTo="/laporan" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Cicilan" backTo="/laporan" />

      {/* ─── Summary Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-slate-500">Total Cicilan</p>
          <p className="text-xl font-bold text-slate-800">{installments.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Sedang Berjalan</p>
          <p className="text-xl font-bold text-green-600">{activeInstallments.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Lunas</p>
          <p className="text-xl font-bold text-blue-600">{paidOffInstallments.length}</p>
        </Card>
      </div>

      {/* ─── Tabs ──────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Active Tab ────────────────────────────────────────────────────────── */}
      {activeTab === 'active' && (
        <>
          {activeInstallments.length === 0 ? (
            <Card>
              <p className="text-slate-400 text-sm py-4 text-center">
                Tidak ada cicilan yang sedang berjalan.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeInstallments.map((inst) => {
                const stats = getInstallmentStats(inst.id)
                return (
                  <Card key={inst.id}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-800">{inst.name}</h3>
                      <Badge variant="success">Aktif</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-slate-500">Cicilan Bulanan</p>
                        <p className="font-semibold text-slate-800">{formatCurrency(inst.monthlyAmount)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Total Harga</p>
                        <p className="font-semibold text-slate-800">{formatCurrency(inst.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Uang Muka</p>
                        <p className="font-semibold text-slate-800">{formatCurrency(inst.downPayment)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Tenor</p>
                        <p className="font-semibold text-slate-800">{inst.tenor} bulan</p>
                      </div>
                    </div>

                    {stats && (
                      <>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Progress</span>
                            <span>{formatPercentage(stats.paidPercentage)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-brand-500 transition-all duration-300"
                              style={{ width: `${Math.min(stats.paidPercentage * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-slate-500">Total Dibayar</p>
                            <p className="font-semibold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Sisa</p>
                            <p className="font-semibold text-red-500">{formatCurrency(stats.remaining)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Sisa Bulan</p>
                            <p className="font-semibold text-slate-800">{stats.remainingMonths} bulan</p>
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ─── Paid Off Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'paid_off' && (
        <>
          {paidOffInstallments.length === 0 ? (
            <Card>
              <p className="text-slate-400 text-sm py-4 text-center">
                Belum ada cicilan yang lunas.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {paidOffInstallments.map((inst) => {
                const stats = getInstallmentStats(inst.id)
                return (
                  <Card key={inst.id}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-800">{inst.name}</h3>
                      <Badge variant="info">Lunas</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Total Harga</p>
                        <p className="font-semibold text-slate-800">{formatCurrency(inst.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Cicilan Bulanan</p>
                        <p className="font-semibold text-slate-800">{formatCurrency(inst.monthlyAmount)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Tenor</p>
                        <p className="font-semibold text-slate-800">{inst.tenor} bulan</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Tanggal Mulai</p>
                        <p className="font-semibold text-slate-800">{formatDate(inst.startDate)}</p>
                      </div>
                    </div>
                    {stats && (
                      <div className="mt-3 text-sm">
                        <p className="text-slate-500">
                          Total Dibayar: <span className="font-semibold text-green-600">{formatCurrency(stats.totalPaid)}</span>
                        </p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ─── Payment History Tab ──────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <>
          {allPaymentsSorted.length === 0 ? (
            <Card>
              <p className="text-slate-400 text-sm py-4 text-center">
                Belum ada riwayat pembayaran.
              </p>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 font-medium">Tanggal</th>
                      <th className="pb-2 font-medium">Cicilan</th>
                      <th className="pb-2 font-medium">Jumlah</th>
                      <th className="pb-2 font-medium">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allPaymentsSorted.map((payment) => {
                      const installment = installments.find((i) => i.id === payment.installmentId)
                      return (
                        <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 text-slate-600 whitespace-nowrap">
                            {formatDate(payment.date)}
                          </td>
                          <td className="py-2.5 font-medium text-slate-800">
                            {installment?.name || 'Unknown'}
                          </td>
                          <td className="py-2.5 font-medium text-green-600">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-2.5 text-slate-600">
                            {payment.description || '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
