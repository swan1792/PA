import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { NoteModel } from '../models/note'

const router = Router()

const updateNotesSchema = z.object({
  content: z.string(),
})

// Get notes
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const note = NoteModel.findByUserId(req.userId!)
  res.json({ data: note || { content: '' } })
})

// Update notes (upsert)
router.put('/', authenticate, (req: AuthRequest, res: Response) => {
  const { content } = updateNotesSchema.parse(req.body)
  const note = NoteModel.upsert(req.userId!, content)
  res.json({ data: note })
})

export { router as noteRoutes }
