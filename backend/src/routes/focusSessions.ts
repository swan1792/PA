import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { FocusSessionModel } from '../models/focusSession'
import { AppError } from '../middleware/errorHandler'

const router = Router()

const createSessionSchema = z.object({
  taskId: z.string().optional(),
  duration: z.number().int().min(1).max(120).default(25),
  type: z.enum(['focus', 'break']).default('focus'),
})

// Get recent sessions
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
  const sessions = FocusSessionModel.findAll(req.userId!, limit)
  res.json({ data: sessions })
})

// Get today's sessions
router.get('/today', authenticate, (req: AuthRequest, res: Response) => {
  const sessions = FocusSessionModel.findToday(req.userId!)
  res.json({ data: sessions })
})

// Get focus stats
router.get('/stats', authenticate, (req: AuthRequest, res: Response) => {
  const stats = FocusSessionModel.getStats(req.userId!)
  res.json({ data: stats })
})

// Start a new session
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createSessionSchema.parse(req.body)
  const session = FocusSessionModel.create({
    user_id: req.userId!,
    task_id: data.taskId,
    duration: data.duration,
    type: data.type,
  })
  res.status(201).json({ data: session })
})

// Complete a session
router.post('/:id/complete', authenticate, (req: AuthRequest, res: Response) => {
  const session = FocusSessionModel.complete(req.params.id, req.userId!)
  if (!session) throw new AppError('Session not found', 404)
  res.json({ data: session })
})

export { router as focusSessionRoutes }
