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
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>💪 Workouts</h1>
              <p>Track your fitness</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Log Workout</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-2xl font-bold text-neo-primary">{stats.weekWorkouts}</p>
            <p className="text-xs text-neo-muted mt-0.5">This Week</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{workouts.length}</p>
            <p className="text-xs text-neo-muted mt-0.5">Total Workouts</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl">🔥</p>
            <p className="text-xs text-neo-muted mt-0.5">Keep Going!</p>
          </Card>
        </div>

        {/* Workout List */}
        {isLoading ? <div className="animate-pulse space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-[#2a2a40] rounded-xl" />)}</div>
        : workouts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#2a2a40] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏋️</span>
            </div>
            <p className="text-neo-textSecondary text-sm mb-4">No workouts yet</p>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>Log your first workout</Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {workouts.map(w => (
              <Card key={w.id} padding="sm" className="flex items-center gap-4">
                <span className="text-xl">{WORKOUT_TYPES.find(t => t.toLowerCase().includes(w.type))?.split(' ')[0] || '🏃'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-neo-text">{w.name}</h3>
                  <p className="text-xs text-neo-muted">{new Date(w.date).toLocaleDateString()} {w.duration ? `· ${w.duration} min` : ''}</p>
                  {w.notes && <p className="text-sm text-neo-textSecondary mt-1">{w.notes}</p>}
                </div>
                <button onClick={() => { if (confirm('Delete?')) deleteWorkout(w.id) }} className="text-xs text-neo-muted hover:text-neo-danger px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0">Delete</button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Workout">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Workout Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning Run" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1.5">Type</label>
            <div className="flex gap-2 flex-wrap">
              {WORKOUT_TYPES.map(t => {
                const key = t.split(' ')[1].toLowerCase()
                return <button key={key} onClick={() => setType(key)} className={type === key ? 'pill-active' : 'pill-inactive'}>{t}</button>
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Duration <span className="text-neo-muted font-normal">(minutes, optional)</span></label>
            <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" type="number" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Notes <span className="text-neo-muted font-normal">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it feel?" rows={2} className="input resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Workout</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
