import { useEffect, useState } from 'react'
import { useJournalStore } from '../store/journalStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📝 Journal</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Write daily reflections</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>New Entry</Button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}</div>
        ) : journals.length === 0 ? (
          <div className="text-center py-12"><p className="text-4xl mb-4">📖</p><p className="text-gray-500">Start your journal</p></div>
        ) : (
          <div className="space-y-4">
            {journals.map(j => (
              <Card key={j.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-500">{new Date(j.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      {j.mood && <span className="text-xl">{MOOD_EMOJIS[j.mood]}</span>}
                    </div>
                    {j.title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{j.title}</h3>}
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{j.content}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => handleEdit(j)} className="text-gray-400 hover:text-brand-600 text-sm">Edit</button>
                    <button onClick={() => { if (confirm('Delete?')) deleteJournal(j.id) }} className="text-gray-400 hover:text-red-500 text-sm">Delete</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={resetForm} title={editId ? 'Edit Entry' : 'New Journal Entry'}>
        <div className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind?" rows={8} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none" />
          <div>
            <p className="text-sm text-gray-500 mb-2">Mood (optional)</p>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(m => (
                <button key={m} onClick={() => setMood(mood === m ? undefined : m)} className={`text-2xl p-2 rounded-lg transition-all ${mood === m ? 'bg-brand-100 dark:bg-brand-900/30 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {MOOD_EMOJIS[m]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? 'Save' : 'Write'}</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
