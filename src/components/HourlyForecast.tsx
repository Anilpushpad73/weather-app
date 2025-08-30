import { useWeather } from '../context/WeatherContext';

export function HourlyForecast() {
  const { weatherData, temperatureUnit } = useWeather();

  if (!weatherData?.forecast?.forecastday) return null;

  const today = weatherData.forecast.forecastday[0];
  const currentHour = new Date().getHours();
  
  // Get next 24 hours starting from current hour
  const next24Hours = today.hour.slice(currentHour).concat(
    weatherData.forecast.forecastday[1]?.hour.slice(0, currentHour) || []
  );

  const formatHour = (timeStr: string) => {
    const hour = new Date(timeStr).getHours();
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
      <h3 className="text-xl font-semibold text-white mb-4">24-Hour Forecast</h3>
      
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
          {next24Hours.slice(0, 24).map((hour, index) => {
            const temp = temperatureUnit === 'celsius' ? hour.temp_c : hour.temp_f;
            const tempUnit = temperatureUnit === 'celsius' ? '°C' : '°F';
            
            return (
              <div 
                key={index} 
                className="flex-shrink-0 bg-white/10 rounded-2xl p-4 text-center hover:bg-white/20 transition-all duration-100 hover:scale-105"
                style={{ minWidth: '100px' }}
              >
                <p className="text-white/70 text-sm mb-2">
                  {index === 0 ? 'Now' : formatHour(hour.time)}
                </p>
                <img 
                  src={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50" text-anchor="middle" dominant-baseline="central">${hour.condition.icon}</text></svg>`)}`}
                  alt={hour.condition.text}
                  className="w-10 h-10 mx-auto mb-2"
                />
                <p className="text-white font-semibold">
                  {Math.round(temp)}{tempUnit}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {hour.chance_of_rain > 0 ? `${hour.chance_of_rain}%` : ''}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}