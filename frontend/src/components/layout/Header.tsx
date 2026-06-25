import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', emoji: '📊' },
  { to: '/tasks', label: 'Tasks', emoji: '✅' },
  { to: '/kanban', label: 'Kanban', emoji: '📋' },
  { to: '/calendar', label: 'Calendar', emoji: '📅' },
  { to: '/goals', label: 'Goals', emoji: '🎯' },
  { to: '/news', label: 'News', emoji: '📰' },
  { to: '/journal', label: 'Journal', emoji: '📝' },
  { to: '/ideas', label: 'Ideas', emoji: '💡' },
  { to: '/reading', label: 'Reading', emoji: '📚' },
  { to: '/workouts', label: 'Workouts', emoji: '💪' },
  { to: '/expenses', label: 'Expenses', emoji: '💰' },
  { to: '/achievements', label: 'Achievements', emoji: '🏆' },
  { to: '/reminders', label: 'Reminders', emoji: '⏰' },
]

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="bg-neo-surface border-b-3 border-neo-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.span
                className="text-2xl font-black font-display text-neo-primary tracking-tight"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                PA
              </motion.span>
              <span className="text-2xl font-black font-display text-neo-border dark:text-white tracking-tight">
                App
              </span>
            </Link>

            {/* Nav Links */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.slice(0, 7).map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-3 py-1.5 text-sm font-semibold text-neo-text dark:text-gray-200 border-2 border-transparent rounded-lg hover:border-neo-border hover:bg-neo-accent/30 transition-all"
                  >
                    <span className="mr-1">{link.emoji}</span>
                    {link.label}
                  </Link>
                ))}

                {/* More dropdown */}
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="px-3 py-1.5 text-sm font-semibold text-neo-text dark:text-gray-200 border-2 border-neo-border rounded-lg bg-neo-accent/20 hover:bg-neo-accent/50 transition-colors"
                  >
                    More ▾
                  </motion.button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-neo-surface border-3 border-neo-border rounded-xl shadow-neo py-2 z-50"
                        onMouseLeave={() => setMenuOpen(false)}
                      >
                        {NAV_LINKS.slice(7).map(link => (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neo-text hover:bg-neo-accent/30 transition-colors"
                          >
                            <span>{link.emoji}</span>
                            {link.label}
                          </Link>
                        ))}
                        <div className="border-t-2 border-neo-border my-1" />
                        <Link
                          to="/settings"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neo-text hover:bg-neo-accent/30 transition-colors"
                        >
                          <span>⚙️</span>
                          Settings
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>
            )}
          </div>

          {/* Auth Area */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-bold text-neo-border dark:text-white hidden sm:block bg-neo-accent/30 px-3 py-1 rounded-full border-2 border-neo-border">
                  {user?.name}
                </span>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="text-sm font-bold text-neo-danger border-2 border-neo-border px-3 py-1 rounded-lg hover:bg-neo-danger hover:text-white transition-colors shadow-neo-sm"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <Link to="/login">
                <motion.span
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-5 py-2 bg-neo-primary text-white border-3 border-neo-border rounded-lg font-bold text-sm shadow-neo-sm hover:shadow-neo transition-all cursor-pointer"
                >
                  Sign In
                </motion.span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
