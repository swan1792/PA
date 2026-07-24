import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import QuickCapture from '../ui/QuickCapture'
import { useAuthStore } from '../../store/authStore'

interface LayoutProps {
  children: ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-neo-bg dark:bg-[#13131f]">
      <Sidebar />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.25, ease: 'easeOut' as const }}
        className="lg:ml-56 max-w-5xl mx-auto px-4 sm:px-6 py-6 pt-14 lg:pt-8"
      >
        {children}
      </motion.main>
      {isAuthenticated && <QuickCapture />}
    </div>
  )
}
