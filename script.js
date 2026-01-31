const baseWeatherUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"
const weatherApiKey = "?key=URQR6AXAQN9ERTS5DA9CZ4CYK"
const weather = document.querySelector("#weather");
const loading = document.querySelector("#loading");
let weatherLocation = "howrah";
let mode = "C";
let storeTemp, storeFeels;

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('theme-sun');
const moonIcon = document.getElementById('theme-moon');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    sunIcon.style.display = isDark ? 'none' : 'block';
    moonIcon.style.display = isDark ? 'block' : 'none';
});

function tempToggleChange(mainTemp, feelsTemp) {
    const temp = document.querySelector(".temperature");
    temp.innerHTML = `${mainTemp}<sup>°</sup>`;

    const feelsValue = document.querySelector(".detail-item.feels .value");
    feelsValue.textContent = `${feelsTemp}°`;
}

function updateWeather(allData) {
    console.log(allData);
    weather.style.display = window.innerWidth < 1024 ? "flex" : "grid"; // Flex for mobile, grid for PC
    loading.style.display = "none";

    // Header
    const address = document.querySelector(".address");
    address.textContent = allData.address;

    const dateEl = document.querySelector(".current-date");
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

    // Hero
    const temp = document.querySelector(".temperature");
    temp.innerHTML = `${allData.temp}<sup>°</sup>`;

    const conditions = document.querySelector(".conditions");
    conditions.textContent = allData.conditions;

    // Details Grid
    document.querySelector(".detail-item.feels .value").textContent = `${allData.feelsLike}°`;
    document.querySelector(".detail-item.humidity .value").textContent = `${allData.humidity}%`;
    document.querySelector(".detail-item.wind .value").textContent = `${allData.wind} km/h`;

    document.getElementById("sunrise").textContent = allData.sunrise.slice(0, 5);
    document.getElementById("sunset").textContent = allData.sunset.slice(0, 5);
    document.getElementById("pressure").textContent = `${allData.pressure} hPa`;
    document.getElementById("visibility").textContent = `${allData.visibility} km`;
    document.getElementById("uv").textContent = `${allData.uv} low`;
}

async function showForecast() {
    weather.style.display = "none";
    loading.style.display = "block";
    try {
        const response = await fetch(baseWeatherUrl + weatherLocation + weatherApiKey);
        const weatherData = await response.json();

        const dayData = weatherData.days[0];
        const address = weatherData.resolvedAddress;

        let temp = dayData.temp;
        storeTemp = temp;
        let feelsLike = dayData.feelslike;
        storeFeels = feelsLike;

        const humidity = dayData.humidity;
        const wind = dayData.windspeed;
        let conditions = dayData.conditions;
        conditions = conditions.split(", ")[0];

        const sunrise = dayData.sunrise;
        const sunset = dayData.sunset;
        const pressure = dayData.pressure;
        const visibility = dayData.visibility;
        const uv = dayData.uvindex;

        if (mode == "C") {
            temp = fahrenheitToCelsius(temp);
            feelsLike = fahrenheitToCelsius(feelsLike);
        }

        updateWeather({
            address, temp, feelsLike, humidity, wind, conditions,
            sunrise, sunset, pressure, visibility, uv
        });
    } catch (error) {
        console.error("Error fetching weather:", error);
        loading.style.display = "none";
    }
}

function fahrenheitToCelsius(fahrenheit) {
    return parseFloat(((fahrenheit - 32) * 5 / 9).toFixed(1));
}

const getLocationBtn = document.querySelector("#submit");
const locationInput = document.querySelector("#location");

getLocationBtn.addEventListener("click", () => {
    weatherLocation = locationInput.value;
    showForecast();
});

locationInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        weatherLocation = locationInput.value;
        showForecast();
    }
});

showForecast();
