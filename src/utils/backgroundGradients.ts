export function getWeatherGradient(condition: string, isDay: boolean = true): string {
  const conditionLower = condition.toLowerCase();
  
  // Nighttime gradients
  if (!isDay) {
    if (conditionLower.includes('clear')) {
      return 'from-indigo-900 via-purple-900 to-indigo-800';
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return 'from-gray-800 via-gray-700 to-gray-900';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'from-gray-900 via-blue-900 to-gray-800';
    } else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
      return 'from-gray-700 via-blue-800 to-gray-900';
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return 'from-gray-900 via-purple-900 to-black';
    }
    return 'from-indigo-900 via-purple-900 to-indigo-800';
  }
  
  // Daytime gradients
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return 'from-blue-400 via-blue-500 to-blue-600';
  } else if (conditionLower.includes('partly') || conditionLower.includes('mainly')) {
    return 'from-blue-400 via-blue-500 to-gray-500';
  } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
    return 'from-gray-400 via-gray-500 to-gray-600';
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'from-gray-500 via-blue-600 to-gray-700';
  } else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
    return 'from-gray-300 via-blue-400 to-gray-500';
  } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return 'from-gray-700 via-purple-700 to-gray-800';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'from-gray-400 via-gray-300 to-gray-500';
  }
  
  // Default sunny gradient
  return 'from-blue-400 via-blue-500 to-blue-600';
}