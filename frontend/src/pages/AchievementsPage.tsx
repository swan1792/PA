import { useEffect } from 'react'
import { useAchievementStore } from '../store/achievementStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'

export default function AchievementsPage() {
  const { achievements, fetchAchievements, checkAchievements, isLoading } = useAchievementStore()

  useEffect(() => { fetchAchievements(); checkAchievements() }, [])

  const earned = achievements.filter(a => a.earned)
  const locked = achievements.filter(a => !a.earned)

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🏆 Achievements</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{earned.length}/{achievements.length} unlocked</p>
        </div>

        {/* Progress */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${achievements.length > 0 ? (earned.length / achievements.length) * 100 : 0}%` }} />
              </div>
              <p className="text-sm text-gray-500 mt-1">{achievements.length > 0 ? Math.round((earned.length / achievements.length) * 100) : 0}% complete</p>
            </div>
          </div>
        </Card>

        {/* Earned */}
        {earned.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">✅ Earned</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {earned.map(a => (
                <Card key={a.id} className="flex items-center gap-4">
                  <span className="text-3xl">{a.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{a.name}</h3>
                    <p className="text-sm text-gray-500">{a.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔒 Locked</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {locked.map(a => (
                <Card key={a.id} className="flex items-center gap-4 opacity-60">
                  <span className="text-3xl grayscale">{a.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{a.name}</h3>
                    <p className="text-sm text-gray-500">{a.description}</p>
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
