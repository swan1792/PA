import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { TagModel } from '../models/tag'

const router = Router()
const createSchema = z.object({ name: z.string().min(1).max(50), color: z.string().optional() })

router.get('/', authenticate, (req: AuthRequest, res: Response) => { res.json({ data: TagModel.findAll(req.userId!) }) })
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  res.status(201).json({ data: TagModel.create({ user_id: req.userId!, ...data }) })
})
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  TagModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
})
router.post('/task/:taskId', authenticate, (req: AuthRequest, res: Response) => {
  const { tagId } = req.body
  TagModel.addToTask(req.params.taskId, tagId)
  res.json({ success: true })
})
router.delete('/task/:taskId/:tagId', authenticate, (req: AuthRequest, res: Response) => {
  TagModel.removeFromTask(req.params.taskId, req.params.tagId)
  res.json({ success: true })
})

export { router as tagRoutes }
