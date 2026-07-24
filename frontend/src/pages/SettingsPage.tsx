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
        <div className="page-header">
          <h1>⚙️ Settings</h1>
          <p>Customize your experience</p>
        </div>

        {/* Theme */}
        <Card>
          <h3 className="text-sm font-semibold text-neo-text mb-4">🌙 Theme</h3>
          <div className="flex gap-3">
            {THEMES.map(t => (
              <button key={t.key} onClick={() => updateSettings({ theme: t.key })} className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all', settings.theme === t.key ? 'border-neo-primary bg-indigo-50 dark:bg-indigo-900/20' : 'border-neo-border hover:border-gray-300 dark:hover:border-gray-600')}>
                <span className="text-lg">{t.icon}</span>
                <span className="text-sm font-medium text-neo-text">{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Accent Color */}
        <Card>
          <h3 className="text-sm font-semibold text-neo-text mb-4">🎨 Accent Color</h3>
          <div className="flex gap-3 flex-wrap">
            {ACCENT_COLORS.map(c => (
              <button key={c.key} onClick={() => updateSettings({ accent_color: c.key })} className={clsx('w-9 h-9 rounded-full ring-2 transition-all', c.bg, settings.accentColor === c.key ? 'ring-gray-900 dark:ring-white scale-110' : 'ring-transparent hover:scale-105')} title={c.label} />
            ))}
          </div>
        </Card>

        {/* App Info */}
        <Card>
          <h3 className="text-sm font-semibold text-neo-text mb-4">ℹ️ About</h3>
          <div className="space-y-1.5 text-sm text-neo-textSecondary">
            <p>PA App — Personal Assistant</p>
            <p>Version 2.0</p>
            <p>Built with React, Express, SQLite</p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
