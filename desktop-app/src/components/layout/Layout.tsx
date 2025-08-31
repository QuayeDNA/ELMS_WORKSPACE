import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false) // Auto-close on desktop
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar with enhanced animations */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isMobile ? 'shadow-2xl' : ''}
        `}
      >
        <Sidebar onClose={handleSidebarClose} />
      </div>

      {/* Mobile overlay with smooth fade */}
      {sidebarOpen && isMobile && (
        <button
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          style={{
            backgroundColor: 'var(--color-overlay)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            padding: 0
          }}
          onClick={handleSidebarClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleSidebarClose()
            }
          }}
          type="button"
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content Area with smooth transitions */}
      <div
        className={`
          flex-1 flex flex-col min-w-0
          transition-all duration-300 ease-in-out
          ${sidebarOpen && !isMobile ? 'lg:ml-0' : ''}
        `}
        style={{
          background: 'linear-gradient(135deg, var(--background) 0%, var(--surface-variant) 100%)'
        }}
      >
        {/* Header */}
        <Header onMenuClick={handleMenuClick} />

        {/* Page Content with enhanced styling */}
        <main className="flex-1 overflow-auto relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, var(--primary) 2px, transparent 2px),
                radial-gradient(circle at 75% 75%, var(--secondary) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px, 20px 20px',
              backgroundPosition: '0 0, 20px 20px'
            }} />
          </div>

          {/* Content container */}
          <div className="relative p-4 lg:p-6 min-h-full">
            <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}