import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

function DecorativeShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] left-[10%] w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl"
      />
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[20%] right-[15%] w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full"
      />
      <motion.div
        animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[20%] left-[20%] w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl rotate-12"
      />
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-[15%] right-[10%] w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full"
      />
    </div>
  )
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const { login, register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      navigate('/dashboard')
    } catch (err: any) {
      setLocalError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#13131f] p-4">
      <DecorativeShapes />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-[#1c1c30] border border-neo-border rounded-2xl shadow-modal p-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <div className="w-10 h-10 rounded-xl bg-neo-primary flex items-center justify-center text-white font-bold text-lg mb-5 mx-auto shadow-sm">
              P
            </div>
            <h2 className="text-2xl font-bold text-center text-neo-text">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h2>
            <p className="mt-1.5 text-center text-neo-textSecondary text-sm">
              {isLogin ? 'Sign in to your PA App' : 'Create your PA App account'}
            </p>
          </motion.div>

          {/* Error */}
          {(localError || error) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium"
            >
              {localError || error}
            </motion.div>
          )}

          {/* Form */}
          <motion.form variants={itemVariants} className="space-y-4 mt-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neo-text mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required={!isLogin}
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neo-text mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neo-text mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                minLength={6}
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-neo-muted">Must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-neo-primary hover:bg-neo-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-button mt-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </motion.form>

          {/* Toggle */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setLocalError('')
                clearError()
              }}
              className="text-sm font-medium text-neo-primary hover:text-neo-primaryHover transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
