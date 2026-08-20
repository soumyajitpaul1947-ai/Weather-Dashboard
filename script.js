const API_KEY = window.WEATHER_API_KEY;

const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const resultDiv = document.getElementById("weatherResult");
const statusDiv = document.getElementById("status");

function setStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.classList.toggle("error", isError);
}

function renderWeather(data) {
    const temperature = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    resultDiv.innerHTML = `
        <div class="weather-header">
            <h2>${data.name}, ${data.sys.country}</h2>
            <span class="weather-condition">
                ${data.weather[0].main}
            </span>
        </div>

        <p class="temp">${temperature}°C</p>

        <p class="desc">
            ${data.weather[0].description}
        </p>

        <div class="stats">
            <div>
                <span>Feels like</span>
                <strong>${feelsLike}°C</strong>
            </div>

            <div>
                <span>Humidity</span>
                <strong>${humidity}%</strong>
            </div>

            <div>
                <span>Wind</span>
                <strong>${windSpeed} m/s</strong>
            </div>
        </div>
    `;
}

async function getWeather(city) {
    const trimmedCity = city.trim();

    resultDiv.innerHTML = "";
    setStatus("");

    if (!trimmedCity) {
        setStatus("Please enter a city name.", true);
        return;
    }

    if (!API_KEY) {
        setStatus("API key is missing. Check config.js.", true);
        return;
    }

    try {
        setStatus("Fetching weather data...");

        const url =
            `https://api.openweathermap.org/data/2.5/weather` +
            `?q=${encodeURIComponent(trimmedCity)}` +
            `&appid=${API_KEY}` +
            `&units=metric`;

        const response = await fetch(url);
        const data = await response.json();

        console.log("OpenWeather response:", data);

        // Handle API errors properly
        if (!response.ok) {

            if (response.status === 404) {
                setStatus("City not found. Please try again.", true);
            }

            else if (response.status === 401) {
                setStatus(
                    "Invalid or inactive OpenWeather API key.",
                    true
                );
            }

            else if (response.status === 429) {
                setStatus(
                    "API request limit reached. Please try later.",
                    true
                );
            }

            else {
                setStatus(
                    data.message || "Unable to get weather data.",
                    true
                );
            }

            return;
        }

        renderWeather(data);
        setStatus(`Weather loaded for ${data.name}.`);

    } catch (error) {
        console.error("Weather error:", error);

        setStatus(
            "Unable to connect to the weather service.",
            true
        );
    }
}

weatherForm.addEventListener("submit", (event) => {
    event.preventDefault();
    getWeather(cityInput.value);
});

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        getWeather(cityInput.value);
    }
});