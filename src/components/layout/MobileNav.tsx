import { NavLink, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const kasChildren = [
  { label: 'Saldo Awal', path: '/kas/saldo-awal' },
  { label: 'Penerimaan', path: '/kas/penerimaan' },
  { label: 'Pengeluaran', path: '/kas/pengeluaran' },
]

const navItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
  {
    label: 'Kas',
    path: '/kas/saldo-awal',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
    hasChildren: true,
  },
  {
    label: 'FIFO',
    path: '/fifo',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Cicilan',
    path: '/cicilan',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Laporan',
    path: '/laporan',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
]

export default function MobileNav() {
  const location = useLocation()
  const [kasOpen, setKasOpen] = useState(false)
  const kasRef = useRef<HTMLDivElement>(null)

  const isKasPage = ['/kas/saldo-awal', '/kas/penerimaan', '/kas/pengeluaran'].includes(location.pathname)

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (kasRef.current && !kasRef.current.contains(e.target as Node)) {
        setKasOpen(false)
      }
    }
    if (kasOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [kasOpen])

  // Close submenu when navigating away from Kas pages
  useEffect(() => {
    if (!isKasPage) setKasOpen(false)
  }, [location.pathname])

  const handleKasTap = () => {
    setKasOpen((prev) => !prev)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden">
      {/* Kas submenu popover */}
      {kasOpen && (
        <div
          ref={kasRef}
          className="absolute bottom-full left-0 right-0 bg-white border-t border-x border-slate-200 rounded-t-xl shadow-lg mx-auto w-fit mb-1"
        >
          <div className="flex flex-col py-1 min-w-36">
            {kasChildren.map((child) => {
              const active = location.pathname === child.path
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={() => setKasOpen(false)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {child.label}
                </NavLink>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom nav items */}
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : item.hasChildren
                ? isKasPage
                : location.pathname.startsWith(item.path)

          return (
            <div key={item.label} className="relative">
              {item.hasChildren ? (
                <button
                  onClick={handleKasTap}
                  className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                    isActive ? 'text-brand-600' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                  <span className="mt-1">{item.label}</span>
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                    isActive ? 'text-brand-600' : 'text-slate-400'
                  }`}
                  end={item.path === '/'}
                >
                  {item.icon}
                  <span className="mt-1">{item.label}</span>
                </NavLink>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
