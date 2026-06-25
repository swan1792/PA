import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { TaskModel } from '../models/task'
import { AppError } from '../middleware/errorHandler'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
  categoryId: z.string().optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
  recurrenceEndDate: z.string().optional(),
  goalId: z.string().optional(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
  recurrenceEndDate: z.string().nullable().optional(),
  goalId: z.string().nullable().optional(),
})

// Get all tasks
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const tasks = TaskModel.findAll(req.userId!)
  res.json({ data: tasks })
})

// Get task stats
router.get('/stats', authenticate, (req: AuthRequest, res: Response) => {
  const stats = TaskModel.getStats(req.userId!)
  res.json({ data: stats })
})

// Get single task
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const task = TaskModel.findById(req.params.id, req.userId!)
  if (!task) {
    throw new AppError('Task not found', 404)
  }
  res.json({ data: task })
})

// Create task
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createTaskSchema.parse(req.body)
  const task = TaskModel.create({
    user_id: req.userId!,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    due_date: data.dueDate,
    category_id: data.categoryId,
    recurrence: data.recurrence,
    recurrence_end_date: data.recurrenceEndDate,
    goal_id: data.goalId,
  })
  res.status(201).json({ data: task })
})

// Update task
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const data = updateTaskSchema.parse(req.body)
  const task = TaskModel.update(req.params.id, req.userId!, {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    due_date: data.dueDate,
    category_id: data.categoryId,
    recurrence: data.recurrence,
    recurrence_end_date: data.recurrenceEndDate,
    goal_id: data.goalId,
  })
  if (!task) {
    throw new AppError('Task not found', 404)
  }
  res.json({ data: task })
})

// Delete task
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const deleted = TaskModel.delete(req.params.id, req.userId!)
  if (!deleted) {
    throw new AppError('Task not found', 404)
  }
  res.json({ success: true })
})

export { router as taskRoutes }
