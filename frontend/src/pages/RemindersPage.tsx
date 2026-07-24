import { useEffect, useState } from 'react'
import { useReminderStore } from '../store/reminderStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { clsx } from 'clsx'

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
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>⏰ Reminders</h1>
              <p>Set up recurring reminders</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>New Reminder</Button>
          </div>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#2a2a40] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <p className="text-neo-textSecondary text-sm">No reminders set</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {reminders.map(r => (
              <Card key={r.id} padding="sm" className="flex items-center gap-4">
                <div className="text-lg font-bold text-neo-primary w-14 text-center flex-shrink-0">{r.time}</div>
                <div className="flex-1 min-w-0">
                  <h3 className={clsx('text-sm font-medium', r.isActive ? 'text-neo-text' : 'text-neo-muted line-through')}>{r.title}</h3>
                  <p className="text-xs text-neo-muted">{r.days ? r.days.split(',').map(d => DAY_LABELS[parseInt(d)] || d).join(', ') : 'Every day'}</p>
                </div>
                <button
                  onClick={() => updateReminder(r.id, { isActive: !r.isActive })}
                  className={clsx('w-10 h-5 rounded-full transition-colors relative flex-shrink-0', r.isActive ? 'bg-neo-primary' : 'bg-gray-200 dark:bg-gray-600')}
                >
                  <div className={clsx('w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5', r.isActive ? 'translate-x-5.5 left-0.5' : 'translate-x-0.5 left-0.5')} />
                </button>
                <button onClick={() => deleteReminder(r.id)} className="text-xs text-neo-muted hover:text-neo-danger px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">Delete</button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Reminder">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reminder title" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Time</label>
            <input value={time} onChange={e => setTime(e.target.value)} type="time" className="input" />
          </div>
          <div>
            <p className="text-sm font-medium text-neo-text mb-1.5">Repeat on</p>
            <div className="flex gap-2">
              {DAY_LABELS.map((d, i) => (
                <button key={i} onClick={() => toggleDay(String(i))} className={clsx('w-9 h-9 rounded-full text-xs font-medium transition-colors', selectedDays.includes(String(i)) ? 'bg-neo-primary text-white' : 'bg-gray-100 dark:bg-[#2a2a40] text-neo-textSecondary hover:bg-gray-200 dark:hover:bg-[#33334a]')}>{d}</button>
              ))}
            </div>
            <p className="text-xs text-neo-muted mt-1.5">Empty = every day</p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Reminder</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
