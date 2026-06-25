import { useEffect, useRef, useState } from 'react'
import { useSoundStore } from '../../store/soundStore'
import Card from '../ui/Card'
import { clsx } from 'clsx'

export default function SoundPlayer() {
  const { sounds, activeSound, isPlaying, volume, fetchSounds, playSound, stopSound, setVolume } = useSoundStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetchSounds()
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.loop = true
    }

    if (activeSound && isPlaying) {
      audioRef.current.src = activeSound.url
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [activeSound, isPlaying])

  const handleToggle = () => {
    if (activeSound && isPlaying) {
      stopSound()
    } else if (activeSound) {
      playSound(activeSound)
    }
  }

  return (
    <Card padding="sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xl"
          >
            {activeSound ? activeSound.icon : '🎵'}
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {activeSound ? activeSound.name : 'Ambient Sounds'}
            </p>
            <p className="text-xs text-gray-500">
              {isPlaying ? 'Playing' : activeSound ? 'Paused' : 'Select a sound'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeSound && (
            <>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 accent-brand-600"
              />
              <button
                onClick={handleToggle}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sound Grid */}
      {isExpanded && (
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {sounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => playSound(sound)}
              className={clsx(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                activeSound?.id === sound.id && isPlaying
                  ? 'bg-brand-100 dark:bg-brand-900/30 ring-1 ring-brand-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <span className="text-xl">{sound.icon}</span>
              <span className="text-[10px] text-gray-500">{sound.name}</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}
