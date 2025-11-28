import express from 'express';
import * as wttrService from '../services/wttrService.js';
import * as openweatherService from '../services/openweatherService.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { lat, lon, provider } = req.query;
        if (!lat || !lon) return res.status(400).json({ msg: 'lat and lon query parameters are required' });

        if (!provider || provider === 'wttr') {
            const weather = await wttrService.getCurrentWeather(lat, lon);
            return res.json(weather);
        }

        if (provider === 'openweather') {
            const weather = await openweatherService.getCurrentWeather(lat, lon);
            return res.json(weather);
        }

        return res.status(400).json({ msg: 'Unknown weather provider' });
    } catch (err) {
        console.error('weather error:', err?.message || err);
        res.status(500).json({ msg: 'Failed to fetch weather', error: err?.message });
    }
});

export default router;