import { motion } from 'framer-motion'
import Layout from '../components/layout/Layout'
import { DailyAgendaDashboard } from '../components/dashboard'
import { HabitList } from '../components/habits'
import WeeklyOverview from '../components/dashboard/WeeklyOverview'
import DailySummary from '../components/dashboard/DailySummary'
import ProductivityScore from '../components/dashboard/ProductivityScore'
import FocusTimer from '../components/focus/FocusTimer'
import MoodCheckIn from '../components/mood/MoodCheckIn'
import SoundPlayer from '../components/sounds/SoundPlayer'
import WeatherWidget from '../components/dashboard/WeatherWidget'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function DashboardPage() {
  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Your daily overview at a glance</p>
        </div>

        {/* Top Row: Weather + Weekly Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <WeatherWidget />
          <WeeklyOverview />
        </motion.div>

        {/* Main Dashboard */}
        <motion.div variants={itemVariants}>
          <DailyAgendaDashboard />
        </motion.div>

        {/* Widgets Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <DailySummary />
          <ProductivityScore />
          <FocusTimer />
        </motion.div>

        {/* Mood + Sound Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <MoodCheckIn />
          <SoundPlayer />
        </motion.div>

        {/* Habits */}
        <motion.div variants={itemVariants}>
          <HabitList />
        </motion.div>
      </motion.div>
    </Layout>
  )
}
