import { useState, useEffect } from 'react'
import { useMoodStore } from '../../store/moodStore'
import Card from '../ui/Card'
import { clsx } from 'clsx'

const MOOD_EMOJIS = [
  { value: 1, emoji: '😢', label: 'Awful' },
  { value: 2, emoji: '😟', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]

const GRADIENT_BG = 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500'

export default function MoodCheckIn() {
  const { todayMood, fetchTodayMood, saveMood } = useMoodStore()
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchTodayMood()
  }, [])

  useEffect(() => {
    if (todayMood) {
      setMood(todayMood.mood)
      setEnergy(todayMood.energy)
      setNote(todayMood.note || '')
    }
  }, [todayMood])

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0]
    await saveMood({ mood, energy, note: note || undefined, date: today })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const currentMoodEmoji = MOOD_EMOJIS.find(m => m.value === mood)

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Gradient header bar */}
      <div className={clsx(GRADIENT_BG, 'px-5 py-4')}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {todayMood ? "Today's Mood" : 'How are you feeling?'}
            </h3>
            <p className="text-sm text-white/80 mt-0.5">
              {todayMood ? 'Tap to update your check-in' : 'Check in to track your wellbeing'}
            </p>
          </div>
          <span className="text-3xl filter drop-shadow-lg animate-bounce-slow">
            {currentMoodEmoji?.emoji || '😊'}
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Mood Selector */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Mood</p>
          <div className="flex justify-between gap-1">
            {MOOD_EMOJIS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={clsx(
                  'flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 flex-1',
                  mood === m.value
                    ? 'bg-purple-100 dark:bg-purple-900/30 scale-110 shadow-sm ring-2 ring-purple-400 dark:ring-purple-500'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 opacity-70 hover:opacity-100'
                )}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className={clsx(
                  'text-[10px] font-medium',
                  mood === m.value ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500'
                )}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Energy</p>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{energy}/5</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>😴 Exhausted</span>
            <span>⚡ Energized</span>
          </div>
        </div>

        {/* Note */}
        <div className="mb-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about your day (optional)..."
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
          />
        </div>

        <button
          onClick={handleSave}
          className={clsx(
            'w-full py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm',
            saved
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-md active:scale-[0.98]'
          )}
        >
          {saved ? '✓ Saved!' : todayMood ? '🔄 Update Check-In' : '💜 Check In'}
        </button>
      </div>
    </Card>
  )
}
