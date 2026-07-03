import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AchievementModel } from '../models/achievement'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const all = await AchievementModel.getAll()
  const earned = new Set((await AchievementModel.getUserAchievements(req.userId!)).map(a => a.id))
  res.json({
    data: all.map(a => ({ ...a, earned: earned.has(a.id) })),
  })
}))

router.get('/earned', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const earned = await AchievementModel.getUserAchievements(req.userId!)
  res.json({ data: earned })
}))

router.post('/check', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const newlyEarned = await AchievementModel.checkAndAward(req.userId!)
  res.json({ data: newlyEarned })
}))

export { router as achievementRoutes }
