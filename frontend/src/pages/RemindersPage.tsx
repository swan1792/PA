import { useEffect, useState } from 'react'
import { useReminderStore } from '../store/reminderStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function RemindersPage() {
  const { reminders, fetchReminders, addReminder, updateReminder, deleteReminder } = useReminderStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  useEffect(() => { fetchReminders() }, [])

  const handleAdd = async () => {
    if (!title.trim()) return
    await addReminder({ title: title.trim(), time, days: selectedDays.length > 0 ? selectedDays.join(',') : undefined })
    setTitle(''); setTime('09:00'); setSelectedDays([]); setIsModalOpen(false)
  }

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">⏰ Reminders</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Set up recurring reminders</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>New Reminder</Button>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-12"><p className="text-4xl mb-4">⏰</p><p className="text-gray-500">No reminders set</p></div>
        ) : (
          <div className="space-y-3">
            {reminders.map(r => (
              <Card key={r.id} className="flex items-center gap-4">
                <div className="text-2xl font-bold text-brand-600 w-16 text-center">{r.time}</div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${r.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>{r.title}</h3>
                  <p className="text-sm text-gray-500">{r.days ? r.days.split(',').map(d => DAY_LABELS[parseInt(d)] || d).join(', ') : 'Every day'}</p>
                </div>
                <button onClick={() => updateReminder(r.id, { isActive: !r.isActive })} className={`w-12 h-6 rounded-full transition-colors ${r.isActive ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${r.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => deleteReminder(r.id)} className="text-gray-400 hover:text-red-500 text-sm">Delete</button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Reminder">
        <div className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reminder title" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <input value={time} onChange={e => setTime(e.target.value)} type="time" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <div>
            <p className="text-sm text-gray-500 mb-2">Repeat on (empty = every day)</p>
            <div className="flex gap-2">
              {DAY_LABELS.map((d, i) => (
                <button key={i} onClick={() => toggleDay(String(i))} className={`w-10 h-10 rounded-full text-sm font-medium ${selectedDays.includes(String(i)) ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Reminder</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
