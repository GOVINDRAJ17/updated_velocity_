/**
 * Weather utility for Velocity
 * Uses wttr.in (Public, No API Key required)
 */

export interface WeatherData {
  temp: string;
  condition: string;
  location: string;
}

export async function fetchWeather(location: string): Promise<WeatherData | null> {
  if (!location) return null;
  
  try {
    // We clean the location name for the URL
    const cleanLocation = encodeURIComponent(location.split(',')[0].trim());
    const res = await fetch(`https://wttr.in/${cleanLocation}?format=j1`);
    
    if (!res.ok) throw new Error('Weather signal lost');
    
    const data = await res.json();
    const current = data.current_condition[0];
    
    return {
      temp: `${current.temp_C}°C`,
      condition: current.weatherDesc[0].value,
      location: location.split(',')[0].trim()
    };
  } catch (err) {
    console.warn(`Could not fetch weather for ${location}:`, err);
    return null;
  }
}
