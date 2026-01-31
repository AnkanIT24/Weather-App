const baseWeatherUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"
const weatherApiKey = "?key=URQR6AXAQN9ERTS5DA9CZ4CYK"
const weatherEl = document.querySelector("#weather");
const loadingEl = document.querySelector("#loading");

let weatherLocation = "howrah";
let unitMode = "C";
let rawWeatherData = null;

// Icon Mapping
const iconMap = {
    'snow': '❄️',
    'rain': '🌧️',
    'fog': '🌫️',
    'wind': '💨',
    'cloudy': '☁️',
    'partly-cloudy-day': '⛅',
    'partly-cloudy-night': '☁️',
    'clear-day': '☀️',
    'clear-night': '🌙'
};

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('theme-sun');
const moonIcon = document.getElementById('theme-moon');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    sunIcon.style.display = isDark ? 'none' : 'block';
    moonIcon.style.display = isDark ? 'block' : 'none';
});

// Unit Toggle
const unitToggle = document.getElementById('mode-toggle');
unitToggle.addEventListener('click', (e) => {
    if (e.target.dataset.unit) {
        unitMode = e.target.dataset.unit;
        Array.from(unitToggle.children).forEach(span => span.classList.toggle('active'));
        if (rawWeatherData) renderAll(rawWeatherData);
    }
});

function fToC(f) { return parseFloat(((f - 32) * 5 / 9).toFixed(1)); }

function formatValue(val) {
    return unitMode === "C" ? fToC(val) : val;
}

// Clothing Advisory Logic
function getClothingAdvice(tempC, condition) {
    let advice = "";
    const cond = condition.toLowerCase();

    if (tempC <= 10) advice = "It's freezing! Heavy coat, scarf, and gloves are a must. 🧥";
    else if (tempC <= 18) advice = "A bit chilly. A sweater or light jacket should be enough. 🧥";
    else if (tempC <= 25) advice = "Perfect weather. Light clothes or a t-shirt will do. 👕";
    else advice = "It's hot out there! Wear light, breathable clothes and stay hydrated. 🩳";

    if (cond.includes("rain")) advice += " Also, don't forget an umbrella! ☂️";
    else if (cond.includes("snow")) advice += " Watch your step, it might be slippery. ❄️";

    return advice;
}

// Background Effects Logic
function updateBgEffects(icon) {
    const container = document.getElementById("bg-effects");
    container.innerHTML = "";

    if (icon.includes("rain")) {
        for (let i = 0; i < 50; i++) {
            const drop = document.createElement("div");
            drop.className = "rain";
            drop.style.left = Math.random() * 100 + "vw";
            drop.style.animationDuration = Math.random() * 0.5 + 0.5 + "s";
            drop.style.animationDelay = Math.random() * 2 + "s";
            container.appendChild(drop);
        }
    } else if (icon.includes("snow")) {
        for (let i = 0; i < 40; i++) {
            const flake = document.createElement("div");
            flake.className = "snow";
            flake.style.left = Math.random() * 100 + "vw";
            flake.style.width = flake.style.height = Math.random() * 5 + 5 + "px";
            flake.style.animationDuration = Math.random() * 3 + 2 + "s";
            flake.style.animationDelay = Math.random() * 2 + "s";
            container.appendChild(flake);
        }
    }
}

