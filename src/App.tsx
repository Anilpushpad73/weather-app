import { WeatherProvider, useWeather } from './context/WeatherContext';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { WeeklyForecast } from './components/WeeklyForecast';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { getWeatherGradient } from './utils/backgroundGradients';
import { Cloud, MapPin } from 'lucide-react';
import { useEffect } from 'react';

function WeatherApp() {
  const { weatherData, loading, error, getCurrentLocation } = useWeather();

  useEffect(() => {
    // Try to get current location on initial load
    getCurrentLocation();
  }, [getCurrentLocation]);

  const isDay = weatherData ? 
    new Date(weatherData.location.localtime).getHours() >= 6 && 
    new Date(weatherData.location.localtime).getHours() < 18 : true;

  const gradientClass = weatherData 
    ? getWeatherGradient(weatherData.current.condition.text, isDay)
    : 'from-blue-400 via-blue-500 to-blue-600';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientClass} relative overflow-hidden`}>
      {/* Animated background elements */}
      {/* Animated blurred circles for background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Cloud className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">WeatherLive</h1>
          </div>
          {weatherData && (
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 inline-flex items-center gap-2 border border-white/20">
              <MapPin className="h-4 w-4 text-white/80" />
              <span className="text-white font-medium">
                {weatherData.location.name}
                {weatherData.location.region && `, ${weatherData.location.region}`}
                , {weatherData.location.country}
              </span>
            </div>
          )}
        </header>

        <div className="mb-8">
          <SearchBar />
        </div>

        <div className="max-w-6xl mx-auto">
          {loading && <LoadingSpinner />}
          
          {error && (
            <ErrorMessage 
              message={error} 
              onRetry={getCurrentLocation}
            />
          )}

          {!loading && !error && weatherData && (
            <div className="space-y-8">
              <CurrentWeather />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <HourlyForecast />
                <WeeklyForecast />
              </div>
            </div>
          )}

          {!loading && !error && !weatherData && (
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
                <Cloud className="h-16 w-16 text-white/60 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">Welcome to WeatherLive</h2>
                <p className="text-white/70 mb-6">
                  Search for a city or allow location access to get started with your weather forecast.
                </p>
              </div>
            </div>
          )}
        </div>

        <footer className="text-center mt-16 text-white/60">
          <p className="text-sm">
            Powered by WeatherAPI.com ({new Date().getFullYear()}) | Developed by Anil Pushpad
          </p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <WeatherProvider>
      <WeatherApp />
    </WeatherProvider>
  );
}

export default App;