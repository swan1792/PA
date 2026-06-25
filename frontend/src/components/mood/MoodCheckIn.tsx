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

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {todayMood ? '😊 Today\'s Mood' : '📝 How are you feeling?'}
      </h3>

      {/* Mood Selector */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mood</p>
        <div className="flex justify-between">
          {MOOD_EMOJIS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={clsx(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                mood === m.value ? 'bg-brand-100 dark:bg-brand-900/30 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-gray-500">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Energy</p>
          <span className="text-sm font-medium text-brand-600">{energy}/5</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={energy}
          onChange={(e) => setEnergy(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Exhausted</span>
          <span>Energized</span>
        </div>
      </div>

      {/* Note */}
      <div className="mb-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)..."
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className={clsx(
          'w-full py-2 rounded-lg text-sm font-medium transition-all',
          saved ? 'bg-green-500 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'
        )}
      >
        {saved ? '✓ Saved!' : todayMood ? 'Update' : 'Check In'}
      </button>
    </Card>
  )
}
