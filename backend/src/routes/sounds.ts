import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// Ambient sound definitions (client-side audio, server just provides metadata)
const SOUNDS = [
  { id: 'rain', name: 'Rain', icon: '🌧️', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: 'thunder', name: 'Thunderstorm', icon: '⛈️', url: 'https://cdn.pixabay.com/audio/2022/10/30/audio_ee93a4c79d.mp3' },
  { id: 'forest', name: 'Forest', icon: '🌲', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_09e1b5cb75.mp3' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', url: 'https://cdn.pixabay.com/audio/2022/05/23/audio_1535cac6d2.mp3' },
  { id: 'cafe', name: 'Café', icon: '☕', url: 'https://cdn.pixabay.com/audio/2023/07/07/audio_8a95c1e2a3.mp3' },
  { id: 'fireplace', name: 'Fireplace', icon: '🔥', url: 'https://cdn.pixabay.com/audio/2022/11/22/audio_f40cc29c3c.mp3' },
  { id: 'wind', name: 'Wind', icon: '💨', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_d8eb0c85ca.mp3' },
  { id: 'birds', name: 'Birds', icon: '🐦', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
]

// Get available sounds
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ data: SOUNDS })
})

export { router as soundRoutes }
