import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { IdeaModel } from '../models/idea'
import { AppError } from '../middleware/errorHandler'

const router = Router()
const createSchema = z.object({ content: z.string().min(1), color: z.string().optional(), position_x: z.number().optional(), position_y: z.number().optional() })
const updateSchema = z.object({ content: z.string().optional(), color: z.string().optional(), position_x: z.number().optional(), position_y: z.number().optional() })

router.get('/', authenticate, (req: AuthRequest, res: Response) => { res.json({ data: IdeaModel.findAll(req.userId!) }) })
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  res.status(201).json({ data: IdeaModel.create({ user_id: req.userId!, ...data }) })
})
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const data = updateSchema.parse(req.body)
  const idea = IdeaModel.update(req.params.id, req.userId!, data)
  if (!idea) throw new AppError('Idea not found', 404)
  res.json({ data: idea })
})
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  IdeaModel.delete(req.params.id, req.userId!)
  res.json({ success: true })
})

export { router as ideaRoutes }
