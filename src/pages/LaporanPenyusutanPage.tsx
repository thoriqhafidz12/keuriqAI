import { useState, useEffect, useMemo } from 'react'
import { useAssets } from '../hooks/useAssets'
import { formatCurrency } from '../utils/formatters'
import { getCurrentYear } from '../utils/helpers'
import Card from '../components/common/Card'
import Select from '../components/common/Select'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'

// ─── LaporanPenyusutanPage Component ─────────────────────────────────────────

export default function LaporanPenyusutanPage() {
  const { assets, getDepreciationSchedule, getAggregatedData } = useAssets()

  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(String(getCurrentYear()))

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 150)
    return () => clearTimeout(timer)
  }, [])

  // Build year options from asset data
  const yearOptions = useMemo(() => {
    const years = new Set<number>()
    assets.forEach((a) => {
      const endYear = a.acquisitionYear + a.usefulLife - 1
      for (let y = a.acquisitionYear; y <= endYear; y++) {
        years.add(y)
      }
    })
    const currentYear = getCurrentYear()
    years.add(currentYear)

    return Array.from(years)
      .sort((a, b) => b - a)
      .map((y) => ({ value: String(y), label: String(y) }))
  }, [assets])

  // Compute depreciation data for each asset in the selected year
  const depreciationRows = useMemo(() => {
    const year = Number(selectedYear)
    return assets.map((asset) => {
      const schedule = getDepreciationSchedule(asset.id)
      if (!schedule) return null

      const yearData = schedule.years.find((y) => y.year === year)

      return {
        id: asset.id,
        name: asset.name,
        acquisitionValue: asset.acquisitionValue,
        annualDepreciation: schedule.annualDepreciation,
        accumulatedDepreciation: yearData?.accumulatedDepreciation ?? 0,
        bookValue: yearData?.bookValue ?? 0,
        hasData: !!yearData,
      }
    }).filter((row): row is NonNullable<typeof row> => row !== null)
  }, [assets, getDepreciationSchedule, selectedYear])

  // Aggregated totals for selected year
  const aggregatedTotals = useMemo(() => {
    const totalAcquisition = depreciationRows.reduce((s, r) => s + r.acquisitionValue, 0)
    const totalAccumulated = depreciationRows.reduce((s, r) => s + r.accumulatedDepreciation, 0)
    const totalBookValue = depreciationRows.reduce((s, r) => s + r.bookValue, 0)

    return { totalAcquisition, totalAccumulated, totalBookValue }
  }, [depreciationRows])

  // Overall aggregated data
  const overallData = useMemo(() => {
    try {
      return getAggregatedData()
    } catch {
      return null
    }
  }, [getAggregatedData, assets])

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Laporan Penyusutan" backTo="/laporan" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  // ─── Error State ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <PageHeader title="Laporan Penyusutan" backTo="/laporan" />
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Penyusutan" backTo="/laporan" />

      {/* ─── Overall Stats ─────────────────────────────────────────────────────── */}
      {overallData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-slate-500">Total Nilai Perolehan</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(overallData.totalAcquisitionValue)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Total Akumulasi Penyusutan</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(overallData.totalAccumulatedDepreciation)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Total Nilai Buku</p>
            <p className="text-xl font-bold text-brand-600">{formatCurrency(overallData.totalBookValue)}</p>
          </Card>
        </div>
      )}

      {/* ─── Year Selector ─────────────────────────────────────────────────────── */}
      <div className="max-w-xs">
        <Select
          label="Pilih Tahun"
          options={yearOptions}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        />
      </div>

      {/* ─── Depreciation Table ────────────────────────────────────────────────── */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Data Penyusutan Tahun {selectedYear}
        </h2>

        {depreciationRows.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">
            Belum ada data aset.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 font-medium">Nama Aset</th>
                  <th className="pb-2 font-medium text-right">Nilai Perolehan</th>
                  <th className="pb-2 font-medium text-right">Penyusutan Tahunan</th>
                  <th className="pb-2 font-medium text-right">Akumulasi Penyusutan</th>
                  <th className="pb-2 font-medium text-right">Nilai Buku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depreciationRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      !row.hasData ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="py-2.5 font-medium text-slate-800">
                      {row.name}
                      {!row.hasData && (
                        <span className="ml-2 text-xs text-slate-400">(belum tersedia)</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-medium text-slate-800">
                      {formatCurrency(row.acquisitionValue)}
                    </td>
                    <td className="py-2.5 text-right text-slate-700">
                      {row.hasData ? formatCurrency(row.annualDepreciation) : '-'}
                    </td>
                    <td className="py-2.5 text-right text-slate-700">
                      {row.hasData ? formatCurrency(row.accumulatedDepreciation) : '-'}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-800">
                      {row.hasData ? formatCurrency(row.bookValue) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 font-semibold">
                  <td className="pt-3 text-slate-700">
                    Total ({depreciationRows.length} aset)
                  </td>
                  <td className="pt-3 text-right text-slate-800">
                    {formatCurrency(aggregatedTotals.totalAcquisition)}
                  </td>
                  <td className="pt-3 text-right text-slate-700">
                    {formatCurrency(
                      depreciationRows
                        .filter((r) => r.hasData)
                        .reduce((s, r) => s + r.annualDepreciation, 0),
                    )}
                  </td>
                  <td className="pt-3 text-right text-slate-700">
                    {formatCurrency(aggregatedTotals.totalAccumulated)}
                  </td>
                  <td className="pt-3 text-right font-bold text-brand-600">
                    {formatCurrency(aggregatedTotals.totalBookValue)}
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
