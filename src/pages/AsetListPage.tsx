import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssets } from '../hooks/useAssets'
import { formatCurrency } from '../utils/formatters'
import { getTodayISO, getCurrentYear } from '../utils/helpers'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import DatePicker from '../components/common/DatePicker'
import Modal from '../components/common/Modal'
import StatCard from '../components/common/StatCard'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function AssetIcon() {
  return (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
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

function WarningIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  )
}

function DollarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function BoxesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  )
}

// ─── Asset Form Defaults ──────────────────────────────────────────────────────

const defaultForm = {
  name: '',
  category: '',
  location: '',
  acquisitionValue: '',
  acquisitionDate: getTodayISO(),
  acquisitionYear: String(getCurrentYear()),
  usefulLife: '',
  residualValue: '0',
  description: '',
}

// ─── Form Errors ──────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string
  acquisitionValue?: string
  acquisitionDate?: string
  acquisitionYear?: string
  usefulLife?: string
}

function validateForm(form: typeof defaultForm): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim()) errors.name = 'Nama barang wajib diisi'
  if (!form.acquisitionValue || Number(form.acquisitionValue) <= 0) errors.acquisitionValue = 'Nilai perolehan harus lebih dari 0'
  if (!form.acquisitionDate) errors.acquisitionDate = 'Tanggal perolehan wajib diisi'
  if (!form.acquisitionYear || Number(form.acquisitionYear) < 1900) errors.acquisitionYear = 'Tahun perolehan tidak valid'
  if (!form.usefulLife || Number(form.usefulLife) <= 0) errors.usefulLife = 'Masa manfaat harus lebih dari 0'
  return errors
}

// ─── AsetListPage Component ──────────────────────────────────────────────────

export default function AsetListPage() {
  const navigate = useNavigate()
  const { assets, addAsset, getDepreciationSchedule, getAggregatedData, getAssetsNearEnd } = useAssets()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 150)
    return () => clearTimeout(timer)
  }, [])

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
        await addAsset({
          name: form.name.trim(),
          category: form.category.trim() || undefined,
          location: form.location.trim() || undefined,
          acquisitionValue: Number(form.acquisitionValue),
          acquisitionDate: form.acquisitionDate,
          acquisitionYear: Number(form.acquisitionYear),
          usefulLife: Number(form.usefulLife),
          residualValue: Number(form.residualValue) || 0,
          description: form.description.trim() || undefined,
        })
        setShowModal(false)
        resetForm()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menambah aset')
      } finally {
        setSubmitting(false)
      }
    },
    [form, addAsset, resetForm],
  )

  // Compute aggregated data
  const aggregatedData = getAggregatedData()
  const nearEndAssets = getAssetsNearEnd(1)

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Aset" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <PageHeader title="Aset" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={() => setError(null)}>
            Coba Lagi
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aset"
        action={
          <Button onClick={() => { resetForm(); setShowModal(true) }}>
            <PlusIcon />
            <span className="ml-1.5">Aset Baru</span>
          </Button>
        }
      />

      {/* ─── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Nilai Perolehan"
          value={formatCurrency(aggregatedData.totalAcquisitionValue)}
          icon={<DollarIcon />}
        />
        <StatCard
          title="Total Akumulasi Penyusutan"
          value={formatCurrency(aggregatedData.totalAccumulatedDepreciation)}
          icon={<BoxesIcon />}
        />
        <StatCard
          title="Total Nilai Buku"
          value={formatCurrency(aggregatedData.totalBookValue)}
          icon={<AssetIcon />}
        />
      </div>

      {/* ─── Warning for Assets Near End ──────────────────────────────────────── */}
      {nearEndAssets.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 flex-shrink-0 mt-0.5">
              <WarningIcon />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">Aset Mendekati Akhir Masa Manfaat</h3>
              <p className="text-sm text-amber-700 mt-1">
                {nearEndAssets.length} aset akan segera habis masa manfaatnya:
              </p>
              <ul className="mt-2 space-y-1">
                {nearEndAssets.map((asset) => {
                  const endYear = asset.acquisitionYear + asset.usefulLife - 1
                  return (
                    <li key={asset.id} className="text-sm text-amber-700">
                      - {asset.name} (berakhir {endYear})
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Empty State ──────────────────────────────────────────────────────── */}
      {assets.length === 0 && (
        <EmptyState
          title="Belum Ada Aset"
          description="Tambahkan aset pertama Anda untuk melacak penyusutan aset."
          icon={<AssetIcon />}
          action={
            <Button onClick={() => { resetForm(); setShowModal(true) }}>
              <PlusIcon />
              <span className="ml-1.5">Tambah Aset</span>
            </Button>
          }
        />
      )}

      {/* ─── Asset Grid ───────────────────────────────────────────────────────── */}
      {assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset) => {
            const schedule = getDepreciationSchedule(asset.id)
            const endYear = asset.acquisitionYear + asset.usefulLife - 1
            const currentYear = getCurrentYear()
            const yearsRemaining = Math.max(0, endYear - currentYear + 1)

            return (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">{asset.name}</h3>
                {asset.registerNumber && (
                  <p className="text-xs font-mono text-brand-600 mb-2">{asset.registerNumber}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nilai Perolehan</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(asset.acquisitionValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nilai Buku Saat Ini</span>
                    <span className="font-semibold text-brand-600">
                      {schedule ? formatCurrency(schedule.currentBookValue) : formatCurrency(asset.acquisitionValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Masa Manfaat</span>
                    <span className="text-slate-700">{asset.usefulLife} tahun</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sisa Tahun</span>
                    <span className={`font-medium ${yearsRemaining <= 1 ? 'text-amber-600' : 'text-slate-700'}`}>
                      {yearsRemaining} tahun
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/aset/${asset.id}`) }}>
                    Detail
                  </Button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/aset/${asset.id}`) }}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={(e) => {
                      e.stopPropagation()
                      // Navigate to detail page for delete
                      navigate(`/aset/${asset.id}`)
                    }}>
                      Hapus
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Add Asset Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Tambah Aset Baru" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Barang"
            placeholder="Contoh: Laptop"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={formErrors.name}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kategori"
              placeholder="Contoh: Elektronik"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            />
            <Input
              label="Lokasi"
              placeholder="Contoh: Kantor Pusat"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>
          <Input
            label="Nilai Perolehan"
            type="number"
            placeholder="15000000"
            value={form.acquisitionValue}
            onChange={(e) => handleChange('acquisitionValue', e.target.value)}
            error={formErrors.acquisitionValue}
          />
          <DatePicker
            label="Tanggal Perolehan"
            value={form.acquisitionDate}
            onChange={(e) => handleChange('acquisitionDate', e.target.value)}
            error={formErrors.acquisitionDate}
          />
          <Input
            label="Tahun Perolehan"
            type="number"
            placeholder={String(getCurrentYear())}
            value={form.acquisitionYear}
            onChange={(e) => handleChange('acquisitionYear', e.target.value)}
            error={formErrors.acquisitionYear}
          />
          <Input
            label="Masa Manfaat (tahun)"
            type="number"
            placeholder="5"
            value={form.usefulLife}
            onChange={(e) => handleChange('usefulLife', e.target.value)}
            error={formErrors.usefulLife}
          />
          <Input
            label="Nilai Residu (opsional)"
            type="number"
            placeholder="0"
            value={form.residualValue}
            onChange={(e) => handleChange('residualValue', e.target.value)}
          />
          <Input
            label="Keterangan (opsional)"
            placeholder="Deskripsi aset"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
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
