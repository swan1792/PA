import { useEffect, useState } from 'react'
import { useWorkoutStore } from '../store/workoutStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

const WORKOUT_TYPES = ['🏃 Cardio', '🏋️ Strength', '🧘 Flexibility', '🏊 Swimming', '🚴 Cycling', '⚽ Sports']

export default function WorkoutPage() {
  const { workouts, stats, fetchWorkouts, fetchStats, addWorkout, deleteWorkout, isLoading } = useWorkoutStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('strength')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => { fetchWorkouts(); fetchStats() }, [])

  const handleAdd = async () => {
    if (!name.trim()) return
    const today = new Date().toISOString().split('T')[0]
    await addWorkout({ name: name.trim(), type, duration: duration ? parseInt(duration) : undefined, notes: notes || undefined, date: today })
    setName(''); setDuration(''); setNotes(''); setIsModalOpen(false)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💪 Workouts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your fitness</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Log Workout</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-brand-600">{stats.weekWorkouts}</p>
            <p className="text-sm text-gray-500">This Week</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600">{workouts.length}</p>
            <p className="text-sm text-gray-500">Total Workouts</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-orange-600">🔥</p>
            <p className="text-sm text-gray-500">Keep Going!</p>
          </Card>
        </div>

        {/* Workout List */}
        {isLoading ? <div className="animate-pulse space-y-3">{[1, 2].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}</div>
        : workouts.length === 0 ? <div className="text-center py-12"><p className="text-4xl mb-4">🏋️</p><p className="text-gray-500">No workouts yet</p></div>
        : (
          <div className="space-y-3">
            {workouts.map(w => (
              <Card key={w.id} className="flex items-center gap-4">
                <span className="text-2xl">{WORKOUT_TYPES.find(t => t.toLowerCase().includes(w.type))?.split(' ')[0] || '🏃'}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{w.name}</h3>
                  <p className="text-sm text-gray-500">{new Date(w.date).toLocaleDateString()} {w.duration ? `· ${w.duration} min` : ''}</p>
                  {w.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{w.notes}</p>}
                </div>
                <button onClick={() => { if (confirm('Delete?')) deleteWorkout(w.id) }} className="text-gray-400 hover:text-red-500 text-sm">Delete</button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Workout">
        <div className="space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Workout name" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <div className="flex gap-2 flex-wrap">
            {WORKOUT_TYPES.map(t => {
              const key = t.split(' ')[1].toLowerCase()
              return <button key={key} onClick={() => setType(key)} className={`px-3 py-1.5 rounded-lg text-sm ${type === key ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{t}</button>
            })}
          </div>
          <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (min)" type="number" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Workout</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
