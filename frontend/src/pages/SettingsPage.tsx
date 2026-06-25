import { useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { clsx } from 'clsx'

const THEMES = [
  { key: 'system', label: 'System', icon: '💻' },
  { key: 'light', label: 'Light', icon: '☀️' },
  { key: 'dark', label: 'Dark', icon: '🌙' },
]

const ACCENT_COLORS = [
  { key: '#7c3aed', label: 'Purple', bg: 'bg-purple-500' },
  { key: '#3b82f6', label: 'Blue', bg: 'bg-blue-500' },
  { key: '#10b981', label: 'Green', bg: 'bg-emerald-500' },
  { key: '#f59e0b', label: 'Amber', bg: 'bg-amber-500' },
  { key: '#ef4444', label: 'Red', bg: 'bg-red-500' },
  { key: '#ec4899', label: 'Pink', bg: 'bg-pink-500' },
  { key: '#06b6d4', label: 'Cyan', bg: 'bg-cyan-500' },
  { key: '#f97316', label: 'Orange', bg: 'bg-orange-500' },
]

export default function SettingsPage() {
  const { settings, fetchSettings, updateSettings } = useSettingsStore()

  useEffect(() => { fetchSettings() }, [])

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your experience</p>
        </div>

        {/* Theme */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🌙 Theme</h3>
          <div className="flex gap-3">
            {THEMES.map(t => (
              <button key={t.key} onClick={() => updateSettings({ theme: t.key })} className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all', settings.theme === t.key ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300')}>
                <span className="text-xl">{t.icon}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Accent Color */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎨 Accent Color</h3>
          <div className="flex gap-3 flex-wrap">
            {ACCENT_COLORS.map(c => (
              <button key={c.key} onClick={() => updateSettings({ accent_color: c.key })} className={clsx('w-10 h-10 rounded-full border-3 transition-all', c.bg, settings.accentColor === c.key ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105')} title={c.label} />
            ))}
          </div>
        </Card>

        {/* Data Export */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📤 Data Export</h3>
          <p className="text-sm text-gray-500 mb-4">Download your data as JSON</p>
          <button onClick={() => {
            // Export triggers download from backend
            const token = localStorage.getItem('token')
            const link = document.createElement('a')
            link.href = `/api/export?token=${token}`
            link.download = 'pa-app-data.json'
            link.click()
          }} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
            Export All Data
          </button>
        </Card>

        {/* App Info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ℹ️ About</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>PA App — Personal Assistant</p>
            <p>Version 2.0</p>
            <p>Built with React, Express, SQLite</p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
