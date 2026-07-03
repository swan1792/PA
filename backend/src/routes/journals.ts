import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { JournalModel } from '../models/journal'
import { AppError } from '../middleware/errorHandler'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

const createSchema = z.object({ title: z.string().optional(), content: z.string().min(1), mood: z.number().int().min(1).max(5).optional(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
const updateSchema = z.object({ title: z.string().optional(), content: z.string().min(1).optional(), mood: z.number().int().min(1).max(5).optional() })

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const journals = await JournalModel.findAll(req.userId!)
  res.json({ data: journals })
}))
router.get('/:date', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const journal = await JournalModel.findByDate(req.userId!, req.params.date)
  res.json({ data: journal || null })
}))
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  const journal = await JournalModel.create({ user_id: req.userId!, ...data })
  res.status(201).json({ data: journal })
}))
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateSchema.parse(req.body)
  const journal = await JournalModel.update(req.params.id, req.userId!, data)
  if (!journal) throw new AppError('Journal not found', 404)
  res.json({ data: journal })
}))
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  await JournalModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
}))

export { router as journalRoutes }
