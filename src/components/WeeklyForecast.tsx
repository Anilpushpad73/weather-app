import { Calendar } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export function WeeklyForecast() {
  const { weatherData, temperatureUnit } = useWeather();

  if (!weatherData?.forecast?.forecastday) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-IN', { weekday: 'long' });
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-white" />
        <h3 className="text-xl font-semibold text-white">5-Day Forecast</h3>
      </div>
      
      <div className="space-y-3">
        {weatherData.forecast.forecastday.map((day, index) => {
          const maxTemp = temperatureUnit === 'celsius' ? day.day.maxtemp_c : day.day.maxtemp_f;
          const minTemp = temperatureUnit === 'celsius' ? day.day.mintemp_c : day.day.mintemp_f;
          const tempUnit = temperatureUnit === 'celsius' ? '°C' : '°F';
          const windSpeed = temperatureUnit === 'celsius' ? day.day.maxwind_kph : day.day.maxwind_mph;
          const visUnit = temperatureUnit === 'celsius' ? 'km/h' : 'mph';
          
          return (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-100 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="text-white font-medium min-w-[80px]">
                  {formatDate(day.date)}
                </div>
                <img 
                  src={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50" text-anchor="middle" dominant-baseline="central">${day.day.condition.icon}</text></svg>`)}`}
                  alt={day.day.condition.text}
                  className="w-12 h-12"
                />
                <div className="flex-1">
                  <p className="text-white text-sm">{day.day.condition.text}</p>
                  {day.day.daily_chance_of_rain > 0 && (
                    <p className="text-white/60 text-xs">
                      {day.day.daily_chance_of_rain}% chance of rain
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-right">
                <div className="text-white/60 text-sm">
                  <div>💧 {day.day.avghumidity}%</div>
                  <div>💨 {Math.round(windSpeed)} {visUnit}</div>
                </div>
                <div className="text-white">
                  <span className="font-semibold text-lg">
                    {Math.round(maxTemp)}{tempUnit}
                  </span>
                  <span className="text-white/70 ml-2">
                    {Math.round(minTemp)}{tempUnit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}