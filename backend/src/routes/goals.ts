import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { GoalModel } from '../models/goal'
import { AppError } from '../middleware/errorHandler'

const router = Router()

const createGoalSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  targetDate: z.string().optional(),
})

const updateGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  targetDate: z.string().nullable().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).optional(),
  progress: z.number().min(0).max(100).optional(),
})

// Get all goals with stats
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const goals = GoalModel.getWithStats(req.userId!)
  res.json({ data: goals })
})

// Get single goal
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const goal = GoalModel.findById(req.params.id, req.userId!)
  if (!goal) throw new AppError('Goal not found', 404)
  res.json({ data: goal })
})

// Create goal
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createGoalSchema.parse(req.body)
  const goal = GoalModel.create({
    user_id: req.userId!,
    title: data.title,
    description: data.description,
    target_date: data.targetDate,
  })
  res.status(201).json({ data: goal })
})

// Update goal
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const data = updateGoalSchema.parse(req.body)
  const goal = GoalModel.update(req.params.id, req.userId!, {
    title: data.title,
    description: data.description,
    target_date: data.targetDate,
    status: data.status,
    progress: data.progress,
  })
  if (!goal) throw new AppError('Goal not found', 404)
  res.json({ data: goal })
})

// Delete goal
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const deleted = GoalModel.delete(req.params.id, req.userId!)
  if (!deleted) throw new AppError('Goal not found', 404)
  res.json({ success: true })
})

export { router as goalRoutes }
