import React, { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getTodayISO } from '../utils/helpers'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import DatePicker from '../components/common/DatePicker'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'

export default function SaldoAwalPage() {
  const { getInitialBalance, addTransaction, updateTransaction } = useTransactions()

  const initialBalance = getInitialBalance()
  const hasInitialBalance = !!initialBalance

  // Form state
  const [date, setDate] = useState(initialBalance?.date ?? getTodayISO())
  const [amount, setAmount] = useState(initialBalance?.amount?.toString() ?? '')
  const [description, setDescription] = useState(initialBalance?.description ?? '')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  // Reset form to initial balance data
  const resetForm = () => {
    setDate(initialBalance?.date ?? getTodayISO())
    setAmount(initialBalance?.amount?.toString() ?? '')
    setDescription(initialBalance?.description ?? '')
    setFormError(null)
  }

  // Open edit modal
  const handleOpenEdit = () => {
    resetForm()
    setIsEditModalOpen(true)
  }

  // Close edit modal
  const handleCloseEdit = () => {
    setIsEditModalOpen(false)
    setFormError(null)
  }

  // Form validation
  const validate = (): boolean => {
    if (!date) {
      setFormError('Tanggal harus diisi')
      return false
    }
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Nominal harus diisi dengan angka positif')
      return false
    }
    if (!description.trim()) {
      setFormError('Keterangan harus diisi')
      return false
    }
    return true
  }

  // Handle submit (create)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setFormError(null)

    try {
      await addTransaction({
        date,
        type: 'saldo_awal',
        category: 'Saldo Awal',
        amount: parseFloat(amount),
        description: description.trim(),
      })

      // Clear form
      setAmount('')
      setDescription('')
      setDate(getTodayISO())
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan saldo awal')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !initialBalance) return

    setIsSubmitting(true)
    setFormError(null)

    try {
      await updateTransaction(initialBalance.id, {
        date,
        amount: parseFloat(amount),
        description: description.trim(),
      })

      setIsEditModalOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal memperbarui saldo awal')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Page Error State ────────────────────────────────────────────────────

  if (pageError) {
    return (
      <div>
        <PageHeader title="Saldo Awal" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{pageError}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setPageError(null)}
          >
            Coba Lagi
          </Button>
        </Card>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader title="Saldo Awal" />

      {hasInitialBalance && !isEditModalOpen ? (
        /* ── Existing Initial Balance Card ────────────────────────────────── */
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Saldo Awal Tersimpan
              </h2>
              <Button variant="secondary" size="sm" onClick={handleOpenEdit}>
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-500">Tanggal</p>
                <p className="font-medium text-slate-800">
                  {formatDate(initialBalance.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Nominal</p>
                <p className="font-medium text-slate-800">
                  {formatCurrency(initialBalance.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Keterangan</p>
                <p className="font-medium text-slate-800">
                  {initialBalance.description || '-'}
                </p>
              </div>
            </div>

            <div className="bg-brand-50 rounded-lg p-4 text-sm text-brand-700">
              <p>
                Saldo awal sudah ditetapkan. Hanya satu saldo awal yang
                diperbolehkan. Anda dapat mengeditnya jika diperlukan.
              </p>
            </div>
          </div>
        </Card>
      ) : hasInitialBalance && isEditModalOpen ? (
        /* ── Edit Form (when editing existing balance) ────────────────────── */
        <>
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Edit Saldo Awal
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
                  {formError}
                </div>
              )}

              <DatePicker
                label="Tanggal"
                name="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <Input
                label="Nominal (Rp)"
                name="amount"
                type="number"
                placeholder="Masukkan nominal saldo awal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <Input
                label="Keterangan"
                name="description"
                placeholder="Masukkan keterangan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleCloseEdit}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Card>
        </>
      ) : (
        /* ── Create Form (no initial balance yet) ─────────────────────────── */
        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Atur Saldo Awal
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Saldo awal adalah saldo pertama yang menjadi dasar pencatatan
            keuangan Anda. Hanya satu saldo awal yang diperbolehkan.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
                {formError}
              </div>
            )}

            <DatePicker
              label="Tanggal"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <Input
              label="Nominal (Rp)"
              name="amount"
              type="number"
              placeholder="Masukkan nominal saldo awal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Input
              label="Keterangan"
              name="description"
              placeholder="Masukkan keterangan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSubmitting}>
                Simpan Saldo Awal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Edit Modal (alternative approach as specified) ──────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        title="Edit Saldo Awal"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
              {formError}
            </div>
          )}

          <DatePicker
            label="Tanggal"
            name="edit-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label="Nominal (Rp)"
            name="edit-amount"
            type="number"
            placeholder="Masukkan nominal saldo awal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            label="Keterangan"
            name="edit-description"
            placeholder="Masukkan keterangan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={handleCloseEdit}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
