import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { TagModel } from '../models/tag'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()
const createSchema = z.object({ name: z.string().min(1).max(50), color: z.string().optional() })

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const tags = await TagModel.findAll(req.userId!)
  res.json({ data: tags })
}))
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  const tag = await TagModel.create({ user_id: req.userId!, ...data })
  res.status(201).json({ data: tag })
}))
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  await TagModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
}))
router.post('/task/:taskId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tagId } = req.body
  await TagModel.addToTask(req.params.taskId, tagId)
  res.json({ success: true })
}))
router.delete('/task/:taskId/:tagId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  await TagModel.removeFromTask(req.params.taskId, req.params.tagId)
  res.json({ success: true })
}))

export { router as tagRoutes }
