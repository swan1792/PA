import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { ExpenseModel } from '../models/expense'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()
const createSchema = z.object({ amount: z.number().positive(), category: z.string().min(1), description: z.string().optional(), date: z.string() })

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const expenses = await ExpenseModel.findAll(req.userId!)
  res.json({ data: expenses })
}))
router.get('/stats', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const startDate = (req.query.startDate as string) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const endDate = (req.query.endDate as string) || new Date().toISOString().split('T')[0]
  const stats = await ExpenseModel.getStats(req.userId!, startDate, endDate)
  res.json({ data: stats })
}))
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  const expense = await ExpenseModel.create({ user_id: req.userId!, ...data })
  res.status(201).json({ data: expense })
}))
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  await ExpenseModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
}))

export { router as expenseRoutes }
