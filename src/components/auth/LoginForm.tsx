import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner'

export default function LoginForm() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">keuriqAI</h1>
          <p className="text-slate-500 mt-1">Pencatatan Keuangan Pribadi</p>
        </div>
        <AuthFormSwitcher />
      </div>
    </div>
  )
}

function AuthFormSwitcher() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const { login, register, error: authError } = useAuth()

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Mohon isi email dan password.')
      return
    }

    setSubmitting(true)
    try {
      const success = await login(email, password)
      if (!success) {
        setError(authError || 'Email atau password salah.')
      }
    } catch {
      setError('Terjadi kesalahan.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!regName || !regEmail || !regPassword) {
      setError('Mohon isi semua field.')
      return
    }
    if (regPassword.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (regPassword !== regConfirm) {
      setError('Password tidak cocok.')
      return
    }

    setSubmitting(true)
    try {
      const success = await register(regName, regEmail, regPassword)
      if (!success) {
        setError(authError || 'Registrasi gagal.')
      }
    } catch {
      setError('Terjadi kesalahan.')
    } finally {
      setSubmitting(false)
    }
  }

  if (mode === 'login') {
    return (
      <div>
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-slate-700">Masuk</h2>
          <p className="text-sm text-slate-500">Masuk dengan akun Anda</p>
        </div>

        {(error || authError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              placeholder="nama@email.com"
              autoFocus
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Belum punya akun?{' '}
          <button
            onClick={() => { setMode('register'); setError('') }}
            className="text-brand-600 font-medium hover:text-brand-700"
          >
            Daftar
          </button>
        </p>
      </div>
    )
  }

  // Register mode
  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-slate-700">Buat Akun</h2>
        <p className="text-sm text-slate-500">Daftar untuk mulai mencatat keuangan</p>
      </div>

      {(error || authError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error || authError}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
          <input
            type="text"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            placeholder="Nama Anda"
            autoFocus
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            placeholder="nama@email.com"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            placeholder="Minimal 6 karakter"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
          <input
            type="password"
            value={regConfirm}
            onChange={(e) => setRegConfirm(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            placeholder="Masukkan ulang password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
        >
          {submitting ? 'Mendaftarkan...' : 'Daftar'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-4">
        Sudah punya akun?{' '}
        <button
          onClick={() => { setMode('login'); setError('') }}
          className="text-brand-600 font-medium hover:text-brand-700"
        >
          Masuk
        </button>
      </p>
    </div>
  )
}
