import { useEffect } from 'react'
import { useAchievementStore } from '../store/achievementStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'

export default function AchievementsPage() {
  const { achievements, fetchAchievements, checkAchievements } = useAchievementStore()

  useEffect(() => { fetchAchievements(); checkAchievements() }, [])

  const earned = achievements.filter(a => a.earned)
  const locked = achievements.filter(a => !a.earned)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="page-header">
          <h1>🏆 Achievements</h1>
          <p>{earned.length}/{achievements.length} unlocked</p>
        </div>

        {/* Progress */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="text-3xl flex-shrink-0">🏆</div>
            <div className="flex-1">
              <div className="w-full h-2 bg-gray-100 dark:bg-[#2a2a40] rounded-full overflow-hidden">
                <div className="h-full bg-neo-primary rounded-full transition-all" style={{ width: `${achievements.length > 0 ? (earned.length / achievements.length) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-neo-muted mt-1">{achievements.length > 0 ? Math.round((earned.length / achievements.length) * 100) : 0}% complete</p>
            </div>
          </div>
        </Card>

        {/* Earned */}
        {earned.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-neo-text mb-3">✅ Earned</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {earned.map(a => (
                <Card key={a.id} padding="sm" className="flex items-center gap-3">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-neo-text">{a.name}</h3>
                    <p className="text-xs text-neo-muted">{a.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-neo-text mb-3">🔒 Locked</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {locked.map(a => (
                <Card key={a.id} padding="sm" className="flex items-center gap-3 opacity-60">
                  <span className="text-2xl grayscale">{a.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-neo-text">{a.name}</h3>
                    <p className="text-xs text-neo-muted">{a.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
