import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import QuickCapture from '../ui/QuickCapture'
import { useAuthStore } from '../../store/authStore'

interface LayoutProps {
  children: ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-neo-bg dark:bg-[#1a1a2e]">
      <Header />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeOut' as const }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {children}
      </motion.main>
      {isAuthenticated && <QuickCapture />}
    </div>
  )
}
