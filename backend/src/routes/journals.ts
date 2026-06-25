import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { JournalModel } from '../models/journal'
import { AppError } from '../middleware/errorHandler'

const router = Router()

const createSchema = z.object({ title: z.string().optional(), content: z.string().min(1), mood: z.number().int().min(1).max(5).optional(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
const updateSchema = z.object({ title: z.string().optional(), content: z.string().min(1).optional(), mood: z.number().int().min(1).max(5).optional() })

router.get('/', authenticate, (req: AuthRequest, res: Response) => { res.json({ data: JournalModel.findAll(req.userId!) }) })
router.get('/:date', authenticate, (req: AuthRequest, res: Response) => {
  const journal = JournalModel.findByDate(req.userId!, req.params.date)
  res.json({ data: journal || null })
})
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  res.status(201).json({ data: JournalModel.create({ user_id: req.userId!, ...data }) })
})
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const data = updateSchema.parse(req.body)
  const journal = JournalModel.update(req.params.id, req.userId!, data)
  if (!journal) throw new AppError('Journal not found', 404)
  res.json({ data: journal })
})
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  JournalModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
})

export { router as journalRoutes }
