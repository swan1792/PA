import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { ReadingListModel } from '../models/readingList'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()
const createSchema = z.object({ title: z.string().min(1), url: z.string().url(), description: z.string().optional() })

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await ReadingListModel.findAll(req.userId!)
  res.json({ data: items })
}))
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  const item = await ReadingListModel.create({ user_id: req.userId!, ...data })
  res.status(201).json({ data: item })
}))
router.post('/:id/toggle', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await ReadingListModel.toggleRead(req.params.id, req.userId!)
  res.json({ data: item })
}))
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  await ReadingListModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
}))

export { router as readingListRoutes }
