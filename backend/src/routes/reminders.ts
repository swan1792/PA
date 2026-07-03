import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { getDB } from '../db'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()
const createSchema = z.object({ title: z.string().min(1), time: z.string(), days: z.string().optional(), is_active: z.boolean().optional() })

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await getDB().execute({
    sql: 'SELECT * FROM reminders WHERE user_id = ? ORDER BY time',
    args: [req.userId!]
  })
  const results = result.rows.map(row => ({
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    time: row.time as string,
    days: row.days as string | null,
    is_active: row.is_active as number,
    created_at: row.created_at as string,
  }))
  res.json({ data: results })
}))

router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  const id = crypto.randomUUID()
  await getDB().execute({
    sql: 'INSERT INTO reminders (id, user_id, title, time, days, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, req.userId!, data.title, data.time, data.days || null, data.is_active !== false ? 1 : 0]
  })
  res.status(201).json({ data: { id, ...data } })
}))

router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createSchema.partial().parse(req.body)
  const updates: string[] = []
  const values: any[] = []
  if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title) }
  if (data.time !== undefined) { updates.push('time = ?'); values.push(data.time) }
  if (data.days !== undefined) { updates.push('days = ?'); values.push(data.days) }
  if (data.is_active !== undefined) { updates.push('is_active = ?'); values.push(data.is_active ? 1 : 0) }
  if (updates.length === 0) return res.json({ success: true })
  values.push(req.params.id, req.userId!)
  await getDB().execute({ sql: `UPDATE reminders SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, args: values })
  res.json({ success: true })
}))

router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  await getDB().execute({ sql: 'DELETE FROM reminders WHERE id = ? AND user_id = ?', args: [req.params.id, req.userId!] })
  res.json({ success: true })
}))

export { router as reminderRoutes }
