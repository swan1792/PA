import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { WorkoutModel } from '../models/workout'
import { AppError } from '../middleware/errorHandler'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()
const createWorkoutSchema = z.object({ name: z.string().min(1), type: z.string().optional(), duration: z.number().optional(), notes: z.string().optional(), date: z.string() })
const addSetSchema = z.object({ exercise: z.string().min(1), reps: z.number().optional(), weight: z.number().optional(), duration: z.number().optional() })

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const workouts = await WorkoutModel.findAll(req.userId!)
  res.json({ data: workouts })
}))
router.get('/stats', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await WorkoutModel.getStats(req.userId!)
  res.json({ data: stats })
}))
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const w = await WorkoutModel.findById(req.params.id, req.userId!)
  if (!w) throw new AppError('Workout not found', 404)
  const sets = await WorkoutModel.getSets(req.params.id)
  res.json({ data: { ...w, sets } })
}))
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createWorkoutSchema.parse(req.body)
  const workout = await WorkoutModel.create({ user_id: req.userId!, ...data })
  res.status(201).json({ data: workout })
}))
router.post('/:id/sets', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = addSetSchema.parse(req.body)
  const set = await WorkoutModel.addSet(req.params.id, data)
  res.json({ data: set })
}))
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  await WorkoutModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
}))

export { router as workoutRoutes }
