import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInstallments } from '../hooks/useInstallments'
import { formatCurrency } from '../utils/formatters'
import { getTodayISO } from '../utils/helpers'
import type { Installment } from '../types'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Input from '../components/common/Input'
import DatePicker from '../components/common/DatePicker'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function InstallmentIcon() {
  return (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
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

function ArrowRightIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function PayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

// ─── Form Preset ────────────────────────────────────────────────────────────

interface InstallmentForm {
  name: string
  totalPrice: string
  downPayment: string
  tenor: string
  startDate: string
  monthlyAmount: string
}

const defaultForm: InstallmentForm = {
  name: '',
  totalPrice: '',
  downPayment: '',
  tenor: '',
  startDate: getTodayISO(),
  monthlyAmount: '',
}

function installmentToForm(inst: Installment): InstallmentForm {
  return {
    name: inst.name,
    totalPrice: String(inst.totalPrice),
    downPayment: String(inst.downPayment),
    tenor: String(inst.tenor),
    startDate: inst.startDate,
    monthlyAmount: String(inst.monthlyAmount),
  }
}

// ─── Form Validation ────────────────────────────────────────────────────────

interface FormErrors {
  name?: string
  totalPrice?: string
  downPayment?: string
  tenor?: string
  startDate?: string
  monthlyAmount?: string
  payAmount?: string
  payDate?: string
}

function validateForm(form: InstallmentForm): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim()) errors.name = 'Nama cicilan wajib diisi'
  if (!form.totalPrice || Number(form.totalPrice) <= 0) errors.totalPrice = 'Total harga harus lebih dari 0'
  if (!form.tenor || Number(form.tenor) <= 0) errors.tenor = 'Lama cicilan harus lebih dari 0'
  if (!form.startDate) errors.startDate = 'Tanggal mulai wajib diisi'
  if (!form.monthlyAmount || Number(form.monthlyAmount) <= 0) errors.monthlyAmount = 'Nominal cicilan harus lebih dari 0'
  return errors
}

// ─── CicilanListPage Component ──────────────────────────────────────────────

