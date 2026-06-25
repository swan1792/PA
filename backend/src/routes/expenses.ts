import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { ExpenseModel } from '../models/expense'

const router = Router()
const createSchema = z.object({ amount: z.number().positive(), category: z.string().min(1), description: z.string().optional(), date: z.string() })

router.get('/', authenticate, (req: AuthRequest, res: Response) => { res.json({ data: ExpenseModel.findAll(req.userId!) }) })
router.get('/stats', authenticate, (req: AuthRequest, res: Response) => {
  const startDate = (req.query.startDate as string) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const endDate = (req.query.endDate as string) || new Date().toISOString().split('T')[0]
  res.json({ data: ExpenseModel.getStats(req.userId!, startDate, endDate) })
})
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  res.status(201).json({ data: ExpenseModel.create({ user_id: req.userId!, ...data }) })
})
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  ExpenseModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
})

export { router as expenseRoutes }
