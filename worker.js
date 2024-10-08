import { createWorkerAdapter } from '@cloudflare/workers-adapter';
import express from 'express';
import axios from 'axios';
import validator from 'validator';

const app = express();

app.get('/api/weather', async (req, res) => {
    try {
        let url;
        if (req.query.lat && req.query.lon) {
            const lat = validator.toFloat(req.query.lat);
            const lon = validator.toFloat(req.query.lon);
            if (!validator.isLatLong(`${lat},${lon}`)) {
                return res.status(400).json({ error: 'Invalid coordinates' });
            }
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`;
        } else if (req.query.city) {
            const city = validator.escape(req.query.city);
            url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`;
        } else {
            return res.status(400).json({ error: 'Invalid parameters' });
        }

        const response = await axios.get(url, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        if (error.code === 'ECONNABORTED') {
            res.status(504).json({ error: 'Request timed out' });
        } else {
            res.status(500).json({ error: 'Failed to fetch weather data' });
        }
    }
});

// Create a worker adapter
const adapter = createWorkerAdapter(app);

// Export the worker adapter
export default {
    fetch: (request, env, ctx) => {
        // Bind the API key from the environment to a global variable
        globalThis.OPENWEATHERMAP_API_KEY = env.OPENWEATHERMAP_API_KEY;
        return adapter.fetch(request, env, ctx);
    }
};