export default function CicilanListPage() {
  const navigate = useNavigate()
  const { installments, addInstallment, updateInstallment, deleteInstallment, addPayment, getInstallmentStats } = useInstallments()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create / Edit modal
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [form, setForm] = useState<InstallmentForm>(defaultForm)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // Pay modal
  const [showPayModal, setShowPayModal] = useState(false)
  const [payTarget, setPayTarget] = useState<Installment | null>(null)
  const [payForm, setPayForm] = useState({ date: getTodayISO(), amount: '' })
  const [payErrors, setPayErrors] = useState<FormErrors>({})
  const [submittingPay, setSubmittingPay] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Installment | null>(null)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 150)
    return () => clearTimeout(timer)
  }, [])

  // ─── Create / Edit handlers ──────────────────────────────────────────────

  const handleChange = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  const openCreate = useCallback(() => {
    setEditingId(null)
    setForm(defaultForm)
    setFormErrors({})
    setShowFormModal(true)
  }, [])

  const openEdit = useCallback((inst: Installment) => {
    setEditingId(inst.id)
    setForm(installmentToForm(inst))
    setFormErrors({})
    setShowFormModal(true)
  }, [])

  const closeFormModal = useCallback(() => {
    setShowFormModal(false)
    setEditingId(null)
    setForm(defaultForm)
    setFormErrors({})
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const errors = validateForm(form)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      setSubmitting(true)
      try {
        const payload = {
          name: form.name.trim(),
          totalPrice: Number(form.totalPrice),
          downPayment: Number(form.downPayment) || 0,
          tenor: Number(form.tenor),
          startDate: form.startDate,
          monthlyAmount: Number(form.monthlyAmount),
        }

        if (editingId) {
          await updateInstallment(editingId, payload)
        } else {
          await addInstallment(payload)
        }
        closeFormModal()
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menyimpan cicilan')
      } finally {
        setSubmitting(false)
      }
    },
    [form, editingId, addInstallment, updateInstallment, closeFormModal],
  )

  // ─── Pay handlers ────────────────────────────────────────────────────────

  const openPay = useCallback((inst: Installment) => {
    setPayTarget(inst)
    setPayForm({ date: getTodayISO(), amount: String(inst.monthlyAmount) })
    setPayErrors({})
    setShowPayModal(true)
  }, [])

  const closePayModal = useCallback(() => {
    setShowPayModal(false)
    setPayTarget(null)
    setPayErrors({})
  }, [])

  const handlePayChange = useCallback((field: string, value: string) => {
    setPayForm((prev) => ({ ...prev, [field]: value }))
    setPayErrors((prev) => ({ ...prev, [field]: '' }))
  }, [])

  const handlePaySubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!payTarget) return

      const errors: FormErrors = {}
      if (!payForm.date) errors.payDate = 'Tanggal wajib diisi'
      if (!payForm.amount || Number(payForm.amount) <= 0) errors.payAmount = 'Jumlah harus lebih dari 0'

      if (Object.keys(errors).length > 0) {
        setPayErrors(errors)
        return
      }

      setSubmittingPay(true)
      try {
        // Find next unpaid period
        const stats = getInstallmentStats(payTarget.id)
        const periodNumber = stats.remainingMonths > 0
          ? payTarget.tenor - stats.remainingMonths + 1
          : 1

        await addPayment({
          installmentId: payTarget.id,
          date: payForm.date,
          amount: Number(payForm.amount),
          description: `Pembayaran cicilan ${payTarget.name}`,
          periodNumber,
        })
        closePayModal()
        setError(null)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal membayar cicilan'
        if (typeof err === 'object' && err !== null && 'response' in err) {
          setError((err as any).response?.data?.message || msg)
        } else {
          setError(msg)
        }
      } finally {
        setSubmittingPay(false)
      }
    },
    [payTarget, payForm, addPayment, getInstallmentStats, closePayModal],
  )

  // ─── Delete handler ──────────────────────────────────────────────────────

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteInstallment(deleteTarget.id)
      setDeleteTarget(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus cicilan')
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleteInstallment])

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Cicilan" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <PageHeader title="Cicilan" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={() => setError(null)}>
            Coba Lagi
          </Button>
        </Card>
      </div>
    )
  }

  // ─── Normal State ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cicilan"
        action={
          <Button onClick={openCreate}>
            <PlusIcon />
            <span className="ml-1.5">Cicilan Baru</span>
          </Button>
        }
      />

      {/* Empty State */}
      {installments.length === 0 && (
        <EmptyState
          title="Belum Ada Cicilan"
          description="Tambahkan cicilan pertama Anda untuk mulai melacak pembayaran cicilan."
          icon={<InstallmentIcon />}
          action={
            <Button onClick={openCreate}>
              <PlusIcon />
              <span className="ml-1.5">Tambah Cicilan</span>
            </Button>
          }
        />
      )}

      {/* Installment Grid */}
      {installments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {installments.map((inst) => {
            const stats = getInstallmentStats(inst.id)
            return (
              <Card key={inst.id} className="hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className="text-lg font-semibold text-slate-800 cursor-pointer hover:text-brand-600 transition-colors"
                    onClick={() => navigate(`/cicilan/${inst.id}`)}
                  >
                    {inst.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={inst.status === 'active' ? 'success' : 'info'}>
                      {inst.status === 'active' ? 'Aktif' : 'Lunas'}
                    </Badge>
                    {inst.status === 'active' && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(inst) }}
                          className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit cicilan"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(inst) }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Hapus cicilan"
                        >
                          <TrashIcon />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cicilan Bulanan</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(inst.monthlyAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tenor</span>
                    <span className="text-slate-700">{inst.tenor} bulan</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{formatCurrency(stats.totalPaid)} / {formatCurrency(inst.totalPrice - inst.downPayment)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stats.isPaidOff ? 'bg-blue-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.min(stats.paidPercentage * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/cicilan/${inst.id}`)}
                    className="flex items-center text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors"
                  >
                    <span>Detail</span>
                    <ArrowRightIcon />
                  </button>
                  {inst.status === 'active' && (
                    <Button size="sm" onClick={(e) => { e.stopPropagation(); openPay(inst) }}>
                      <PayIcon />
                      <span className="ml-1">Bayar</span>
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={showFormModal}
        onClose={closeFormModal}
        title={editingId ? 'Edit Cicilan' : 'Tambah Cicilan Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Cicilan"
            placeholder="Contoh: Cicilan Motor"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={formErrors.name}
          />
          <Input
            label="Total Harga"
            type="number"
            placeholder="10000000"
            value={form.totalPrice}
            onChange={(e) => handleChange('totalPrice', e.target.value)}
            error={formErrors.totalPrice}
          />
          <Input
            label="Uang Muka"
            type="number"
            placeholder="2000000"
            value={form.downPayment}
            onChange={(e) => handleChange('downPayment', e.target.value)}
          />
          <Input
            label="Lama Cicilan (bulan)"
            type="number"
            placeholder="12"
            value={form.tenor}
            onChange={(e) => handleChange('tenor', e.target.value)}
            error={formErrors.tenor}
          />
          <DatePicker
            label="Tanggal Mulai"
            value={form.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={formErrors.startDate}
          />
          <Input
            label="Nominal Cicilan Bulanan"
            type="number"
            placeholder="500000"
            value={form.monthlyAmount}
            onChange={(e) => handleChange('monthlyAmount', e.target.value)}
            error={formErrors.monthlyAmount}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={closeFormModal}>
              Batal
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingId ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Pay Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showPayModal}
        onClose={closePayModal}
        title={`Bayar Cicilan${payTarget ? ` — ${payTarget.name}` : ''}`}
        size="sm"
      >
        <form onSubmit={handlePaySubmit} className="space-y-4">
          {payTarget && (
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Cicilan Bulanan</span>
                <span className="font-medium">{formatCurrency(payTarget.monthlyAmount)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Sisa Hutang</span>
                <span className="font-medium text-red-500">
                  {formatCurrency(getInstallmentStats(payTarget.id).remaining)}
                </span>
              </div>
            </div>
          )}
          <DatePicker
            label="Tanggal Bayar"
            value={payForm.date}
            onChange={(e) => handlePayChange('date', e.target.value)}
            error={payErrors.payDate}
          />
          <Input
            label="Nominal Dibayar"
            type="number"
            placeholder="500000"
            value={payForm.amount}
            onChange={(e) => handlePayChange('amount', e.target.value)}
            error={payErrors.payAmount}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={closePayModal}>Batal</Button>
            <Button type="submit" isLoading={submittingPay}>Bayar</Button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation ──────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Cicilan"
        message={`Apakah Anda yakin ingin menghapus cicilan "${deleteTarget?.name}"? Semua data pembayaran terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        confirmVariant="danger"
      />
    </div>
  )
}
