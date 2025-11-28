import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) console.warn('[openweatherService] OPENWEATHER_API_KEY not set');

export async function getCurrentWeather(lat, lon) {
    if (!lat || !lon) throw new Error('Missing lat or lon');
    if (!API_KEY) throw new Error('OPENWEATHER_API_KEY not configured');

    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const resp = await axios.get(url, {
        params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'fr' },
        timeout: 8000
    });

    const d = resp.data;
    return {
        provider: 'openweather',
        coord: d.coord,
        temp: d.main?.temp,
        feels_like: d.main?.feels_like,
        pressure: d.main?.pressure,
        humidity: d.main?.humidity,
        wind_speed: d.wind?.speed,
        wind_deg: d.wind?.deg,
        weather: d.weather?.[0]?.main,
        weather_description: d.weather?.[0]?.description,
        icon: d.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png` : null,
        raw: d
    };
}