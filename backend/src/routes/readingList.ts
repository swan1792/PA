import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { ReadingListModel } from '../models/readingList'

const router = Router()
const createSchema = z.object({ title: z.string().min(1), url: z.string().url(), description: z.string().optional() })

router.get('/', authenticate, (req: AuthRequest, res: Response) => { res.json({ data: ReadingListModel.findAll(req.userId!) }) })
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  res.status(201).json({ data: ReadingListModel.create({ user_id: req.userId!, ...data }) })
})
router.post('/:id/toggle', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ data: ReadingListModel.toggleRead(req.params.id, req.userId!) })
})
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  ReadingListModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
})

export { router as readingListRoutes }
