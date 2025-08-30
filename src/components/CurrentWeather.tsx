import { MapPin, Thermometer, Wind, Droplets, Eye, Gauge} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export function CurrentWeather() {
  const { weatherData, temperatureUnit, toggleTemperatureUnit } = useWeather();

  if (!weatherData) return null;

  const { location, current } = weatherData;
  const temp = temperatureUnit === 'celsius' ? current.temp_c : current.temp_f;
  const feelsLike = temperatureUnit === 'celsius' ? current.feelslike_c : current.feelslike_f;
  const windSpeed = temperatureUnit === 'celsius' ? current.wind_kph : current.wind_mph;
  const windUnit = temperatureUnit === 'celsius' ? 'km/h' : 'mph';
  const tempUnit = temperatureUnit === 'celsius' ? '°C' : '°F';
  const visibility = temperatureUnit === 'celsius' ? current.vis_km : current.vis_miles;
  const visUnit = temperatureUnit === 'celsius' ? 'km' : 'mi';

 const formatTime = (dateTimeStr: string) => {
  return new Date(dateTimeStr).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

  const formatDate = (dateTimeStr: string) => {
    return new Date(dateTimeStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-white/90">
          <MapPin className="h-5 w-5" />
          <div>
            <h2 className="text-2xl font-bold">{location.name}</h2>
            <p className="text-base text-white/80">
              {location.region && `${location.region}, `}{location.country}
            </p>
            <p className="text-sm text-white/60">
              {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
            </p>
          </div>
        </div>
        <button
          onClick={toggleTemperatureUnit}
          className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 hover:scale-105"
          title="Toggle temperature unit"
        >
          <Thermometer className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="80" text-anchor="middle" dominant-baseline="central">${current.condition.icon}</text></svg>`)}`}
            alt={current.condition.text}
            className="w-24 h-24"
          />
          <div className="text-left">
            <div className="text-6xl font-light text-white">
              {Math.round(temp)}
              <span className="text-3xl text-white/80">{tempUnit}</span>
            </div>
            <div className="text-white/70 text-lg">
              Feels like {Math.round(feelsLike)}{tempUnit}
            </div>
          </div>
        </div>
        <p className="text-xl text-white/90 mb-2">{current.condition.text}</p>
        <div className="text-white/70">
          <p>{formatDate(location.localtime)}</p>
          <p>{formatTime(location.localtime)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-2xl p-4 text-center">
          <Wind className="h-6 w-6 text-white/80 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Wind</p>
          <p className="text-white font-semibold">
            {Math.round(windSpeed)} {windUnit}
          </p>
          <p className="text-white/60 text-xs">{current.wind_dir}</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 text-center">
          <Droplets className="h-6 w-6 text-white/80 mx-auto mb-2 background:red"  />
          <p className="text-white/70 text-sm">Humidity</p>
          <p className="text-white font-semibold">{current.humidity}%</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 text-center">
          <Eye className="h-6 w-6 text-white/80 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Visibility</p>
          <p className="text-white font-semibold">
            {Math.round(visibility)} {visUnit}
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 text-center">
          <Gauge className="h-6 w-6 text-white/80 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Pressure</p>
          <p className="text-white font-semibold">
            {Math.round(current.pressure_mb)} mb
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 text-center col-span-2">
          <p className="text-white/70 text-sm">Cloud Coverage</p>
          <p className="text-white font-semibold">{current.cloud}%</p>
          <div className="w-full bg-white/20 rounded-full h-2 mt-2">
            <div 
              className="bg-white/80 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${current.cloud}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}