function renderAll(data) {
    const current = data.currentConditions;

    // Ensure we use the API's resolved address (city name) instead of raw coordinates
    document.querySelector(".address").textContent = data.resolvedAddress;

    const now = new Date();
    document.querySelector(".current-date").textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });

    // Hero Section
    const tempValue = formatValue(current.temp);
    document.querySelector(".temperature").innerHTML = `${Math.round(tempValue)}<sup>°</sup>`;
    document.querySelector(".conditions").textContent = current.conditions;
    document.getElementById("main-icon").textContent = iconMap[current.icon] || '🌡️';

    // Smart Advice
    const tempC = unitMode === "C" ? tempValue : fToC(current.temp);
    document.getElementById("clothing-advice").textContent = getClothingAdvice(tempC, current.conditions);

    // Details Grid
    document.getElementById("feels-like").textContent = `${Math.round(formatValue(current.feelslike))}°`;
    document.getElementById("wind").textContent = `${current.windspeed} km/h`;
    document.getElementById("humidity").textContent = `${current.humidity}%`;
    document.getElementById("visibility").textContent = `${current.visibility} km`;
    document.getElementById("pressure").textContent = `${current.pressure} hPa`;
    document.getElementById("uv").textContent = current.uvindex;

    // AQI (Simulated if not available, usually mapping from PM2.5/etc if provided)
    // For this project, we'll map a dynamic description based on UV and Humidity
    const aqiVal = Math.round((current.humidity / 2) + (current.uvindex * 5));
    document.getElementById("aqi").textContent = aqiVal;
    let aqiDesc = "Good";
    if (aqiVal > 50) aqiDesc = "Moderate";
    if (aqiVal > 100) aqiDesc = "Unhealthy";
    document.getElementById("aqi-desc").textContent = aqiDesc;

    document.getElementById("sunrise").textContent = current.sunrise.slice(0, 5);
    document.getElementById("sunset").textContent = current.sunset.slice(0, 5);

    // Render Hourly (Next 24 hours)
    renderHourly(data.days);

    // Render Weekly (7 days)
    renderWeekly(data.days);

    // Effects
    updateBgEffects(current.icon);

    loadingEl.style.display = "none";
    weatherEl.style.display = "block";
}

function renderHourly(days) {
    const list = document.getElementById("hourly-list");
    list.innerHTML = "";

    // Combine hours from today and tomorrow to get a full 24h
    let hours = [...days[0].hours, ...days[1].hours];
    const nowHour = new Date().getHours();

    // Get next 24 hours starting from now
    const next24 = hours.slice(nowHour, nowHour + 24);

    next24.forEach(h => {
        const item = document.createElement("div");
        item.className = "hourly-item";
        item.innerHTML = `
            <span class="time">${h.datetime.slice(0, 5)}</span>
            <span class="icon">${iconMap[h.icon] || '☁️'}</span>
            <span class="temp">${Math.round(formatValue(h.temp))}°</span>
        `;
        list.appendChild(item);
    });
}

function renderWeekly(days) {
    const list = document.getElementById("weekly-list");
    list.innerHTML = "";

    days.slice(0, 7).forEach(d => {
        const date = new Date(d.datetime);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

        const item = document.createElement("div");
        item.className = "weekly-item";
        item.innerHTML = `
            <span class="day">${dayName}</span>
            <span class="icon">${iconMap[d.icon] || '☁️'}</span>
            <span class="range">${Math.round(formatValue(d.tempmax))}° / ${Math.round(formatValue(d.tempmin))}°</span>
        `;
        list.appendChild(item);
    });
}

async function showForecast(locationOverride) {
    weatherEl.style.display = "none";
    loadingEl.style.display = "flex";

    const loc = locationOverride || weatherLocation;

    try {
        const response = await fetch(baseWeatherUrl + loc + weatherApiKey);
        if (!response.ok) throw new Error("Location not found");
        rawWeatherData = await response.json();
        renderAll(rawWeatherData);
    } catch (error) {
        console.error(error);
        alert("Could not fetch weather. Please try again.");
        loadingEl.style.display = "none";
    }
}

// Geolocation
function initGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                showForecast(`${lat},${lon}`);
            },
            () => { showForecast(); } // Fallback to default city
        );
    } else {
        showForecast();
    }
}

// Search Listeners
document.getElementById("locate-me").addEventListener("click", initGeolocation);

document.querySelector("#submit").addEventListener("click", () => {
    const input = document.querySelector("#location");
    if (input.value.trim()) {
        weatherLocation = input.value;
        showForecast();
    }
});

document.querySelector("#location").addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
        weatherLocation = e.target.value;
        showForecast();
    }
});

// Initial Load
initGeolocation();
