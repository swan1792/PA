import { useState, useEffect, useRef, useCallback } from 'react'
import { useFocusStore } from '../../store/focusStore'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { clsx } from 'clsx'

export default function FocusTimer() {
  const { activeSession, stats, startSession, completeSession, fetchStats, fetchTodaySessions } = useFocusStore()
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [duration, setDuration] = useState(25)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchStats()
    fetchTodaySessions()
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0 && activeSession) {
      completeSession(activeSession.id)
      setIsRunning(false)
      setMode(mode === 'focus' ? 'break' : 'focus')
      setTimeLeft(mode === 'focus' ? 5 * 60 : duration * 60)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, timeLeft])

  const handleStart = async () => {
    if (activeSession) {
      setIsRunning(!isRunning)
    } else {
      await startSession({ duration, type: mode })
      setTimeLeft(duration * 60)
      setIsRunning(true)
    }
  }

  const handleStop = () => {
    if (activeSession) {
      completeSession(activeSession.id)
    }
    setIsRunning(false)
    setTimeLeft(duration * 60)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100
  const circumference = 2 * Math.PI * 90

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎯 Focus Timer</h3>

      {/* Timer Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" strokeWidth="8" className="stroke-gray-200 dark:stroke-gray-700" />
            <circle
              cx="100" cy="100" r="90" fill="none" strokeWidth="8"
              className={clsx('transition-all duration-1000', mode === 'focus' ? 'stroke-brand-600' : 'stroke-green-500')}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900 dark:text-white font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-sm text-gray-500 mt-1 capitalize">{mode}</span>
          </div>
        </div>
      </div>

      {/* Duration Selector (when not running) */}
      {!isRunning && !activeSession && (
        <div className="flex justify-center gap-2 mb-4">
          {[15, 25, 30, 45, 60].map((d) => (
            <button
              key={d}
              onClick={() => { setDuration(d); setTimeLeft(d * 60) }}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                duration === d ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              )}
            >
              {d}m
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button onClick={handleStart} variant={isRunning ? 'secondary' : 'primary'}>
          {isRunning ? '⏸ Pause' : activeSession ? '▶ Resume' : '▶ Start'}
        </Button>
        {(isRunning || activeSession) && (
          <Button onClick={handleStop} variant="danger">⏹ Stop</Button>
        )}
      </div>

      {/* Today's Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-brand-600">{stats.today.sessions}</p>
            <p className="text-xs text-gray-500">Sessions Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-600">{stats.today.minutes}m</p>
            <p className="text-xs text-gray-500">Focus Time Today</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
