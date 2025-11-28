import axios from 'axios';

export async function getCurrentWeather(lat, lon) {
    if (!lat || !lon) throw new Error('Missing lat or lon');
    const url = `https://wttr.in/${lat},${lon}?format=j1`;
    const resp = await axios.get(url, { timeout: 8000 });
    const data = resp.data;
    const cur = data?.current_condition?.[0] || {};

    return {
        provider: 'wttr',
        temperature: cur.temp_C ? Number(cur.temp_C) : null,
        feels_like: cur.FeelsLikeC ? Number(cur.FeelsLikeC) : null,
        humidity: cur.humidity ? Number(cur.humidity) : null,
        wind_speed_kmph: cur.windspeedKmph ? Number(cur.windspeedKmph) : null,
        wind_dir_deg: cur.winddirDegree ? Number(cur.winddirDegree) : null,
        condition: cur.weatherDesc?.[0]?.value || null,
        icon: cur.weatherIconUrl?.[0]?.value || null,
        raw: data
    };
}