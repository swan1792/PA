import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { HabitModel } from '../models/habit'
import { AppError } from '../middleware/errorHandler'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  frequency: z.enum(['daily', 'specific']).default('daily'),
  specificDays: z.array(z.enum(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])).optional(),
  category: z.string().max(50).default('general'),
  goalId: z.string().optional(),
})

const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  frequency: z.enum(['daily', 'specific']).optional(),
  specificDays: z.array(z.enum(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])).optional(),
  category: z.string().max(50).optional(),
  goalId: z.string().nullable().optional(),
})

const toggleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

// Get all habits (with last 7 days of completions)
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const habits = await HabitModel.findWithCompletions(req.userId!)
  res.json({ data: habits })
}))

// Create habit
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createHabitSchema.parse(req.body)
  const habit = await HabitModel.create({
    user_id: req.userId!,
    name: data.name,
    frequency: data.frequency,
    specific_days: data.specificDays,
    category: data.category,
    goal_id: data.goalId,
  })
  res.status(201).json({ data: habit })
}))

// Toggle completion for a date
router.post('/:id/toggle', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date } = toggleSchema.parse(req.body)
  const result = await HabitModel.toggleCompletion(req.params.id, req.userId!, date)
  res.json({ data: result })
}))

// Update habit
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateHabitSchema.parse(req.body)
  const habit = await HabitModel.update(req.params.id, req.userId!, {
    name: data.name,
    frequency: data.frequency,
    specific_days: data.specificDays,
    category: data.category,
    goal_id: data.goalId,
  })
  if (!habit) {
    throw new AppError('Habit not found', 404)
  }
  res.json({ data: habit })
}))

// Delete habit
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const deleted = await HabitModel.delete(req.params.id, req.userId!)
  if (!deleted) {
    throw new AppError('Habit not found', 404)
  }
  res.json({ success: true })
}))

export { router as habitRoutes }
