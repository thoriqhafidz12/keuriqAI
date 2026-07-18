import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/kas/saldo-awal': 'Saldo Awal',
  '/kas/penerimaan': 'Penerimaan',
  '/kas/pengeluaran': 'Pengeluaran',
  '/fifo': 'Laporan FIFO',
  '/cicilan': 'Cicilan',
  '/aset': 'Penyusutan Aset',
  '/laporan': 'Laporan',
  '/laporan/saldo': 'Laporan Saldo',
  '/laporan/fifo': 'Laporan FIFO',
  '/laporan/pengeluaran': 'Laporan Pengeluaran',
  '/laporan/cicilan': 'Laporan Cicilan',
  '/laporan/penyusutan': 'Laporan Penyusutan',
}

export default function AppLayout() {
  const location = useLocation()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // Get current page title
  let title = pageTitles[location.pathname] || ''
  // Handle dynamic routes
  if (!title && location.pathname.startsWith('/cicilan/')) {
    title = 'Detail Cicilan'
  } else if (!title && location.pathname.startsWith('/aset/')) {
    title = 'Detail Aset'
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Desktop Sidebar */}
      {isDesktop && <Sidebar />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      {!isDesktop && <MobileNav />}
    </div>
  )
}
