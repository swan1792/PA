import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AchievementModel } from '../models/achievement'

const router = Router()

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const all = AchievementModel.getAll()
  const earned = new Set(AchievementModel.getUserAchievements(req.userId!).map(a => a.id))
  res.json({
    data: all.map(a => ({ ...a, earned: earned.has(a.id) })),
  })
})

router.get('/earned', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ data: AchievementModel.getUserAchievements(req.userId!) })
})

router.post('/check', authenticate, (req: AuthRequest, res: Response) => {
  const newlyEarned = AchievementModel.checkAndAward(req.userId!)
  res.json({ data: newlyEarned })
})

export { router as achievementRoutes }
