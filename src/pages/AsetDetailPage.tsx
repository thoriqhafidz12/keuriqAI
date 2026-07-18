import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAssets } from '../hooks/useAssets'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getCurrentYear } from '../utils/helpers'
import { assetApi } from '../api/assetApi'
import type { AssetChange } from '../types'
import { exportToExcel, printElement } from '../utils/export'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import DatePicker from '../components/common/DatePicker'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import TabNav from '../components/common/TabNav'
import ExportButtons from '../components/common/ExportButtons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

// ─── Custom Chart Tooltip ───────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">Tahun {label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-brand-600">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ─── AsetDetailPage Component ────────────────────────────────────────────────

export default function AsetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getAsset, getDepreciationSchedule, updateAsset, deleteAsset } = useAssets()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [asset, setAsset] = useState<ReturnType<typeof getAsset>>(undefined)
  const [schedule, setSchedule] = useState<ReturnType<typeof getDepreciationSchedule>>(undefined)
  const [activeTab, setActiveTab] = useState('informasi')

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [submittingEdit, setSubmittingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '', category: '', location: '', acquisitionValue: '',
    acquisitionDate: '', acquisitionYear: '', usefulLife: '', residualValue: '', description: '',
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  // History state
  const [history, setHistory] = useState<AssetChange[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!id) { setError('ID aset tidak ditemukan'); setLoading(false); return }

    try {
      const a = getAsset(id)
      if (!a) { setError('Aset tidak ditemukan'); setLoading(false); return }

      setAsset(a)
      setSchedule(getDepreciationSchedule(id))
      setEditForm({
        name: a.name, category: a.category || '', location: a.location || '',
        acquisitionValue: String(a.acquisitionValue), acquisitionDate: a.acquisitionDate,
        acquisitionYear: String(a.acquisitionYear), usefulLife: String(a.usefulLife),
        residualValue: String(a.residualValue), description: a.description || '',
      })
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setLoading(false)
    }
  }, [id, getAsset, getDepreciationSchedule])

  // Fetch history when Riwayat tab is selected
  useEffect(() => {
    if (activeTab === 'riwayat' && id && history.length === 0 && !historyLoading) {
      setHistoryLoading(true)
      assetApi.getHistory(id)
        .then(setHistory)
        .catch(() => {})
        .finally(() => setHistoryLoading(false))
    }
  }, [activeTab, id])

  const handleEditChange = useCallback((field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
    setEditErrors((prev) => ({ ...prev, [field]: '' }))
  }, [])

  const handleEditSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!id) return

      const errors: Record<string, string> = {}
      if (!editForm.name.trim()) errors.name = 'Nama barang wajib diisi'
      if (!editForm.acquisitionValue || Number(editForm.acquisitionValue) <= 0) errors.acquisitionValue = 'Nilai perolehan harus lebih dari 0'
      if (!editForm.acquisitionDate) errors.acquisitionDate = 'Tanggal perolehan wajib diisi'
      if (!editForm.acquisitionYear || Number(editForm.acquisitionYear) < 1900) errors.acquisitionYear = 'Tahun perolehan tidak valid'
      if (!editForm.usefulLife || Number(editForm.usefulLife) <= 0) errors.usefulLife = 'Masa manfaat harus lebih dari 0'

      if (Object.keys(errors).length > 0) { setEditErrors(errors); return }

      setSubmittingEdit(true)
      try {
        await updateAsset(id, {
          name: editForm.name.trim(),
          category: editForm.category || undefined,
          location: editForm.location || undefined,
          acquisitionValue: Number(editForm.acquisitionValue),
          acquisitionDate: editForm.acquisitionDate,
          acquisitionYear: Number(editForm.acquisitionYear),
          usefulLife: Number(editForm.usefulLife),
          residualValue: Number(editForm.residualValue) || 0,
          description: editForm.description || undefined,
        })

        const updated = getAsset(id)
        setAsset(updated)
        setSchedule(getDepreciationSchedule(id))
        setShowEditModal(false)
        // Invalidate history
        setHistory([])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengupdate aset')
      } finally {
        setSubmittingEdit(false)
      }
    },
    [id, editForm, updateAsset, getAsset, getDepreciationSchedule],
  )

  const handleDelete = useCallback(async () => {
    if (!id) return
    try { await deleteAsset(id); navigate('/aset') }
    catch (err) { setError(err instanceof Error ? err.message : 'Gagal menghapus aset') }
  }, [id, deleteAsset, navigate])

  // Report export handlers
  const handlePrintRegister = useCallback(() => {
    printElement('asset-register-content', `Register Aset - ${asset?.name}`)
  }, [asset])

  const handleExcelRegister = useCallback(() => {
    if (!asset || !schedule) return
    const rows = schedule.years.map((y) => ({
      'Tahun': y.year,
      'Beban Penyusutan': y.annualDepreciation,
      'Akumulasi Penyusutan': y.accumulatedDepreciation,
      'Nilai Buku': y.bookValue,
    }))
    exportToExcel(rows, `register-aset-${asset.name}`)
  }, [asset, schedule])

  // ─── Chart Data ──────────────────────────────────────────────────────────

  const chartData = schedule?.years.map((y) => ({ year: String(y.year), 'Nilai Buku': y.bookValue })) || []
  const currentYear = getCurrentYear()

  const TABS = [
    { key: 'informasi', label: 'Informasi' },
    { key: 'penyusutan', label: 'Penyusutan' },
    { key: 'riwayat', label: 'Riwayat' },
    { key: 'laporan', label: 'Laporan' },
  ]

  // ─── Loading / Error States ─────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Detail Aset" backTo="/aset" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div>
        <PageHeader title="Detail Aset" backTo="/aset" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error || 'Aset tidak ditemukan'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/aset')}>
            Kembali ke Daftar Aset
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.name}
        backTo="/aset"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowEditModal(true)}>
              <PencilIcon />
              <span className="ml-1.5">Edit</span>
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              <TrashIcon />
              <span className="ml-1.5">Hapus</span>
            </Button>
          </div>
        }
      />

      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── Tab: Informasi ─────────────────────────────────────────────────── */}
      {activeTab === 'informasi' && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Informasi Aset</h2>

          {/* Register Number (read-only badge) */}
          {asset.registerNumber && (
            <div className="mb-4">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Nomor Register</span>
              <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-mono font-semibold bg-brand-100 text-brand-700 ml-2">
                {asset.registerNumber}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Nama Barang</p>
              <p className="font-semibold text-slate-800">{asset.name}</p>
            </div>
            {asset.category && (
              <div>
                <p className="text-slate-500">Kategori</p>
                <p className="font-semibold text-slate-800">{asset.category}</p>
              </div>
            )}
            {asset.location && (
              <div>
                <p className="text-slate-500">Lokasi</p>
                <p className="font-semibold text-slate-800">{asset.location}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500">Nilai Perolehan</p>
              <p className="font-semibold text-slate-800">{formatCurrency(asset.acquisitionValue)}</p>
            </div>
            <div>
              <p className="text-slate-500">Tanggal Perolehan</p>
              <p className="font-semibold text-slate-800">{formatDate(asset.acquisitionDate)}</p>
            </div>
            <div>
              <p className="text-slate-500">Tahun Perolehan</p>
              <p className="font-semibold text-slate-800">{asset.acquisitionYear}</p>
            </div>
            <div>
              <p className="text-slate-500">Masa Manfaat</p>
              <p className="font-semibold text-slate-800">{asset.usefulLife} tahun</p>
            </div>
            <div>
              <p className="text-slate-500">Nilai Residu</p>
              <p className="font-semibold text-slate-800">{formatCurrency(asset.residualValue)}</p>
            </div>
            {schedule && (
              <>
                <div>
                  <p className="text-slate-500">Penyusutan per Tahun</p>
                  <p className="font-semibold text-slate-800">{formatCurrency(schedule.annualDepreciation)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Nilai Buku Saat Ini</p>
                  <p className="font-semibold text-brand-600">{formatCurrency(schedule.currentBookValue)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className={`font-semibold ${schedule.isFullyDepreciated ? 'text-amber-600' : 'text-green-600'}`}>
                    {schedule.isFullyDepreciated ? 'Telah Habis' : 'Masih Berlaku'}
                  </p>
                </div>
              </>
            )}
            {asset.description && (
              <div className="sm:col-span-2">
                <p className="text-slate-500">Keterangan</p>
                <p className="text-slate-700">{asset.description}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ─── Tab: Penyusutan ────────────────────────────────────────────────── */}
      {activeTab === 'penyusutan' && (
        <>
          {chartData.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Grafik Penyusutan</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tickFormatter={(val: number) => formatCurrency(val)} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="Nilai Buku" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Tabel Penyusutan per Tahun</h2>
            {schedule && schedule.years.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 font-medium">Tahun</th>
                      <th className="pb-2 font-medium text-right">Beban Penyusutan</th>
                      <th className="pb-2 font-medium text-right">Akumulasi Penyusutan</th>
                      <th className="pb-2 font-medium text-right">Nilai Buku</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedule.years.map((y) => (
                      <tr key={y.year} className={`transition-colors ${y.year === currentYear ? 'bg-brand-50 font-medium' : 'hover:bg-slate-50'}`}>
                        <td className={`py-2.5 whitespace-nowrap ${y.year === currentYear ? 'text-brand-700' : 'text-slate-600'}`}>
                          {y.year}
                          {y.year === currentYear && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-700">Saat Ini</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right text-slate-800">{formatCurrency(y.annualDepreciation)}</td>
                        <td className="py-2.5 text-right text-slate-800">{formatCurrency(y.accumulatedDepreciation)}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-800">{formatCurrency(y.bookValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-4 text-center">Belum ada data penyusutan.</p>
            )}
          </Card>
        </>
      )}

      {/* ─── Tab: Riwayat ───────────────────────────────────────────────────── */}
      {activeTab === 'riwayat' && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Riwayat Perubahan</h2>
          {historyLoading ? (
            <LoadingSpinner size="sm" className="py-8" />
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">Belum ada perubahan data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 font-medium">Tanggal</th>
                    <th className="pb-2 font-medium">Field</th>
                    <th className="pb-2 font-medium">Sebelum</th>
                    <th className="pb-2 font-medium">Sesudah</th>
                    <th className="pb-2 font-medium">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 text-slate-600 whitespace-nowrap">
                        {new Date(h.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-medium text-slate-800">{h.field}</td>
                      <td className="py-2.5 text-slate-500 text-xs max-w-[200px] truncate">{h.oldValue || '-'}</td>
                      <td className="py-2.5 text-slate-700 text-xs max-w-[200px] truncate">{h.newValue || '-'}</td>
                      <td className="py-2.5 text-slate-600">{h.userName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ─── Tab: Laporan ───────────────────────────────────────────────────── */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Laporan Register Aset</h2>
              <ExportButtons
                onPdf={handlePrintRegister}
                onExcel={handleExcelRegister}
                onPrint={handlePrintRegister}
              />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Laporan lengkap informasi aset beserta tabel penyusutan.
            </p>

            {/* Printable content */}
            <div id="asset-register-content">
              <div className="border rounded-lg p-4 bg-slate-50 mb-4">
                <h3 className="font-semibold text-slate-800 mb-2">
                  {asset.registerNumber ? `${asset.registerNumber} - ` : ''}{asset.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-slate-500">Kategori:</span> <span className="font-medium">{asset.category || '-'}</span></div>
                  <div><span className="text-slate-500">Lokasi:</span> <span className="font-medium">{asset.location || '-'}</span></div>
                  <div><span className="text-slate-500">Nilai Perolehan:</span> <span className="font-medium">{formatCurrency(asset.acquisitionValue)}</span></div>
                  <div><span className="text-slate-500">Tgl Perolehan:</span> <span className="font-medium">{formatDate(asset.acquisitionDate)}</span></div>
                  <div><span className="text-slate-500">Masa Manfaat:</span> <span className="font-medium">{asset.usefulLife} tahun</span></div>
                  <div><span className="text-slate-500">Nilai Residu:</span> <span className="font-medium">{formatCurrency(asset.residualValue)}</span></div>
                </div>
                {asset.description && <p className="text-xs text-slate-500 mt-2">Ket: {asset.description}</p>}
              </div>

              {schedule && schedule.years.length > 0 && (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-1 font-medium">Tahun</th>
                      <th className="pb-1 font-medium text-right">Beban</th>
                      <th className="pb-1 font-medium text-right">Akumulasi</th>
                      <th className="pb-1 font-medium text-right">Nilai Buku</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedule.years.map((y) => (
                      <tr key={y.year}>
                        <td className="py-1">{y.year}</td>
                        <td className="py-1 text-right">{formatCurrency(y.annualDepreciation)}</td>
                        <td className="py-1 text-right">{formatCurrency(y.accumulatedDepreciation)}</td>
                        <td className="py-1 text-right font-medium">{formatCurrency(y.bookValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center p-6">
              <h3 className="font-semibold text-slate-800 mb-2">Rekapan</h3>
              <p className="text-sm text-slate-500 mb-3">Ringkasan data aset berdasarkan kategori.</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/laporan/penyusutan')}>
                Lihat Rekapan
              </Button>
            </Card>
            <Card className="text-center p-6">
              <h3 className="font-semibold text-slate-800 mb-2">Rekapan Penyusutan</h3>
              <p className="text-sm text-slate-500 mb-3">Ringkasan penyusutan seluruh aset.</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/laporan/penyusutan')}>
                Lihat Penyusutan
              </Button>
            </Card>
            <Card className="text-center p-6">
              <h3 className="font-semibold text-slate-800 mb-2">Rekapan Cicilan</h3>
              <p className="text-sm text-slate-500 mb-3">Ringkasan status cicilan.</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/laporan/cicilan')}>
                Lihat Cicilan
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Aset" size="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {/* Register Number (read-only) */}
          {asset.registerNumber && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nomor Register</label>
              <p className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-mono text-slate-600">{asset.registerNumber}</p>
            </div>
          )}
          <Input label="Nama Barang" value={editForm.name} onChange={(e) => handleEditChange('name', e.target.value)} error={editErrors.name} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kategori" value={editForm.category} onChange={(e) => handleEditChange('category', e.target.value)} error={editErrors.category} />
            <Input label="Lokasi" value={editForm.location} onChange={(e) => handleEditChange('location', e.target.value)} error={editErrors.location} />
          </div>
          <Input label="Nilai Perolehan" type="number" value={editForm.acquisitionValue} onChange={(e) => handleEditChange('acquisitionValue', e.target.value)} error={editErrors.acquisitionValue} />
          <DatePicker label="Tanggal Perolehan" value={editForm.acquisitionDate} onChange={(e) => handleEditChange('acquisitionDate', e.target.value)} error={editErrors.acquisitionDate} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tahun Perolehan" type="number" value={editForm.acquisitionYear} onChange={(e) => handleEditChange('acquisitionYear', e.target.value)} error={editErrors.acquisitionYear} />
            <Input label="Masa Manfaat (tahun)" type="number" value={editForm.usefulLife} onChange={(e) => handleEditChange('usefulLife', e.target.value)} error={editErrors.usefulLife} />
          </div>
          <Input label="Nilai Residu" type="number" value={editForm.residualValue} onChange={(e) => handleEditChange('residualValue', e.target.value)} />
          <Input label="Keterangan" value={editForm.description} onChange={(e) => handleEditChange('description', e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowEditModal(false)}>Batal</Button>
            <Button type="submit" isLoading={submittingEdit}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation ──────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Aset"
        message={`Apakah Anda yakin ingin menghapus aset "${asset.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Aset"
        confirmVariant="danger"
      />
    </div>
  )
}
