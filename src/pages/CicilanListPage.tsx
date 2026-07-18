import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInstallments } from '../hooks/useInstallments'
import { formatCurrency } from '../utils/formatters'
import { getTodayISO } from '../utils/helpers'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Input from '../components/common/Input'
import DatePicker from '../components/common/DatePicker'
import Modal from '../components/common/Modal'
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

// ─── Installment Form Defaults ──────────────────────────────────────────────

const defaultForm = {
  name: '',
  totalPrice: '',
  downPayment: '',
  tenor: '',
  startDate: getTodayISO(),
  monthlyAmount: '',
}

// ─── Form Errors ────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string
  totalPrice?: string
  downPayment?: string
  tenor?: string
  startDate?: string
  monthlyAmount?: string
}

function validateForm(form: typeof defaultForm): FormErrors {
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
  const { installments, addInstallment, getInstallmentStats } = useInstallments()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 150)
    return () => clearTimeout(timer)
  }, [])

  // Form handlers
  const handleChange = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  const resetForm = useCallback(() => {
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
        await addInstallment({
          name: form.name.trim(),
          totalPrice: Number(form.totalPrice),
          downPayment: Number(form.downPayment) || 0,
          tenor: Number(form.tenor),
          startDate: form.startDate,
          monthlyAmount: Number(form.monthlyAmount),
        })
        setShowModal(false)
        resetForm()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menambah cicilan')
      } finally {
        setSubmitting(false)
      }
    },
    [form, addInstallment, resetForm],
  )

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Cicilan" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ──────────────────────────────────────────────────────────

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

  // ─── Normal State ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cicilan"
        action={
          <Button onClick={() => { resetForm(); setShowModal(true) }}>
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
            <Button onClick={() => { resetForm(); setShowModal(true) }}>
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
              <Card
                key={inst.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/cicilan/${inst.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800">{inst.name}</h3>
                  <Badge variant={inst.status === 'active' ? 'success' : 'info'}>
                    {inst.status === 'active' ? 'Aktif' : 'Lunas'}
                  </Badge>
                </div>

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

                <div className="mt-3 flex items-center text-sm text-brand-600 font-medium">
                  <span>Detail</span>
                  <ArrowRightIcon />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Add Installment Modal ──────────────────────────────────────────── */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Tambah Cicilan Baru" size="md">
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
            <Button variant="ghost" type="button" onClick={() => { setShowModal(false); resetForm() }}>
              Batal
            </Button>
            <Button type="submit" isLoading={submitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
