import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { getDB, saveDB } from '../db'
import { AppError } from '../middleware/errorHandler'

const router = Router()
const createSchema = z.object({ title: z.string().min(1), time: z.string(), days: z.string().optional(), is_active: z.boolean().optional() })

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const stmt = getDB().prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY time')
  stmt.bind([req.userId!])
  const results: any[] = []
  while (stmt.step()) { const v = stmt.get(); results.push({ id: v[0], user_id: v[1], title: v[2], time: v[3], days: v[4], is_active: v[5], created_at: v[6] }) }
  stmt.free()
  res.json({ data: results })
})

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = createSchema.parse(req.body)
  const id = crypto.randomUUID()
  getDB().run('INSERT INTO reminders (id, user_id, title, time, days, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    [id, req.userId!, data.title, data.time, data.days || null, data.is_active !== false ? 1 : 0])
  saveDB()
  res.status(201).json({ data: { id, ...data } })
})

router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const data = createSchema.partial().parse(req.body)
  const updates: string[] = []; const values: any[] = []
  if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title) }
  if (data.time !== undefined) { updates.push('time = ?'); values.push(data.time) }
  if (data.days !== undefined) { updates.push('days = ?'); values.push(data.days) }
  if (data.is_active !== undefined) { updates.push('is_active = ?'); values.push(data.is_active ? 1 : 0) }
  if (updates.length === 0) return res.json({ success: true })
  values.push(req.params.id, req.userId!)
  getDB().run(`UPDATE reminders SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, values)
  saveDB()
  res.json({ success: true })
})

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  getDB().run('DELETE FROM reminders WHERE id = ? AND user_id = ?', [req.params.id, req.userId!])
  saveDB()
  res.json({ success: true })
})

export { router as reminderRoutes }
