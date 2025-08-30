import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const {searchLocation, getCurrentLocation, getLocationSuggestions, searchSuggestions, clearSuggestions,loading } = useWeather();


  // handle clicks outside the search bar,it hides the search suggestions by setting showSuggestions to false.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  //given a query, fetch location suggestions after a debounce delay of 300ms.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 3) {
        getLocationSuggestions(query);
        setShowSuggestions(true);
      } else {
        clearSuggestions();
        setShowSuggestions(false);
      }
    }, 300); // debouncing delay

    return () => clearTimeout(timeoutId); 
  }, [query, getLocationSuggestions, clearSuggestions]);

  // click on search button or press enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchLocation(query.trim());  //stop default reload behavior
      setShowSuggestions(false);
      setQuery('');
    }
  };
// click on suggestion from dropdown
  const handleSuggestionClick = (suggestion: any) => {
    const locationQuery = `${suggestion.name}, ${suggestion.country}`;
    searchLocation(locationQuery);
    setQuery('');
    setShowSuggestions(false);
    clearSuggestions();
  };
// user click on current location button
  const handleCurrentLocation = () => {
    getCurrentLocation();
    setQuery('');
    setShowSuggestions(false);
  };

  //user click on clear button
  const clearSearch = () => {
    setQuery('');
    clearSuggestions();
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a city..."
            className="w-full bg-white/20 border border-white/30 rounded-2xl py-3 pl-12 pr-20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
            disabled={loading}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-white/70" />
              </button>
            )}
            <button
              type="button"
              onClick={handleCurrentLocation}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-105"
              title="Use current location"
              disabled={loading}
            >
              <MapPin className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </form>

      {showSuggestions && searchSuggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
          {searchSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-white/100 first:rounded-t-2xl last:rounded-b-2xl transition-colors duration-200 flex items-center gap-3"
            >
              <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <div>
                <div className="text-gray-900 font-medium">
                  {suggestion.name}
                </div>
                <div className="text-gray-600 text-sm">
                  {suggestion.region}, {suggestion.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}