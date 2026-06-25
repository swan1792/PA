import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { MoodModel } from '../models/mood'

const router = Router()

const upsertMoodSchema = z.object({
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  note: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

const querySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// Get moods by date range
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = querySchema.parse(req.query)
  const moods = MoodModel.findByDateRange(req.userId!, startDate, endDate)
  res.json({ data: moods })
})

// Get mood for today
router.get('/today', authenticate, (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0]
  const mood = MoodModel.findByDate(req.userId!, today)
  res.json({ data: mood || null })
})

// Get mood stats
router.get('/stats', authenticate, (req: AuthRequest, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string) : 30
  const stats = MoodModel.getStats(req.userId!, days)
  res.json({ data: stats })
})

// Create or update mood for a date
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = upsertMoodSchema.parse(req.body)
  const mood = MoodModel.upsert(req.userId!, data)
  res.json({ data: mood })
})

export { router as moodRoutes }
