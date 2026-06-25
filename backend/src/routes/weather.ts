import { Router, Response } from 'express'
import axios from 'axios'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// City coordinates database
const CITY_COORDS: Record<string, { lat: number; lon: number; label: string; country: string }> = {
  'Yangon': { lat: 16.8661, lon: 96.1951, label: 'Yangon', country: 'Myanmar' },
  'Mandalay': { lat: 21.9588, lon: 96.0891, label: 'Mandalay', country: 'Myanmar' },
  'Bangkok': { lat: 13.7563, lon: 100.5018, label: 'Bangkok', country: 'Thailand' },
  'Singapore': { lat: 1.3521, lon: 103.8198, label: 'Singapore', country: 'Singapore' },
  'Kuala Lumpur': { lat: 3.139, lon: 101.6869, label: 'Kuala Lumpur', country: 'Malaysia' },
  'Jakarta': { lat: -6.2088, lon: 106.8456, label: 'Jakarta', country: 'Indonesia' },
  'Ho Chi Minh City': { lat: 10.8231, lon: 106.6297, label: 'Ho Chi Minh City', country: 'Vietnam' },
  'Hanoi': { lat: 21.0278, lon: 105.8342, label: 'Hanoi', country: 'Vietnam' },
  'Manila': { lat: 14.5995, lon: 120.9842, label: 'Manila', country: 'Philippines' },
  'Phnom Penh': { lat: 11.5564, lon: 104.9282, label: 'Phnom Penh', country: 'Cambodia' },
  'Tokyo': { lat: 35.6762, lon: 139.6503, label: 'Tokyo', country: 'Japan' },
  'Seoul': { lat: 37.5665, lon: 126.978, label: 'Seoul', country: 'South Korea' },
  'Taipei': { lat: 25.033, lon: 121.5654, label: 'Taipei', country: 'Taiwan' },
  'Hong Kong': { lat: 22.3193, lon: 114.1694, label: 'Hong Kong', country: 'Hong Kong' },
  'Shanghai': { lat: 31.2304, lon: 121.4737, label: 'Shanghai', country: 'China' },
  'Beijing': { lat: 39.9042, lon: 116.4074, label: 'Beijing', country: 'China' },
  'Mumbai': { lat: 19.076, lon: 72.8777, label: 'Mumbai', country: 'India' },
  'Delhi': { lat: 28.7041, lon: 77.1025, label: 'Delhi', country: 'India' },
  'Dubai': { lat: 25.2048, lon: 55.2708, label: 'Dubai', country: 'UAE' },
  'London': { lat: 51.5074, lon: -0.1278, label: 'London', country: 'UK' },
  'New York': { lat: 40.7128, lon: -74.006, label: 'New York', country: 'USA' },
  'Los Angeles': { lat: 34.0522, lon: -118.2437, label: 'Los Angeles', country: 'USA' },
  'San Francisco': { lat: 37.7749, lon: -122.4194, label: 'San Francisco', country: 'USA' },
  'Sydney': { lat: -33.8688, lon: 151.2093, label: 'Sydney', country: 'Australia' },
  'Melbourne': { lat: -37.8136, lon: 144.9631, label: 'Melbourne', country: 'Australia' },
}

// WMO Weather code to description + icon
function getWeatherInfo(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'Clear Sky', icon: '☀️' }
  if (code === 1) return { description: 'Mainly Clear', icon: '🌤️' }
  if (code === 2) return { description: 'Partly Cloudy', icon: '⛅' }
  if (code === 3) return { description: 'Overcast', icon: '☁️' }
  if (code === 45 || code === 48) return { description: 'Foggy', icon: '🌫️' }
  if (code >= 51 && code <= 55) return { description: 'Drizzle', icon: '🌦️' }
  if (code >= 56 && code <= 57) return { description: 'Freezing Drizzle', icon: '🌧️' }
  if (code >= 61 && code <= 63) return { description: 'Rain', icon: '🌧️' }
  if (code === 65) return { description: 'Heavy Rain', icon: '🌧️' }
  if (code >= 66 && code <= 67) return { description: 'Freezing Rain', icon: '🌨️' }
  if (code >= 71 && code <= 75) return { description: 'Snow', icon: '🌨️' }
  if (code === 77) return { description: 'Snow Grains', icon: '🌨️' }
  if (code >= 80 && code <= 82) return { description: 'Rain Showers', icon: '🌦️' }
  if (code >= 85 && code <= 86) return { description: 'Snow Showers', icon: '🌨️' }
  if (code === 95) return { description: 'Thunderstorm', icon: '⛈️' }
  if (code >= 96 && code <= 99) return { description: 'Thunderstorm with Hail', icon: '⛈️' }
  return { description: 'Cloudy', icon: '☁️' }
}

function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(degrees / 22.5) % 16]
}

// Get current weather
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const city = (req.query.city as string) || 'Yangon'
  const coords = CITY_COORDS[city]

  if (!coords) {
    return res.json({
      data: {
        city, country: '', tempC: 0, tempF: 0, feelsLikeC: 0, feelsLikeF: 0,
        humidity: 0, windKmph: 0, windDir: '-', description: 'City not found', icon: '❓',
        uvIndex: 0, visibility: 0, forecast: [],
      },
    })
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast`
    const response = await axios.get(url, {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        timezone: 'auto',
        forecast_days: 3,
      },
      timeout: 10000,
    })

    const data = response.data
    const current = data.current
    const daily = data.daily

    if (!current || !daily) {
      throw new Error('Invalid API response')
    }

    const currentWeather = getWeatherInfo(current.weather_code)

    const forecast = daily.time.map((date: string, i: number) => {
      const dayWeather = getWeatherInfo(daily.weather_code[i])
      return {
        date,
        maxTempC: Math.round(daily.temperature_2m_max[i]),
        minTempC: Math.round(daily.temperature_2m_min[i]),
        description: dayWeather.description,
        icon: dayWeather.icon,
      }
    })

    const weather = {
      city: coords.label,
      country: coords.country,
      tempC: Math.round(current.temperature_2m),
      tempF: Math.round(current.temperature_2m * 9 / 5 + 32),
      feelsLikeC: Math.round(current.apparent_temperature),
      feelsLikeF: Math.round(current.apparent_temperature * 9 / 5 + 32),
      humidity: current.relative_humidity_2m,
      windKmph: Math.round(current.wind_speed_10m),
      windDir: getWindDirection(current.wind_direction_10m),
      description: currentWeather.description,
      icon: currentWeather.icon,
      uvIndex: Math.round(current.uv_index),
      visibility: 10,
      forecast,
    }

    res.json({ data: weather })
  } catch (error: any) {
    console.error('Weather API error:', error.message)
    res.json({
      data: {
        city: coords.label, country: coords.country,
        tempC: 0, tempF: 0, feelsLikeC: 0, feelsLikeF: 0,
        humidity: 0, windKmph: 0, windDir: '-', description: 'Unable to fetch weather', icon: '⚠️',
        uvIndex: 0, visibility: 0, forecast: [],
      },
    })
  }
})

export { router as weatherRoutes }
