import { OpenMeteoResponse, GeocodingResult, WeatherData } from '../types/weather';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

// Weather code mappings for Open-Meteo
const weatherCodeMap: Record<number, { text: string; icon: string; isDay?: boolean }> = {
  0: { text: 'Clear sky', icon: '☀️' },
  1: { text: 'Mainly clear', icon: '🌤️' },
  2: { text: 'Partly cloudy', icon: '⛅' },
  3: { text: 'Overcast', icon: '☁️' },
  45: { text: 'Fog', icon: '🌫️' },
  48: { text: 'Depositing rime fog', icon: '🌫️' },
  51: { text: 'Light drizzle', icon: '🌦️' },
  53: { text: 'Moderate drizzle', icon: '🌦️' },
  55: { text: 'Dense drizzle', icon: '🌧️' },
  56: { text: 'Light freezing drizzle', icon: '🌨️' },
  57: { text: 'Dense freezing drizzle', icon: '🌨️' },
  61: { text: 'Slight rain', icon: '🌦️' },
  63: { text: 'Moderate rain', icon: '🌧️' },
  65: { text: 'Heavy rain', icon: '🌧️' },
  66: { text: 'Light freezing rain', icon: '🌨️' },
  67: { text: 'Heavy freezing rain', icon: '🌨️' },
  71: { text: 'Slight snow fall', icon: '🌨️' },
  73: { text: 'Moderate snow fall', icon: '❄️' },
  75: { text: 'Heavy snow fall', icon: '❄️' },
  77: { text: 'Snow grains', icon: '🌨️' },
  80: { text: 'Slight rain showers', icon: '🌦️' },
  81: { text: 'Moderate rain showers', icon: '🌧️' },
  82: { text: 'Violent rain showers', icon: '⛈️' },
  85: { text: 'Slight snow showers', icon: '🌨️' },
  86: { text: 'Heavy snow showers', icon: '❄️' },
  95: { text: 'Thunderstorm', icon: '⛈️' },
  96: { text: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { text: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

function getWeatherCondition(code: number) {
  return weatherCodeMap[code] || { text: 'Unknown', icon: '❓' };
}

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function transformOpenMeteoData(data: OpenMeteoResponse, locationName: string, country: string, region?: string): WeatherData {
  const current = data.current;
  const condition = getWeatherCondition(current.weather_code);
  
  // Create hourly forecast data
  const hourlyData = data.hourly.time.map((time, index) => ({
    time,
    temp_c: data.hourly.temperature_2m[index],
    temp_f: celsiusToFahrenheit(data.hourly.temperature_2m[index]),
    condition: getWeatherCondition(data.hourly.weather_code[index]),
    wind_mph: kmhToMph(data.hourly.wind_speed_10m[index]),
    wind_kph: data.hourly.wind_speed_10m[index],
    wind_dir: getWindDirection(data.hourly.wind_direction_10m[index]),
    humidity: data.hourly.relative_humidity_2m[index],
    feelslike_c: data.hourly.apparent_temperature[index],
    feelslike_f: celsiusToFahrenheit(data.hourly.apparent_temperature[index]),
    chance_of_rain: data.hourly.precipitation_probability[index]
  }));

  // Create daily forecast data
  const dailyData = data.daily.time.map((date, index) => ({
    date,
    day: {
      maxtemp_c: data.daily.temperature_2m_max[index],
      maxtemp_f: celsiusToFahrenheit(data.daily.temperature_2m_max[index]),
      mintemp_c: data.daily.temperature_2m_min[index],
      mintemp_f: celsiusToFahrenheit(data.daily.temperature_2m_min[index]),
      condition: getWeatherCondition(data.daily.weather_code[index]),
      maxwind_mph: kmhToMph(data.daily.wind_speed_10m_max[index]),
      maxwind_kph: data.daily.wind_speed_10m_max[index],
      totalprecip_mm: data.daily.precipitation_sum[index],
      avghumidity: 65, // Open-Meteo doesn't provide daily humidity, using reasonable default
      daily_chance_of_rain: data.daily.precipitation_probability_max[index],
      uv: 5 // Open-Meteo doesn't provide UV in free tier, using reasonable default
    },
    hour: hourlyData.filter(hour => hour.time.startsWith(date))
  }));

  return {
    location: {
      name: locationName,
      country,
      region: region || '',
      lat: data.latitude,
      lon: data.longitude,
      timezone: data.timezone,
      localtime: current.time
    },
    current: {
      temp_c: current.temperature_2m,
      temp_f: celsiusToFahrenheit(current.temperature_2m),
      condition: {
        text: condition.text,
        icon: condition.icon,
        code: current.weather_code
      },
      wind_mph: kmhToMph(current.wind_speed_10m),
      wind_kph: current.wind_speed_10m,
      wind_dir: getWindDirection(current.wind_direction_10m),
      pressure_mb: current.surface_pressure,
      humidity: current.relative_humidity_2m,
      cloud: current.cloud_cover,
      feelslike_c: current.apparent_temperature,
      feelslike_f: celsiusToFahrenheit(current.apparent_temperature),
      vis_km: 10, // Open-Meteo doesn't provide visibility, using reasonable default
      vis_miles: 6.2,
      uv: 5, // Open-Meteo doesn't provide UV in free tier
      precip_mm: current.precipitation
    },
    forecast: {
      forecastday: dailyData
    }
  };
}

export const weatherApi = {
  async getCurrentWeather(location: string) {
    // First, geocode the location
    const geocodingResponse = await fetch(
      `${GEOCODING_BASE_URL}/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    
    if (!geocodingResponse.ok) {
      throw new Error('Failed to find location');
    }
    
    const geocodingData = await geocodingResponse.json();
    
    if (!geocodingData.results || geocodingData.results.length === 0) {
      throw new Error('Location not found');
    }
    
    const locationData = geocodingData.results[0];

    // Then get weather data
    const weatherResponse = await fetch(
      `${OPEN_METEO_BASE_URL}/forecast?latitude=${locationData.latitude}&longitude=${locationData.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=5`
    );
    
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const weatherData = await weatherResponse.json();
    return transformOpenMeteoData(
      weatherData, 
      locationData.name, 
      locationData.country,
      locationData.admin1
    );
  },

  async searchLocations(query: string) {
    if (query.length < 3) return [];
    
    const response = await fetch(
      `${GEOCODING_BASE_URL}/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search locations');
    }
    
    const data = await response.json();
    
    if (!data.results) return [];
    
    return data.results.map((result: GeocodingResult, index: number) => ({
      id: index,
      name: result.name,
      region: result.admin1 || '',
      country: result.country,
      lat: result.latitude,
      lon: result.longitude,
      url: `${result.latitude},${result.longitude}`
    }));
  },

  async getWeatherByCoords(lat: number, lon: number) {
  
    function isWithinIndia(lat: number, lon: number): boolean {
  return (
    lat >= 6.5 && lat <= 37.1 &&
    lon >= 68.7 && lon <= 97.25
  );
}
    let locationName = 'Your Location';
    let country = isWithinIndia(lat, lon) ? 'India' : '';
    let region = '';

    // Get weather data
    const weatherResponse = await fetch(
      `${OPEN_METEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=5`
    );
    
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const weatherData = await weatherResponse.json();
   
    return transformOpenMeteoData(weatherData, locationName, country, region);
  }
};