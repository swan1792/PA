import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { BudgetModel } from '../models/budget'
import { AppError } from '../middleware/errorHandler'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

const upsertSchema = z.object({
  category: z.string().default(''),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM'),
  amount: z.number().positive(),
})

// Get budgets with spending for a month
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const month = (req.query.month as string) || new Date().toISOString().slice(0, 7)
  const budgets = await BudgetModel.findWithSpending(req.userId!, month)
  res.json({ data: budgets })
}))

// Create or update a budget
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = upsertSchema.parse(req.body)
  const budget = await BudgetModel.upsert({
    user_id: req.userId!,
    category: data.category,
    month: data.month,
    amount: data.amount,
  })
  res.json({ data: budget })
}))

// Delete a budget
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const deleted = await BudgetModel.delete(req.params.id, req.userId!)
  if (!deleted) throw new AppError('Budget not found', 404)
  res.json({ success: true })
}))

export { router as budgetRoutes }
