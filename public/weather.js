// Import weather icon images
import clearUrl from '/images/weather/clear.png'
import thunderstormUrl from '/images/weather/thunderstorm.png'
import snowUrl from '/images/weather/snow.png'
import fewCloudsUrl from '/images/weather/fewClouds.png'
import scatteredCloudsUrl from '/images/weather/scatteredClouds.png'
import brokenCloudsUrl from '/images/weather/brokenClouds.png'
import showerRainUrl from '/images/weather/showerRain.png'
import rainUrl from '/images/weather/rain.png'
import mistUrl from '/images/weather/mist.png'

// DOM elements
const elements = {
    currentTemp: document.getElementById("currentTemp"),
    place: document.getElementById("place"),
    weatherIcon: document.getElementById("weatherIcon"),
    weatherIconSM: document.getElementById("weatherIconSM"),
    weather: document.getElementById("weather"),
    weatherDescription: document.getElementById("weatherDescription"),
    dateElement: document.getElementById("date"),
    tempMinElement: document.getElementById("tempMinElement"),
    tempMaxElement: document.getElementById("tempMaxElement"),
    pressureElement: document.getElementById("pressureElement"),
    humidityElement: document.getElementById("humidityElement"),
    visibilityElement: document.getElementById("visibilityElement"),
    windSpeedElement: document.getElementById("windSpeedElement"),
    searchInput: document.getElementById("searchInput"),
    searchButton: document.getElementById('searchButton')
};

// Set current date
elements.dateElement.textContent = new Date().toDateString();

// Function to sanitize strings
function sanitizeString(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Function to update UI with weather data
function updateUI(data) {
    elements.currentTemp.textContent = Math.round(data.main.temp);
    elements.tempMinElement.textContent = Math.round(data.main.temp_min);
    elements.tempMaxElement.textContent = Math.round(data.main.temp_max);
    elements.pressureElement.textContent = data.main.pressure;
    elements.humidityElement.textContent = data.main.humidity;
    elements.visibilityElement.textContent = data.visibility;
    elements.windSpeedElement.textContent = data.wind.speed;
    elements.weatherIconSM.src = `https://openweathermap.org/img/wn/${sanitizeString(data.weather[0].icon)}@2x.png`;
    elements.weather.textContent = sanitizeString(data.weather[0].main);
    elements.weatherDescription.textContent = sanitizeString(data.weather[0].description);
    elements.place.textContent = `${sanitizeString(data.name)}, ${sanitizeString(data.sys.country)}`;

    // Set weather icon
    const weatherMain = sanitizeString(data.weather[0].main);
    const weatherDetail = sanitizeString(data.weather[0].description);
    elements.weatherIcon.src = getWeatherIcon(weatherMain, weatherDetail);
}

// Function to get weather icon based on conditions
function getWeatherIcon(main, detail) {
    switch (main) {
        case "Clear": return clearUrl;
        case "Thunderstorm": return thunderstormUrl;
        case "Snow": return snowUrl;
        case "Clouds":
            if (detail === "few clouds") return fewCloudsUrl;
            if (detail === "scattered clouds") return scatteredCloudsUrl;
            return brokenCloudsUrl;
        case "Drizzle": return showerRainUrl;
        case "Rain":
            if (detail.includes("shower")) return showerRainUrl;
            return rainUrl;
        default: return mistUrl;
    }
}

// Function to fetch weather data
async function fetchWeatherData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data fetch failed');
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data. Please try again.');
    }
}

// Function to get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    const data = await fetchWeatherData(`/api/weather?lat=${lat}&lon=${lon}`);
    if (data) updateUI(data);
}

// Function to get weather by city name
async function getWeatherByCity(city) {
    const data = await fetchWeatherData(`/api/weather?city=${encodeURIComponent(city)}`);
    if (data) updateUI(data);
}

// Event listener for search button
elements.searchButton.addEventListener('click', (event) => {
    event.preventDefault();
    const searchValue = elements.searchInput.value.trim();
    if (searchValue) {
        getWeatherByCity(sanitizeString(searchValue));
    }
});

// Get user's location and fetch weather data
navigator.geolocation.getCurrentPosition(
    (position) => getWeatherByCoords(position.coords.latitude, position.coords.longitude),
    () => alert("Couldn't find your location. Please search for a city.")
);