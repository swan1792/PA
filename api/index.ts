import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../backend/src/index'
import { initDB } from '../backend/src/db'
import { seedAchievements } from '../backend/src/models/achievement'

let initialized = false

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!initialized) {
    await initDB()
    await seedAchievements()
    initialized = true
  }
  return app(req, res)
}
