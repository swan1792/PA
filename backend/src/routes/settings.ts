import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { getDB } from '../db'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()
const settingsSchema = z.object({ theme: z.enum(['system', 'light', 'dark']).optional(), accent_color: z.string().optional() })

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await getDB().execute({
    sql: 'SELECT * FROM user_settings WHERE user_id = ?',
    args: [req.userId!]
  })
  if (result.rows.length > 0) {
    const row = result.rows[0]
    res.json({ data: { theme: row.theme || 'system', accent_color: row.accent_color || '#7c3aed', hasPin: !!row.pin_hash } })
  } else {
    res.json({ data: { theme: 'system', accent_color: '#7c3aed', hasPin: false } })
  }
}))

router.put('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = settingsSchema.parse(req.body)
  const db = getDB()
  const existing = await db.execute({
    sql: 'SELECT user_id FROM user_settings WHERE user_id = ?',
    args: [req.userId!]
  })
  if (existing.rows.length > 0) {
    const updates: string[] = []
    const values: any[] = []
    if (data.theme !== undefined) { updates.push('theme = ?'); values.push(data.theme) }
    if (data.accent_color !== undefined) { updates.push('accent_color = ?'); values.push(data.accent_color) }
    if (updates.length > 0) {
      values.push(req.userId!)
      await db.execute({ sql: `UPDATE user_settings SET ${updates.join(', ')}, updated_at = datetime('now') WHERE user_id = ?`, args: values })
    }
  } else {
    await db.execute({
      sql: 'INSERT INTO user_settings (user_id, theme, accent_color) VALUES (?, ?, ?)',
      args: [req.userId!, data.theme || 'system', data.accent_color || '#7c3aed']
    })
  }
  res.json({ success: true })
}))

export { router as settingsRoutes }
