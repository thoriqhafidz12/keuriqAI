import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInstallments } from '../hooks/useInstallments'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getTodayISO } from '../utils/helpers'
import { installmentApi } from '../api/installmentApi'
import type { InstallmentPeriod } from '../types'
import { exportToExcel, printElement } from '../utils/export'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Input from '../components/common/Input'
import DatePicker from '../components/common/DatePicker'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import TabNav from '../components/common/TabNav'
import ExportButtons from '../components/common/ExportButtons'

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatPercentage(val: number): string {
  return (val * 100).toFixed(1) + '%'
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  )
}

// ─── Form Defaults ─────────────────────────────────────────────────────────

interface InstallmentForm {
  name: string
  totalPrice: string
  downPayment: string
  tenor: string
  startDate: string
  monthlyAmount: string
}

function installmentToForm(inst: import('../types').Installment): InstallmentForm {
  return {
    name: inst.name,
    totalPrice: String(inst.totalPrice),
    downPayment: String(inst.downPayment),
    tenor: String(inst.tenor),
    startDate: inst.startDate,
    monthlyAmount: String(inst.monthlyAmount),
  }
}

// ─── CicilanDetailPage Component ───────────────────────────────────────────

export default function CicilanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getInstallment, getPaymentsByInstallment, getInstallmentStats, addPayment, deletePayment, updateInstallment, deleteInstallment } = useInstallments()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [installment, setInstallment] = useState<ReturnType<typeof getInstallment>>(undefined)
  const [payments, setPayments] = useState<ReturnType<typeof getPaymentsByInstallment>>([])
  const [stats, setStats] = useState<ReturnType<typeof getInstallmentStats> | null>(null)
  const [periods, setPeriods] = useState<InstallmentPeriod[]>([])
  const [periodsLoading, setPeriodsLoading] = useState(false)

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<InstallmentPeriod | null>(null)
  const [paymentForm, setPaymentForm] = useState({ date: getTodayISO(), amount: '', description: '' })
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})
  const [submittingPayment, setSubmittingPayment] = useState(false)

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState<InstallmentForm>({ name: '', totalPrice: '', downPayment: '', tenor: '', startDate: '', monthlyAmount: '' })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [submittingEdit, setSubmittingEdit] = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteInstConfirm, setDeleteInstConfirm] = useState(false)

  // Active tab
  const [activeTab, setActiveTab] = useState('periode')

  // Fetch installment data
  const loadInstallment = useCallback(() => {
    if (!id) { setError('ID cicilan tidak ditemukan'); setLoading(false); return }

    try {
      const inst = getInstallment(id)
      if (!inst) { setError('Cicilan tidak ditemukan'); setLoading(false); return }

      setInstallment(inst)
      setPayments(getPaymentsByInstallment(id))
      setStats(getInstallmentStats(id))
      setPaymentForm({ date: getTodayISO(), amount: String(inst.monthlyAmount), description: '' })
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setLoading(false)
    }
  }, [id, getInstallment, getPaymentsByInstallment, getInstallmentStats])

  useEffect(() => {
    loadInstallment()
  }, [loadInstallment])

  // Fetch periods when tab selected or after payment
  const fetchPeriods = useCallback(async () => {
    if (!id) return
    setPeriodsLoading(true)
    try {
      const data = await installmentApi.getPeriods(id)
      setPeriods(data)
    } catch {
      // ignore
    } finally {
      setPeriodsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (activeTab === 'periode' && id) {
      fetchPeriods()
    }
  }, [activeTab, id, fetchPeriods])

  // Refresh all data after payment
  const refreshData = useCallback(() => {
    if (!id) return
    setPayments(getPaymentsByInstallment(id))
    setStats(getInstallmentStats(id))
    fetchPeriods()
  }, [id, getPaymentsByInstallment, getInstallmentStats, fetchPeriods])

  const handlePayPeriod = useCallback((period: InstallmentPeriod) => {
    setSelectedPeriod(period)
    setPaymentForm({
      date: getTodayISO(),
      amount: String(period.amount),
      description: `Pembayaran bulan ke-${period.periodNumber}`,
    })
    setPaymentErrors({})
    setShowPaymentModal(true)
  }, [])

  const handlePaymentChange = useCallback((field: string, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }))
    setPaymentErrors((prev) => ({ ...prev, [field]: '' }))
  }, [])

  const resetPaymentModal = useCallback(() => {
    setShowPaymentModal(false)
    setSelectedPeriod(null)
    const amt = installment?.monthlyAmount ?? 0
    setPaymentForm({ date: getTodayISO(), amount: String(amt), description: '' })
    setPaymentErrors({})
  }, [installment])

  const handleAddPayment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!id || !installment || !selectedPeriod) return

      const errors: Record<string, string> = {}
      if (!paymentForm.date) errors.date = 'Tanggal wajib diisi'
      if (!paymentForm.amount || Number(paymentForm.amount) <= 0) errors.amount = 'Jumlah harus lebih dari 0'

      if (Object.keys(errors).length > 0) { setPaymentErrors(errors); return }

      setSubmittingPayment(true)
      try {
        await addPayment({
          installmentId: id,
          periodNumber: selectedPeriod.periodNumber,
          date: paymentForm.date,
          amount: Number(paymentForm.amount),
          description: paymentForm.description,
        })
        resetPaymentModal()
        refreshData()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal menambah pembayaran'
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const resp = (err as any).response
          if (resp?.data?.message) {
            setError(resp.data.message)
          } else {
            setError(msg)
          }
        } else {
          setError(msg)
        }
      } finally {
        setSubmittingPayment(false)
      }
    },
    [id, installment, selectedPeriod, paymentForm, addPayment, resetPaymentModal, refreshData],
  )

  const handleDeletePayment = useCallback(
    async (paymentId: string) => {
      if (!id) return
      try {
        await deletePayment(paymentId)
        refreshData()
        setDeleteTarget(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menghapus pembayaran')
      }
    },
    [id, deletePayment, refreshData],
  )

  // ─── Edit handlers ──────────────────────────────────────────────────────

  const openEdit = useCallback(() => {
    if (!installment) return
    setEditForm(installmentToForm(installment))
    setEditErrors({})
    setShowEditModal(true)
  }, [installment])

  const handleEditChange = useCallback((field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
    setEditErrors((prev) => ({ ...prev, [field]: '' }))
  }, [])

  const handleEditSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!id || !installment) return

      const errors: Record<string, string> = {}
      if (!editForm.name.trim()) errors.name = 'Nama wajib diisi'
      if (!editForm.totalPrice || Number(editForm.totalPrice) <= 0) errors.totalPrice = 'Total harga harus lebih dari 0'
      if (!editForm.tenor || Number(editForm.tenor) <= 0) errors.tenor = 'Tenor harus lebih dari 0'
      if (!editForm.startDate) errors.startDate = 'Tanggal mulai wajib diisi'
      if (!editForm.monthlyAmount || Number(editForm.monthlyAmount) <= 0) errors.monthlyAmount = 'Nominal cicilan harus lebih dari 0'

      if (Object.keys(errors).length > 0) { setEditErrors(errors); return }

      setSubmittingEdit(true)
      try {
        await updateInstallment(id, {
          name: editForm.name.trim(),
          totalPrice: Number(editForm.totalPrice),
          downPayment: Number(editForm.downPayment) || 0,
          tenor: Number(editForm.tenor),
          startDate: editForm.startDate,
          monthlyAmount: Number(editForm.monthlyAmount),
        })
        setShowEditModal(false)
        loadInstallment()
        refreshData()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengupdate cicilan')
      } finally {
        setSubmittingEdit(false)
      }
    },
    [id, installment, editForm, updateInstallment, loadInstallment, refreshData],
  )

  // ─── Delete installment handler ──────────────────────────────────────────

  const handleDeleteInstallment = useCallback(async () => {
    if (!id) return
    try {
      await deleteInstallment(id)
      navigate('/cicilan')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus cicilan')
      setDeleteInstConfirm(false)
    }
  }, [id, deleteInstallment, navigate])

  // Report exports
  const handlePrintReport = useCallback(() => {
    printElement('cicilan-report-content', `Laporan Cicilan - ${installment?.name}`)
  }, [installment])

  const handleExcelReport = useCallback(() => {
    if (!installment) return
    const rows = periods.map((p) => ({
      'Periode': `Bulan ${p.periodNumber}`,
      'Jatuh Tempo': p.dueDate,
      'Nominal': p.amount,
      'Status': p.status === 'paid' ? 'Lunas' : 'Belum Dibayar',
      'Tanggal Bayar': p.payment?.date || '-',
      'Jumlah Dibayar': p.payment?.amount || '-',
    }))
    exportToExcel(rows, `laporan-cicilan-${installment.name}`)
  }, [installment, periods])

  const TABS = [
    { key: 'periode', label: 'Periode' },
    { key: 'informasi', label: 'Informasi' },
    { key: 'laporan', label: 'Laporan' },
  ]

  // ─── Loading / Error States ─────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Detail Cicilan" backTo="/cicilan" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  if (error || !installment) {
    return (
      <div>
        <PageHeader title="Detail Cicilan" backTo="/cicilan" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error || 'Cicilan tidak ditemukan'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => { setError(null); navigate('/cicilan') }}>
            Kembali ke Daftar Cicilan
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={installment.name}
        backTo="/cicilan"
        action={
          <div className="flex items-center gap-2">
            {installment.status === 'active' && (
              <>
                <Button variant="secondary" size="sm" onClick={openEdit}>
                  <EditIcon />
                  <span className="ml-1.5 hidden sm:inline">Edit</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setDeleteInstConfirm(true)} className="text-red-500 hover:text-red-700">
                  <TrashIcon />
                  <span className="ml-1.5 hidden sm:inline">Hapus</span>
                </Button>
              </>
            )}
            <Button onClick={() => {
              const firstUnpaid = periods.find(p => p.status === 'unpaid')
              if (firstUnpaid) handlePayPeriod(firstUnpaid)
              else {
                setSelectedPeriod(null)
                setPaymentForm({ date: getTodayISO(), amount: String(installment.monthlyAmount), description: '' })
                setShowPaymentModal(true)
              }
            }}>
              <PlusIcon />
              <span className="ml-1.5">Bayar Cicilan</span>
            </Button>
          </div>
        }
      />

      {/* ─── Progress Summary (always visible) ──────────────────────────── */}
      {stats && (
        <Card>
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Progress Pembayaran</h2>
            <Badge variant={installment.status === 'active' ? 'success' : 'info'}>
              {installment.status === 'active' ? 'Aktif' : 'Lunas'}
            </Badge>
          </div>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-500 mb-1">
              <span>Progress</span>
              <span>{formatPercentage(stats.paidPercentage)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${stats.isPaidOff ? 'bg-blue-500' : 'bg-brand-500'}`}
                style={{ width: `${Math.min(stats.paidPercentage * 100, 100)}%` }}
              />
            </div>
          </div>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Total Dibayar</p>
              <p className="font-semibold text-green-600">{formatCurrency(stats.totalPaid)}</p>
            </div>
            <div>
              <p className="text-slate-500">Sisa</p>
              <p className="font-semibold text-red-500">{formatCurrency(stats.remaining)}</p>
            </div>
            <div>
              <p className="text-slate-500">Persentase</p>
              <p className="font-semibold text-slate-800">{formatPercentage(stats.paidPercentage)}</p>
            </div>
            <div>
              <p className="text-slate-500">Sisa Bulan</p>
              <p className="font-semibold text-slate-800">{stats.remainingMonths} bulan</p>
            </div>
          </div>
        </Card>
      )}

      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── Tab: Periode ──────────────────────────────────────────────── */}
      {activeTab === 'periode' && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Daftar Periode Cicilan</h2>

          {periodsLoading ? (
            <LoadingSpinner size="sm" className="py-8" />
          ) : periods.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">Tidak ada data periode.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 font-medium">Periode</th>
                    <th className="pb-2 font-medium">Jatuh Tempo</th>
                    <th className="pb-2 font-medium">Nominal</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Tgl Bayar</th>
                    <th className="pb-2 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periods.map((period) => (
                    <tr
                      key={period.periodNumber}
                      className={`transition-colors ${
                        period.status === 'paid' ? 'bg-green-50/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 font-medium text-slate-800">
                        Bulan {period.periodNumber}
                      </td>
                      <td className="py-2.5 text-slate-600">{formatDate(period.dueDate)}</td>
                      <td className="py-2.5 text-slate-700">{formatCurrency(period.amount)}</td>
                      <td className="py-2.5">
                        <Badge variant={period.status === 'paid' ? 'success' : 'warning'}>
                          {period.status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {period.payment ? formatDate(period.payment.date) : '-'}
                      </td>
                      <td className="py-2.5 text-right">
                        {period.status === 'unpaid' && installment.status === 'active' ? (
                          <Button size="sm" onClick={() => handlePayPeriod(period)}>
                            Bayar
                          </Button>
                        ) : period.payment ? (
                          <span className="text-xs text-slate-400">
                            {formatCurrency(period.payment.amount)}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ─── Tab: Informasi ────────────────────────────────────────────── */}
      {activeTab === 'informasi' && (
        <>
          <Card>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Informasi Cicilan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Total Harga</p>
                <p className="font-semibold text-slate-800">{formatCurrency(installment.totalPrice)}</p>
              </div>
              <div>
                <p className="text-slate-500">Uang Muka</p>
                <p className="font-semibold text-slate-800">{formatCurrency(installment.downPayment)}</p>
              </div>
              <div>
                <p className="text-slate-500">Tenor</p>
                <p className="font-semibold text-slate-800">{installment.tenor} bulan</p>
              </div>
              <div>
                <p className="text-slate-500">Cicilan Bulanan</p>
                <p className="font-semibold text-slate-800">{formatCurrency(installment.monthlyAmount)}</p>
              </div>
              <div>
                <p className="text-slate-500">Tanggal Mulai</p>
                <p className="font-semibold text-slate-800">{formatDate(installment.startDate)}</p>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Riwayat Pembayaran</h2>
            {payments.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">Belum ada pembayaran cicilan.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 font-medium">Periode</th>
                      <th className="pb-2 font-medium">Tanggal</th>
                      <th className="pb-2 font-medium">Jumlah</th>
                      <th className="pb-2 font-medium">Deskripsi</th>
                      <th className="pb-2 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 text-slate-600">
                          {payment.periodNumber ? `Bulan ${payment.periodNumber}` : '-'}
                        </td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">{formatDate(payment.date)}</td>
                        <td className="py-2.5 font-medium text-slate-800">{formatCurrency(payment.amount)}</td>
                        <td className="py-2.5 text-slate-600">{payment.description || '-'}</td>
                        <td className="py-2.5 text-right">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => setDeleteTarget(String(payment.id))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* ─── Tab: Laporan ──────────────────────────────────────────────── */}
      {activeTab === 'laporan' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Laporan Cicilan</h2>
            <ExportButtons
              onPdf={handlePrintReport}
              onExcel={handleExcelReport}
              onPrint={handlePrintReport}
            />
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Ringkasan pembayaran cicilan seluruh periode.
          </p>

          <div id="cicilan-report-content">
            <div className="border rounded-lg p-4 bg-slate-50 mb-4">
              <h3 className="font-semibold text-slate-800 mb-2">{installment.name}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><span className="text-slate-500">Total Harga:</span> <span className="font-medium">{formatCurrency(installment.totalPrice)}</span></div>
                <div><span className="text-slate-500">Uang Muka:</span> <span className="font-medium">{formatCurrency(installment.downPayment)}</span></div>
                <div><span className="text-slate-500">Tenor:</span> <span className="font-medium">{installment.tenor} bulan</span></div>
                <div><span className="text-slate-500">Cicilan/Bulan:</span> <span className="font-medium">{formatCurrency(installment.monthlyAmount)}</span></div>
                <div><span className="text-slate-500">Mulai:</span> <span className="font-medium">{formatDate(installment.startDate)}</span></div>
                <div><span className="text-slate-500">Status:</span> <span className="font-medium">{installment.status === 'active' ? 'Aktif' : 'Lunas'}</span></div>
              </div>
            </div>

            {periods.length > 0 && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-1 font-medium">Periode</th>
                    <th className="pb-1 font-medium">Jatuh Tempo</th>
                    <th className="pb-1 font-medium">Nominal</th>
                    <th className="pb-1 font-medium">Status</th>
                    <th className="pb-1 font-medium">Tgl Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periods.map((p) => (
                    <tr key={p.periodNumber}>
                      <td className="py-1">Bulan {p.periodNumber}</td>
                      <td className="py-1">{p.dueDate}</td>
                      <td className="py-1">{formatCurrency(p.amount)}</td>
                      <td className="py-1">{p.status === 'paid' ? 'Lunas' : 'Belum Dibayar'}</td>
                      <td className="py-1">{p.payment?.date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* ─── Payment Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={showPaymentModal}
        onClose={resetPaymentModal}
        title={selectedPeriod ? `Bayar Periode ke-${selectedPeriod.periodNumber}` : 'Bayar Cicilan'}
        size="sm"
      >
        <form onSubmit={handleAddPayment} className="space-y-4">
          {selectedPeriod && (
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Periode</span>
                <span className="font-medium">Bulan {selectedPeriod.periodNumber}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Jatuh Tempo</span>
                <span>{formatDate(selectedPeriod.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal Cicilan</span>
                <span className="font-medium">{formatCurrency(selectedPeriod.amount)}</span>
              </div>
            </div>
          )}
          <DatePicker
            label="Tanggal Bayar"
            value={paymentForm.date}
            onChange={(e) => handlePaymentChange('date', e.target.value)}
            error={paymentErrors.date}
          />
          <Input
            label="Nominal Dibayar"
            type="number"
            placeholder="500000"
            value={paymentForm.amount}
            onChange={(e) => handlePaymentChange('amount', e.target.value)}
            error={paymentErrors.amount}
          />
          <Input
            label="Keterangan (opsional)"
            placeholder="Pembayaran..."
            value={paymentForm.description}
            onChange={(e) => handlePaymentChange('description', e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={resetPaymentModal}>Batal</Button>
            <Button type="submit" isLoading={submittingPayment}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Cicilan"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nama Cicilan"
            placeholder="Contoh: Cicilan Motor"
            value={editForm.name}
            onChange={(e) => handleEditChange('name', e.target.value)}
            error={editErrors.name}
          />
          <Input
            label="Total Harga"
            type="number"
            placeholder="10000000"
            value={editForm.totalPrice}
            onChange={(e) => handleEditChange('totalPrice', e.target.value)}
            error={editErrors.totalPrice}
          />
          <Input
            label="Uang Muka"
            type="number"
            placeholder="2000000"
            value={editForm.downPayment}
            onChange={(e) => handleEditChange('downPayment', e.target.value)}
          />
          <Input
            label="Lama Cicilan (bulan)"
            type="number"
            placeholder="12"
            value={editForm.tenor}
            onChange={(e) => handleEditChange('tenor', e.target.value)}
            error={editErrors.tenor}
          />
          <DatePicker
            label="Tanggal Mulai"
            value={editForm.startDate}
            onChange={(e) => handleEditChange('startDate', e.target.value)}
            error={editErrors.startDate}
          />
          <Input
            label="Nominal Cicilan Bulanan"
            type="number"
            placeholder="500000"
            value={editForm.monthlyAmount}
            onChange={(e) => handleEditChange('monthlyAmount', e.target.value)}
            error={editErrors.monthlyAmount}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowEditModal(false)}>Batal</Button>
            <Button type="submit" isLoading={submittingEdit}>Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Payment Confirmation ─────────────────────────────────── */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeletePayment(deleteTarget)}
        title="Hapus Pembayaran"
        message="Apakah Anda yakin ingin menghapus pembayaran ini? Transaksi pengeluaran terkait juga akan dihapus."
        confirmLabel="Hapus"
        confirmVariant="danger"
      />

      {/* ─── Delete Installment Confirmation ─────────────────────────────── */}
      <ConfirmDialog
        isOpen={deleteInstConfirm}
        onClose={() => setDeleteInstConfirm(false)}
        onConfirm={handleDeleteInstallment}
        title="Hapus Cicilan"
        message={`Apakah Anda yakin ingin menghapus cicilan "${installment.name}"? Semua pembayaran dan transaksi pengeluaran terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        confirmVariant="danger"
      />
    </div>
  )
}
