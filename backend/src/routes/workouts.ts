import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { WorkoutModel } from '../models/workout'
import { AppError } from '../middleware/errorHandler'

const router = Router()
const createWorkoutSchema = z.object({ name: z.string().min(1), type: z.string().optional(), duration: z.number().optional(), notes: z.string().optional(), date: z.string() })
const addSetSchema = z.object({ exercise: z.string().min(1), reps: z.number().optional(), weight: z.number().optional(), duration: z.number().optional() })

router.get('/', authenticate, (req: AuthRequest, res: Response) => { res.json({ data: WorkoutModel.findAll(req.userId!) }) })
router.get('/stats', authenticate, (req: AuthRequest, res: Response) => { res.json({ data: WorkoutModel.getStats(req.userId!) }) })
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const w = WorkoutModel.findById(req.params.id, req.userId!)
  if (!w) throw new AppError('Workout not found', 404)
  const sets = WorkoutModel.getSets(req.params.id)
  res.json({ data: { ...w, sets } })
})
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createWorkoutSchema.parse(req.body)
  res.status(201).json({ data: WorkoutModel.create({ user_id: req.userId!, ...data }) })
})
router.post('/:id/sets', authenticate, (req: AuthRequest, res: Response) => {
  const data = addSetSchema.parse(req.body)
  res.json({ data: WorkoutModel.addSet(req.params.id, data) })
})
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  WorkoutModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
})

export { router as workoutRoutes }
