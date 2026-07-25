import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { clsx } from 'clsx'

const NAV_SECTIONS = [
  {
    label: 'Main',
    links: [
      { to: '/dashboard', label: 'Dashboard', emoji: '📊' },
      { to: '/tasks', label: 'Tasks', emoji: '✅' },
      { to: '/calendar', label: 'Calendar', emoji: '📅' },
      { to: '/kanban', label: 'Board', emoji: '📋' },
    ],
  },
  {
    label: 'Life',
    links: [
      { to: '/goals', label: 'Goals', emoji: '🎯' },
      { to: '/journal', label: 'Journal', emoji: '📝' },
      { to: '/ideas', label: 'Ideas', emoji: '💡' },
      { to: '/workouts', label: 'Workouts', emoji: '💪' },
      { to: '/expenses', label: 'Expenses', emoji: '💰' },
    ],
  },
  {
    label: 'Discover',
    links: [
      { to: '/reading', label: 'Reading List', emoji: '📚' },
      { to: '/news', label: 'News', emoji: '📰' },
      { to: '/achievements', label: 'Achievements', emoji: '🏆' },
      { to: '/reminders', label: 'Reminders', emoji: '⏰' },
    ],
  },
]

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' },
}

export default function Sidebar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar-bg dark:bg-sidebar-darkBg border-r border-neo-border">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-8 h-8 rounded-lg bg-neo-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            P
          </div>
          <span className="text-base font-semibold text-neo-text font-display">
            PA App
          </span>
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-2 mb-1 text-xs font-semibold text-neo-muted uppercase tracking-wider">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-sidebar-active text-neo-text dark:bg-sidebar-darkActive dark:text-white'
                        : 'text-sidebar-text dark:text-sidebar-darkText hover:bg-sidebar-hover dark:hover:bg-sidebar-darkHover'
                    )}
                  >
                    <span className="text-base flex-shrink-0">{link.emoji}</span>
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-neo-border px-3 py-3">
        <Link
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={clsx(
            'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
            isActive('/settings')
              ? 'bg-sidebar-active text-neo-text dark:bg-sidebar-darkActive dark:text-white'
              : 'text-sidebar-text dark:text-sidebar-darkText hover:bg-sidebar-hover dark:hover:bg-sidebar-darkHover'
          )}
        >
          <span className="text-base flex-shrink-0">⚙️</span>
          <span>Settings</span>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-neo-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="text-sm text-neo-textSecondary dark:text-sidebar-darkText truncate flex-1">
              {user?.name || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-neo-muted hover:text-neo-danger transition-colors flex-shrink-0"
              title="Logout"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      {isAuthenticated && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-50 lg:hidden w-9 h-9 rounded-lg bg-white dark:bg-[#1c1c30] border border-neo-border shadow-sm flex items-center justify-center text-neo-text"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      )}

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 z-50 h-full w-64 lg:hidden shadow-sidebar"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-30 h-full w-56 shadow-sidebar">
        {sidebarContent}
      </aside>
    </>
  )
}
