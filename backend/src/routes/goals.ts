import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { GoalModel } from '../models/goal'
import { AppError } from '../middleware/errorHandler'
import { asyncHandler } from '../utils/asyncHandler'

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
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const goals = await GoalModel.getWithStats(req.userId!)
  res.json({ data: goals })
}))

// Get single goal
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const goal = await GoalModel.findById(req.params.id, req.userId!)
  if (!goal) throw new AppError('Goal not found', 404)
  res.json({ data: goal })
}))

// Create goal
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createGoalSchema.parse(req.body)
  const goal = await GoalModel.create({
    user_id: req.userId!,
    title: data.title,
    description: data.description,
    target_date: data.targetDate,
  })
  res.status(201).json({ data: goal })
}))

// Update goal
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateGoalSchema.parse(req.body)
  const goal = await GoalModel.update(req.params.id, req.userId!, {
    title: data.title,
    description: data.description,
    target_date: data.targetDate,
    status: data.status,
    progress: data.progress,
  })
  if (!goal) throw new AppError('Goal not found', 404)
  res.json({ data: goal })
}))

// Delete goal
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const deleted = await GoalModel.delete(req.params.id, req.userId!)
  if (!deleted) throw new AppError('Goal not found', 404)
  res.json({ success: true })
}))

export { router as goalRoutes }
