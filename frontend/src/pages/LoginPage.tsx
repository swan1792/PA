import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import GoogleSignIn from '../components/auth/GoogleSignIn'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// Decorative shapes for the background
function DecorativeShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] left-[10%] w-24 h-24 bg-neo-accent border-3 border-neo-border rounded-xl shadow-neo-sm"
      />
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[20%] right-[15%] w-16 h-16 bg-neo-secondary border-3 border-neo-border rounded-full shadow-neo-sm"
      />
      <motion.div
        animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[20%] left-[20%] w-20 h-20 bg-neo-primary border-3 border-neo-border rounded-xl shadow-neo-sm rotate-12"
      />
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-[15%] right-[10%] w-14 h-14 bg-neo-purple border-3 border-neo-border rounded-full shadow-neo-sm"
      />
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-[50%] left-[5%] w-10 h-10 bg-neo-orange border-3 border-neo-border rounded-lg shadow-neo-sm rotate-45"
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

  const handleGoogleError = (errorMsg: string) => {
    setLocalError(errorMsg)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neo-bg dark:bg-[#1a1a2e] p-4">
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
          className="bg-neo-surface border-3 border-neo-border rounded-xl shadow-neo-lg p-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-black text-center text-neo-text dark:text-white font-display tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h2>
            <p className="mt-2 text-center text-neo-muted font-medium">
              {isLogin ? 'Sign in to your PA App' : 'Create your PA App account'}
            </p>
          </motion.div>

          {/* Error */}
          {(localError || error) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 bg-neo-danger/10 border-3 border-neo-danger text-neo-danger px-4 py-3 rounded-lg text-sm font-bold"
            >
              {localError || error}
            </motion.div>
          )}

          {/* Google Sign-In */}
          <motion.div variants={itemVariants} className="mt-6">
            <GoogleSignIn onError={handleGoogleError} />
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-3 border-neo-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-neo-surface text-neo-muted font-bold uppercase tracking-wider text-xs">
                Or continue with email
              </span>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form variants={itemVariants} className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-neo-text dark:text-white mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="neo-input dark:bg-[#252540] dark:text-white dark:border-gray-500"
                  required={!isLogin}
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-neo-text dark:text-white mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neo-input dark:bg-[#252540] dark:text-white dark:border-gray-500"
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-neo-text dark:text-white mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neo-input dark:bg-[#252540] dark:text-white dark:border-gray-500"
                required
                minLength={6}
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-neo-muted font-medium">Must be at least 6 characters</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : { y: -2, boxShadow: '4px 4px 0px 0px #2d2d2d' }}
              whileTap={isLoading ? {} : { y: 2, x: 2, boxShadow: '0px 0px 0px 0px #2d2d2d' }}
              className="w-full flex justify-center items-center py-3 px-4 border-3 border-neo-border rounded-lg shadow-neo-sm text-sm font-bold text-white bg-neo-primary hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <motion.svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </motion.svg>
                  Loading...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
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
              className="text-sm font-bold text-neo-primary hover:text-neo-secondary transition-colors underline decoration-3 decoration-neo-primary underline-offset-4 hover:decoration-neo-secondary"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
