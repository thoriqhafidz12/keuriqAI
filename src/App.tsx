import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TransactionProvider } from './contexts/TransactionContext'
import { FIFOProvider } from './contexts/FIFOContext'
import { InstallmentProvider } from './contexts/InstallmentContext'
import { AssetProvider } from './contexts/AssetContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AppLayout from './components/layout/AppLayout'
import PrivateRoute from './routes/PrivateRoute'
import SaldoAwalPage from './pages/SaldoAwalPage'
import PenerimaanPage from './pages/PenerimaanPage'
import PengeluaranPage from './pages/PengeluaranPage'
import FIFOPage from './pages/FIFOPage'
import CicilanListPage from './pages/CicilanListPage'
import CicilanDetailPage from './pages/CicilanDetailPage'
import AsetListPage from './pages/AsetListPage'
import AsetDetailPage from './pages/AsetDetailPage'
import LaporanIndexPage from './pages/LaporanIndexPage'
import LaporanSaldoPage from './pages/LaporanSaldoPage'
import LaporanFIFOPage from './pages/LaporanFIFOPage'
import LaporanPengeluaranPage from './pages/LaporanPengeluaranPage'
import LaporanCicilanPage from './pages/LaporanCicilanPage'
import LaporanPenyusutanPage from './pages/LaporanPenyusutanPage'

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <FIFOProvider>
          <InstallmentProvider>
            <AssetProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  element={
                    <PrivateRoute>
                      <AppLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="kas/saldo-awal" element={<SaldoAwalPage />} />
                  <Route path="kas/penerimaan" element={<PenerimaanPage />} />
                  <Route path="kas/pengeluaran" element={<PengeluaranPage />} />
                  <Route path="fifo" element={<FIFOPage />} />
                  <Route path="cicilan" element={<CicilanListPage />} />
                  <Route path="cicilan/:id" element={<CicilanDetailPage />} />
                  <Route path="aset" element={<AsetListPage />} />
                  <Route path="aset/:id" element={<AsetDetailPage />} />
                  <Route path="laporan" element={<LaporanIndexPage />} />
                  <Route path="laporan/saldo" element={<LaporanSaldoPage />} />
                  <Route path="laporan/fifo" element={<LaporanFIFOPage />} />
                  <Route path="laporan/pengeluaran" element={<LaporanPengeluaranPage />} />
                  <Route path="laporan/cicilan" element={<LaporanCicilanPage />} />
                  <Route path="laporan/penyusutan" element={<LaporanPenyusutanPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AssetProvider>
          </InstallmentProvider>
        </FIFOProvider>
      </TransactionProvider>
    </AuthProvider>
  )
}
