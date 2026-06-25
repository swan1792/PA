import { useEffect, useState } from 'react'
import { useIdeaStore } from '../store/ideaStore'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'

const COLORS = ['#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#e0f2fe', '#fed7aa', '#fecaca']

export default function IdeasPage() {
  const { ideas, fetchIdeas, addIdea, updateIdea, deleteIdea } = useIdeaStore()
  const [newContent, setNewContent] = useState('')
  const [newColor, setNewColor] = useState('#fef3c7')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => { fetchIdeas() }, [])

  const handleAdd = async () => {
    if (!newContent.trim()) return
    await addIdea({ content: newContent.trim(), color: newColor })
    setNewContent('')
  }

  const handleEdit = (id: string, content: string) => {
    setEditingId(id); setEditContent(content)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return
    await updateIdea(id, { content: editContent.trim() })
    setEditingId(null)
  }

  const handleColorChange = async (id: string, color: string) => {
    await updateIdea(id, { color })
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💡 Idea Board</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Capture your thoughts and ideas</p>
        </div>

        {/* Add new idea */}
        <div className="flex gap-3">
          <input value={newContent} onChange={e => setNewContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="New idea..." className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button key={c} onClick={() => setNewColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${newColor === c ? 'border-brand-600 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <Button onClick={handleAdd}>Add</Button>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ideas.map(idea => (
            <div key={idea.id} className="rounded-xl p-4 min-h-[120px] flex flex-col transition-all hover:shadow-md" style={{ backgroundColor: idea.color }}>
              {editingId === idea.id ? (
                <div className="flex-1 flex flex-col gap-2">
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="flex-1 bg-transparent resize-none text-gray-800 text-sm outline-none" autoFocus />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(idea.id)} className="text-xs text-blue-600 font-medium">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800 text-sm flex-1 whitespace-pre-wrap">{idea.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1">
                      {COLORS.slice(0, 4).map(c => (
                        <button key={c} onClick={() => handleColorChange(idea.id, c)} className="w-4 h-4 rounded-full border border-white/50" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(idea.id, idea.content)} className="text-xs text-gray-500 hover:text-gray-800">Edit</button>
                      <button onClick={() => deleteIdea(idea.id)} className="text-xs text-gray-500 hover:text-red-500">Delete</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
