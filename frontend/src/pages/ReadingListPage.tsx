import { useEffect, useState } from 'react'
import { useReadingStore } from '../store/readingStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📖 Reading List</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Save articles to read later</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Add Link</Button>
        </div>

        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${items.length})` : `(${items.filter(i => f === 'unread' ? !i.isRead : i.isRead).length})`}
            </button>
          ))}
        </div>

        {isLoading ? <div className="animate-pulse space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}</div>
        : filtered.length === 0 ? <div className="text-center py-12"><p className="text-4xl mb-4">📚</p><p className="text-gray-500">No items yet</p></div>
        : (
          <div className="space-y-3">
            {filtered.map(item => (
              <Card key={item.id} className="flex items-center gap-4">
                <button onClick={() => toggleRead(item.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.isRead ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {item.isRead && <span className="text-white text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className={`font-medium hover:text-brand-600 transition-colors ${item.isRead ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {item.title}
                  </a>
                  <p className="text-xs text-gray-500 truncate">{item.url}</p>
                  {item.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>}
                </div>
                <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500 text-sm flex-shrink-0">Delete</button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add to Reading List">
        <div className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
