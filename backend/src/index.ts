import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from 'dotenv'
import { initDB } from './db'
import { errorHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/auth'
import { googleAuthRoutes } from './routes/googleAuth'
import { userRoutes } from './routes/users'
import { taskRoutes } from './routes/tasks'
import { habitRoutes } from './routes/habits'
import { noteRoutes } from './routes/notes'
import { categoryRoutes } from './routes/categories'
import { goalRoutes } from './routes/goals'
import { moodRoutes } from './routes/moods'
import { focusSessionRoutes } from './routes/focusSessions'
import { soundRoutes } from './routes/sounds'
import { weatherRoutes } from './routes/weather'
import { journalRoutes } from './routes/journals'
import { tagRoutes } from './routes/tags'
import { ideaRoutes } from './routes/ideas'
import { readingListRoutes } from './routes/readingList'
import { workoutRoutes } from './routes/workouts'
import { expenseRoutes } from './routes/expenses'
import { achievementRoutes } from './routes/achievements'
import { reminderRoutes } from './routes/reminders'
import { settingsRoutes } from './routes/settings'
import { seedAchievements } from './models/achievement'

config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (React Native, curl, mobile apps)
    if (!origin) return callback(null, true)
    // In development, allow all origins
    callback(null, true)
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// Request logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
  })
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/auth/google', googleAuthRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/moods', moodRoutes)
app.use('/api/focus-sessions', focusSessionRoutes)
app.use('/api/sounds', soundRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/journals', journalRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/ideas', ideaRoutes)
app.use('/api/reading-list', readingListRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/settings', settingsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use(errorHandler)

// Initialize database and start server
async function start() {
  try {
    await initDB()
    seedAchievements()
    console.log('Database initialized')

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()

export default app
