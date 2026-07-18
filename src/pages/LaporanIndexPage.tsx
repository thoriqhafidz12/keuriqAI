import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import PageHeader from '../components/common/PageHeader'

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function ChartBarIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}

function ArrowPathIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
    </svg>
  )
}

function CashIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}

function CubeIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  )
}

// ─── Report Card Type ─────────────────────────────────────────────────────────

interface ReportCard {
  title: string
  description: string
  icon: React.ReactNode
  path: string
  colorClass: string
}

// ─── LaporanIndexPage Component ──────────────────────────────────────────────

export default function LaporanIndexPage() {
  const navigate = useNavigate()

  const reports: ReportCard[] = [
    {
      title: 'Laporan Saldo',
      description: 'Lihat ringkasan saldo dan transaksi harian, bulanan, atau tahunan.',
      icon: <ChartBarIcon />,
      path: '/laporan/saldo',
      colorClass: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Laporan FIFO',
      description: 'Lihat alokasi dana berdasarkan metode First In First Out.',
      icon: <ArrowPathIcon />,
      path: '/laporan/fifo',
      colorClass: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Laporan Pengeluaran',
      description: 'Analisis pengeluaran berdasarkan kategori dan periode waktu.',
      icon: <CashIcon />,
      path: '/laporan/pengeluaran',
      colorClass: 'text-red-600 bg-red-50',
    },
    {
      title: 'Laporan Cicilan',
      description: 'Lihat status cicilan, riwayat pembayaran, dan progres.',
      icon: <CalendarIcon />,
      path: '/laporan/cicilan',
      colorClass: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Laporan Penyusutan',
      description: 'Lihat penyusutan aset tetap secara tahunan.',
      icon: <CubeIcon />,
      path: '/laporan/penyusutan',
      colorClass: 'text-amber-600 bg-amber-50',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card
            key={report.path}
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => navigate(report.path)}
          >
            <div className="space-y-4">
              <div className={`inline-flex p-3 rounded-xl ${report.colorClass}`}>
                {report.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {report.description}
                </p>
              </div>
              <div className="text-sm font-medium text-brand-600 group-hover:underline">
                Lihat &rarr;
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
