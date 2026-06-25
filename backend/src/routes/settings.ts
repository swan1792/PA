import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { getDB, saveDB } from '../db'

const router = Router()
const settingsSchema = z.object({ theme: z.enum(['system', 'light', 'dark']).optional(), accent_color: z.string().optional() })

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const stmt = getDB().prepare('SELECT * FROM user_settings WHERE user_id = ?')
  stmt.bind([req.userId!])
  if (stmt.step()) {
    const v = stmt.get(); stmt.free()
    res.json({ data: { theme: v[1] || 'system', accent_color: v[2] || '#7c3aed', hasPin: !!v[3] } })
  } else {
    stmt.free()
    res.json({ data: { theme: 'system', accent_color: '#7c3aed', hasPin: false } })
  }
})

router.put('/', authenticate, (req: AuthRequest, res: Response) => {
  const data = settingsSchema.parse(req.body)
  const db = getDB()
  const existing = db.exec('SELECT user_id FROM user_settings WHERE user_id = ?', [req.userId!])
  if (existing[0]?.values[0]) {
    const updates: string[] = []; const values: any[] = []
    if (data.theme !== undefined) { updates.push('theme = ?'); values.push(data.theme) }
    if (data.accent_color !== undefined) { updates.push('accent_color = ?'); values.push(data.accent_color) }
    if (updates.length > 0) {
      values.push(req.userId!)
      db.run(`UPDATE user_settings SET ${updates.join(', ')}, updated_at = datetime('now') WHERE user_id = ?`, values)
    }
  } else {
    db.run('INSERT INTO user_settings (user_id, theme, accent_color) VALUES (?, ?, ?)',
      [req.userId!, data.theme || 'system', data.accent_color || '#7c3aed'])
  }
  saveDB()
  res.json({ success: true })
})

export { router as settingsRoutes }
