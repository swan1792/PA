import { useEffect, useState } from 'react'
import { useJournalStore } from '../store/journalStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { clsx } from 'clsx'

const MOOD_EMOJIS = ['', '😢', '😟', '😐', '🙂', '😄']

export default function JournalPage() {
  const { journals, fetchJournals, addJournal, updateJournal, deleteJournal, isLoading } = useJournalStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState<number | undefined>()
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => { fetchJournals() }, [])

  const handleSave = async () => {
    if (!content.trim()) return
    const today = new Date().toISOString().split('T')[0]
    if (editId) {
      await updateJournal(editId, { title: title || undefined, content, mood })
    } else {
      await addJournal({ title: title || undefined, content, mood, date: today })
    }
    resetForm()
  }

  const handleEdit = (j: typeof journals[0]) => {
    setEditId(j.id); setTitle(j.title || ''); setContent(j.content); setMood(j.mood || undefined)
    setIsModalOpen(true)
  }

  const resetForm = () => { setTitle(''); setContent(''); setMood(undefined); setEditId(null); setIsModalOpen(false) }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>📝 Journal</h1>
              <p>Write daily reflections</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>New Entry</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 dark:bg-[#2a2a40] rounded-xl" />)}</div>
        ) : journals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#2a2a40] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📖</span>
            </div>
            <p className="text-neo-textSecondary text-sm">Start your journal</p>
          </div>
        ) : (
          <div className="space-y-4">
            {journals.map(j => (
              <Card key={j.id}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-neo-muted">{new Date(j.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      {j.mood && <span className="text-lg">{MOOD_EMOJIS[j.mood]}</span>}
                    </div>
                    {j.title && <h3 className="text-base font-semibold text-neo-text mb-2">{j.title}</h3>}
                    <p className="text-sm text-neo-textSecondary whitespace-pre-wrap leading-relaxed">{j.content}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(j)} className="text-xs text-neo-muted hover:text-neo-text px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a40]">Edit</button>
                    <button onClick={() => { if (confirm('Delete?')) deleteJournal(j.id) }} className="text-xs text-neo-muted hover:text-neo-danger px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={resetForm} title={editId ? 'Edit Entry' : 'New Journal Entry'}>
        <div className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" className="input" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind?" rows={8} className="input resize-none" />
          <div>
            <p className="text-xs text-neo-muted mb-2">Mood (optional)</p>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(m => (
                <button key={m} onClick={() => setMood(mood === m ? undefined : m)} className={clsx('text-2xl p-2 rounded-lg transition-all', mood === m ? 'bg-amber-50 dark:bg-amber-900/20 scale-110 ring-1 ring-amber-200' : 'hover:bg-gray-100 dark:hover:bg-[#2a2a40]')}>
                  {MOOD_EMOJIS[m]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? 'Save' : 'Write'}</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
