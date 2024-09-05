const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();
const validator = require('validator');

if (!process.env.OPENWEATHERMAP_API_KEY) {
    throw new Error('OPENWEATHERMAP_API_KEY is not set in environment variables');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/weather', async (req, res) => {
    try {
        let url;
        if (req.query.lat && req.query.lon) {
            const lat = validator.toFloat(req.query.lat);
            const lon = validator.toFloat(req.query.lon);
            if (!validator.isLatLong(`${lat},${lon}`)) {
                return res.status(400).json({ error: 'Invalid coordinates' });
            }
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
        } else if (req.query.city) {
            const city = validator.escape(req.query.city);
            url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
        } else {
            return res.status(400).json({ error: 'Invalid parameters' });
        }

        const response = await axios.get(url, { timeout: 5000 }); // 5 second timeout
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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;