import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { NoteModel } from '../models/note'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

const updateNotesSchema = z.object({
  content: z.string(),
})

// Get notes
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await NoteModel.findByUserId(req.userId!)
  res.json({ data: note || { content: '' } })
}))

// Update notes (upsert)
router.put('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { content } = updateNotesSchema.parse(req.body)
  const note = await NoteModel.upsert(req.userId!, content)
  res.json({ data: note })
}))

export { router as noteRoutes }
