import { baseWeatherUrl, weatherApiKey } from './config.js';

export async function fetchWeatherData(location) {
    const response = await fetch(baseWeatherUrl + location + weatherApiKey);
    if (!response.ok) throw new Error("Location not found");
    return await response.json();
}
