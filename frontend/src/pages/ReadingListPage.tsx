import { useEffect, useState } from 'react'
import { useReadingStore } from '../store/readingStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { clsx } from 'clsx'

export default function ReadingListPage() {
  const { items, fetchItems, addItem, toggleRead, deleteItem, isLoading } = useReadingStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) return
    await addItem({ title: title.trim(), url: url.trim(), description: description.trim() || undefined })
    setTitle(''); setUrl(''); setDescription(''); setIsModalOpen(false)
  }

  const filtered = filter === 'all' ? items : items.filter(i => filter === 'unread' ? !i.isRead : i.isRead)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>📖 Reading List</h1>
              <p>Save articles to read later</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Add Link</Button>
          </div>
        </div>

        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'pill-active' : 'pill-inactive'}>
              {f.charAt(0).toUpperCase() + f.slice(1)} <span className="text-xs opacity-60">({f === 'all' ? items.length : items.filter(i => f === 'unread' ? !i.isRead : i.isRead).length})</span>
            </button>
          ))}
        </div>

        {isLoading ? <div className="animate-pulse space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-[#2a2a40] rounded-xl" />)}</div>
        : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#2a2a40] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-neo-textSecondary text-sm">No items yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(item => (
              <Card key={item.id} padding="sm" className="flex items-center gap-3.5">
                <button onClick={() => toggleRead(item.id)} className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors', item.isRead ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-neo-primary')}>
                  {item.isRead && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className={clsx('text-sm font-medium transition-colors', item.isRead ? 'line-through text-neo-muted' : 'text-neo-text hover:text-neo-primary')}>
                    {item.title}
                  </a>
                  <p className="text-xs text-neo-muted truncate mt-0.5">{item.url}</p>
                  {item.description && <p className="text-sm text-neo-textSecondary mt-1">{item.description}</p>}
                </div>
                <button onClick={() => deleteItem(item.id)} className="text-xs text-neo-muted hover:text-neo-danger px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 transition-colors">Delete</button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add to Reading List">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">URL</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Notes <span className="text-neo-muted font-normal">(optional)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Why save this?" rows={2} className="input resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
