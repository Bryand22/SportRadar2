import axios from 'axios';

const API_KEY = process.env.ACCUWEATHER_API_KEY;
const BASE_URL = 'http://dataservice.accuweather.com';

/**
 * Récupère la location key AccuWeather à partir de la latitude/longitude
 */
export async function getLocationKey(lat, lon) {
    const url = `${BASE_URL}/locations/v1/cities/geoposition/search`;
    const response = await axios.get(url, {
        params: {
            apikey: API_KEY,
            q: `${lat},${lon}`
        }
    });
    return response.data.Key;
}

/**
 * Récupère la météo actuelle pour une location key
 */
export async function getCurrentWeather(locationKey) {
    const url = `${BASE_URL}/currentconditions/v1/${locationKey}`;
    const response = await axios.get(url, {
        params: {
            apikey: API_KEY,
            details: true
        }
    });
    return response.data[0];
}

/**
 * Récupère les prévisions journalières (par défaut 5 jours)
 */
export async function getForecast(locationKey, days = 5) {
    const url = `${BASE_URL}/forecasts/v1/daily/${days}day/${locationKey}`;
    const response = await axios.get(url, {
        params: {
            apikey: API_KEY,
            metric: true
        }
    });
    return response.data;
} 