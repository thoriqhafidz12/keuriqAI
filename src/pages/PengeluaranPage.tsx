import React, { useState, useMemo, useCallback } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getTodayISO } from '../utils/helpers'
import { EXPENSE_CATEGORIES } from '../types'
import type { Transaction } from '../types'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import DatePicker from '../components/common/DatePicker'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
  )
}

// ─── Category to Badge variant ────────────────────────────────────────────────

function getCategoryVariant(category: string): 'danger' | 'warning' | 'info' | 'default' {
  const essential: string[] = ['Makan', 'BBM', 'Listrik', 'Internet']
  if (essential.includes(category)) return 'danger'
  if (category === 'Kesehatan') return 'warning'
  if (category === 'Pendidikan') return 'info'
  return 'default'
}

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormState {
  date: string
  amount: string
  category: string
  description: string
}

const emptyForm: FormState = {
  date: getTodayISO(),
  amount: '',
  category: EXPENSE_CATEGORIES[0],
  description: '',
}

const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))

// ─── PengeluaranPage Component ────────────────────────────────────────────────

export default function PengeluaranPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions()

  // Transactions filtered by type
  const allPengeluaran = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'pengeluaran')
        .sort((a, b) => {
          const dateCmp = b.date.localeCompare(a.date)
          if (dateCmp !== 0) return dateCmp
          return b.createdAt.localeCompare(a.createdAt)
        }),
    [transactions],
  )

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ ...emptyForm })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ─── Confirm Dialog State ─────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // ─── Filter State ─────────────────────────────────────────────────────────
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // ─── Filtered Transactions ────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return allPengeluaran.filter((tx) => {
      if (filterDateFrom && tx.date < filterDateFrom) return false
      if (filterDateTo && tx.date > filterDateTo) return false
      if (filterCategory && tx.category !== filterCategory) return false
      return true
    })
  }, [allPengeluaran, filterDateFrom, filterDateTo, filterCategory])

  // ─── Modal Handlers ───────────────────────────────────────────────────────
  const openAddModal = useCallback(() => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setFormError(null)
    setIsModalOpen(true)
  }, [])

  const openEditModal = useCallback((tx: Transaction) => {
    setEditingId(tx.id)
    setForm({
      date: tx.date,
      amount: tx.amount.toString(),
      category: tx.category,
      description: tx.description,
    })
    setFormError(null)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormError(null)
  }, [])

  // ─── Delete Handlers ─────────────────────────────────────────────────────
  const openDeleteDialog = useCallback((id: string) => {
    setDeleteTarget(id)
    setIsDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setDeleteTarget(null)
    setIsDeleteDialogOpen(false)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (deleteTarget) {
      await deleteTransaction(deleteTarget)
    }
    setDeleteTarget(null)
    setIsDeleteDialogOpen(false)
  }, [deleteTarget, deleteTransaction])

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    if (!form.date) {
      setFormError('Tanggal harus diisi')
      return false
    }
    const amountNum = parseFloat(form.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Jumlah harus diisi dengan angka positif')
      return false
    }
    if (!form.category) {
      setFormError('Kategori harus dipilih')
      return false
    }
    return true
  }, [form])

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validate()) return

      setIsSubmitting(true)
      setFormError(null)

      try {
        const amountNum = parseFloat(form.amount)

        if (editingId) {
          // Update existing
          await updateTransaction(editingId, {
            date: form.date,
            amount: amountNum,
            category: form.category,
            description: form.description.trim(),
          })
        } else {
          // Create new
          await addTransaction({
            date: form.date,
            type: 'pengeluaran',
            category: form.category,
            amount: amountNum,
            description: form.description.trim(),
          })
        }

        closeModal()
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : 'Gagal menyimpan transaksi',
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, editingId, addTransaction, updateTransaction, closeModal, validate],
  )

  // ─── Filter category options ──────────────────────────────────────────────
  const filterCategoryOptions = useMemo(
    () => [
      { value: '', label: 'Semua Kategori' },
      ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
    ],
    [],
  )

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengeluaran"
        action={
          <Button size="sm" onClick={openAddModal}>
            <span className="flex items-center gap-1.5">
              <PlusIcon />
              Tambah Pengeluaran
            </span>
          </Button>
        }
      />

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <Card className="p-4">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
        >
          <FilterIcon />
          Filter
          <svg
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <DatePicker
              label="Dari Tanggal"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
            <DatePicker
              label="Sampai Tanggal"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
            <Select
              label="Kategori"
              options={filterCategoryOptions}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            />
          </div>
        )}
      </Card>

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <Card key={tx.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm text-slate-500">
                      {formatDate(tx.date)}
                    </span>
                    <Badge variant={getCategoryVariant(tx.category)}>
                      {tx.category}
                    </Badge>
                  </div>
                  {tx.description && (
                    <p className="text-sm text-slate-600 truncate">
                      {tx.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-lg font-bold text-red-500 whitespace-nowrap">
                    -{formatCurrency(tx.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(tx)}
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteDialog(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Hapus"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : allPengeluaran.length === 0 ? (
        /* ── Empty State (no data at all) ────────────────────────────────── */
        <EmptyState
          title="Belum Ada Pengeluaran"
          description="Catat pengeluaran pertama Anda dengan menekan tombol Tambah Pengeluaran."
          action={
            <Button size="sm" onClick={openAddModal}>
              <span className="flex items-center gap-1.5">
                <PlusIcon />
                Tambah Pengeluaran
              </span>
            </Button>
          }
        />
      ) : (
        /* ── Filtered empty state ─────────────────────────────────────────── */
        <EmptyState
          title="Tidak Ada Hasil"
          description="Tidak ada pengeluaran yang sesuai dengan filter yang dipilih."
        />
      )}

      {/* ── Add/Edit Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
              {formError}
            </div>
          )}

          <DatePicker
            label="Tanggal"
            name="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />

          <Input
            label="Jumlah (Rp)"
            name="amount"
            type="number"
            placeholder="Masukkan jumlah"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          />

          <Select
            label="Kategori"
            name="category"
            options={categoryOptions}
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          />

          <Input
            label="Keterangan"
            name="description"
            placeholder="Masukkan keterangan (opsional)"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingId ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Confirm Delete Dialog ──────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Hapus Pengeluaran"
        message="Apakah Anda yakin ingin menghapus pengeluaran ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
      />
    </div>
  )
}
