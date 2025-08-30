import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { WeatherData, LocationSuggestion, TemperatureUnit, WeatherContextType } from '../types/weather';
import { weatherApi } from '../utils/weatherApi';

interface WeatherState {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  temperatureUnit: TemperatureUnit;
  searchSuggestions: LocationSuggestion[];
}

type WeatherAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WEATHER_DATA'; payload: WeatherData }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'TOGGLE_TEMPERATURE_UNIT' }
  | { type: 'SET_SUGGESTIONS'; payload: LocationSuggestion[] }
  | { type: 'CLEAR_SUGGESTIONS' };

const initialState: WeatherState = {
  weatherData: null,
  loading: false,
  error: null,
  temperatureUnit: 'celsius',
  searchSuggestions: []
};

function weatherReducer(state: WeatherState, action: WeatherAction): WeatherState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_WEATHER_DATA':
      return { ...state, weatherData: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'TOGGLE_TEMPERATURE_UNIT':
      return { 
        ...state, 
        temperatureUnit: state.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius' 
      };
    case 'SET_SUGGESTIONS':
      return { ...state, searchSuggestions: action.payload };
    case 'CLEAR_SUGGESTIONS':
      return { ...state, searchSuggestions: [] };
    default:
      return state;
  }
}

const WeatherContext = createContext<WeatherContextType | null>(null);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  const searchLocation = useCallback(async (location: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const data = await weatherApi.getCurrentWeather(location);
      dispatch({ type: 'SET_WEATHER_DATA', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch weather data. Please try again.' });
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      dispatch({ type: 'SET_ERROR', payload: 'Geolocation is not supported by this browser.' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      const data = await weatherApi.getWeatherByCoords(latitude, longitude);
      dispatch({ type: 'SET_WEATHER_DATA', payload: data });
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            dispatch({ type: 'SET_ERROR', payload: 'Location access denied. Please enable location services.' });
            break;
          case error.POSITION_UNAVAILABLE:
            dispatch({ type: 'SET_ERROR', payload: 'Location information is unavailable.' });
            break;
          case error.TIMEOUT:
            dispatch({ type: 'SET_ERROR', payload: 'Location request timed out.' });
            break;
          default:
            dispatch({ type: 'SET_ERROR', payload: 'Failed to get current location.' });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to get current location.' });
      }
    }
  }, []);

  const toggleTemperatureUnit = useCallback(() => {
    dispatch({ type: 'TOGGLE_TEMPERATURE_UNIT' });
  }, []);

  const getLocationSuggestions = useCallback(async (query: string) => {
    try {
      const suggestions = await weatherApi.searchLocations(query);
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
    } catch (error) {
      dispatch({ type: 'CLEAR_SUGGESTIONS' });
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    dispatch({ type: 'CLEAR_SUGGESTIONS' });
  }, []);

  const value: WeatherContextType = {
    weatherData: state.weatherData,
    loading: state.loading,
    error: state.error,
    temperatureUnit: state.temperatureUnit,
    searchLocation,
    getCurrentLocation,
    toggleTemperatureUnit,
    searchSuggestions: state.searchSuggestions,
    getLocationSuggestions,
    clearSuggestions
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}