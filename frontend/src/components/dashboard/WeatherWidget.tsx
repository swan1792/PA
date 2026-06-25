import { useEffect } from 'react'
import { useWeatherStore } from '../../store/weatherStore'
import Card from '../ui/Card'

const CITIES = [
  { value: 'Yangon', label: '🇲🇲 Yangon' },
  { value: 'Mandalay', label: '🇲🇲 Mandalay' },
  { value: 'Bangkok', label: '🇹🇭 Bangkok' },
  { value: 'Singapore', label: '🇸🇬 Singapore' },
  { value: 'Kuala Lumpur', label: '🇲🇾 Kuala Lumpur' },
  { value: 'Jakarta', label: '🇮🇩 Jakarta' },
  { value: 'Ho Chi Minh City', label: '🇻🇳 Ho Chi Minh' },
  { value: 'Hanoi', label: '🇻🇳 Hanoi' },
  { value: 'Manila', label: '🇵🇭 Manila' },
  { value: 'Phnom Penh', label: '🇰🇭 Phnom Penh' },
  { value: 'Tokyo', label: '🇯🇵 Tokyo' },
  { value: 'Seoul', label: '🇰🇷 Seoul' },
  { value: 'Taipei', label: '🇹🇼 Taipei' },
  { value: 'Hong Kong', label: '🇭🇰 Hong Kong' },
  { value: 'Shanghai', label: '🇨🇳 Shanghai' },
  { value: 'Beijing', label: '🇨🇳 Beijing' },
  { value: 'Mumbai', label: '🇮🇳 Mumbai' },
  { value: 'Delhi', label: '🇮🇳 Delhi' },
  { value: 'Dubai', label: '🇦🇪 Dubai' },
  { value: 'London', label: '🇬🇧 London' },
  { value: 'New York', label: '🇺🇸 New York' },
  { value: 'Los Angeles', label: '🇺🇸 Los Angeles' },
  { value: 'San Francisco', label: '🇺🇸 San Francisco' },
  { value: 'Sydney', label: '🇦🇺 Sydney' },
  { value: 'Melbourne', label: '🇦🇺 Melbourne' },
]

export default function WeatherWidget() {
  const { weather, isLoading, city, fetchWeather, setCity } = useWeatherStore()

  useEffect(() => {
    fetchWeather()
  }, [])

  const handleCityChange = (newCity: string) => {
    setCity(newCity)
    fetchWeather(newCity)
  }

  if (isLoading && !weather) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </Card>
    )
  }

  if (!weather) return null

  return (
    <Card>
      {/* Header with city selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🌤️ Weather</h3>
        <select
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {CITIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Current Weather */}
      <div className={`flex items-center gap-4 mb-4 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
        <span className="text-5xl">{weather.icon}</span>
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{weather.tempC}°C</p>
          <p className="text-sm text-gray-500">{weather.description}</p>
          <p className="text-xs text-gray-400">Feels like {weather.feelsLikeC}°C</p>
        </div>
        {isLoading && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-lg font-semibold text-blue-600">{weather.humidity}%</p>
          <p className="text-[10px] text-gray-500">Humidity</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
          <p className="text-lg font-semibold text-green-600">{weather.windKmph} km/h</p>
          <p className="text-[10px] text-gray-500">Wind {weather.windDir}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
          <p className="text-lg font-semibold text-amber-600">{weather.uvIndex}</p>
          <p className="text-[10px] text-gray-500">UV Index</p>
        </div>
      </div>

      {/* 3-Day Forecast */}
      {weather.forecast.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">3-Day Forecast</p>
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.map((day) => (
              <div key={day.date} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <span className="text-xl">{day.icon}</span>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {day.maxTempC}° / {day.minTempC}°
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
