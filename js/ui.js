import { iconMap } from './config.js';
import { fToC, formatValue, getClothingAdvice } from './utils.js';

// Selectors
const weatherEl = document.querySelector("#weather");
const loadingEl = document.querySelector("#loading");

// GSAP Animations
export function animateEntrance() {
    gsap.fromTo(".location-info, .hero-card, .info-banner, .hourly-section, .sidebar, .details-section",
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            clearProps: "transform"
        }
    );
}

export function updateBgEffects(icon) {
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

function renderHourly(days, unitMode) {
    const list = document.getElementById("hourly-list");
    list.innerHTML = "";

    // Combine hours from today and tomorrow
    let hours = [...days[0].hours, ...days[1].hours];
    const nowHour = new Date().getHours();
    const next24 = hours.slice(nowHour, nowHour + 24);

    next24.forEach(h => {
        const item = document.createElement("div");
        item.className = "hourly-item";
        item.innerHTML = `
            <span class="time">${h.datetime.slice(0, 5)}</span>
            <span class="icon">${iconMap[h.icon] || '☁️'}</span>
            <span class="temp">${Math.round(formatValue(h.temp, unitMode))}°</span>
        `;
        list.appendChild(item);
    });
}

function renderWeekly(days, unitMode) {
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
            <span class="range">${Math.round(formatValue(d.tempmax, unitMode))}° / ${Math.round(formatValue(d.tempmin, unitMode))}°</span>
        `;
        list.appendChild(item);
    });
}

export function renderAll(data, unitMode) {
    const current = data.currentConditions;

    document.querySelector(".address").textContent = data.resolvedAddress;

    const now = new Date();
    document.querySelector(".current-date").textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });

    // Hero Section
    const tempValue = formatValue(current.temp, unitMode);
    document.querySelector(".temperature").innerHTML = `${Math.round(tempValue)}<sup>°</sup>`;
    document.querySelector(".conditions").textContent = current.conditions;
    document.getElementById("main-icon").textContent = iconMap[current.icon] || '🌡️';

    // Smart Advice
    const tempC = unitMode === "C" ? tempValue : fToC(current.temp);
    document.getElementById("clothing-advice").textContent = getClothingAdvice(tempC, current.conditions);

    // Details Grid
    document.getElementById("feels-like").textContent = `${Math.round(formatValue(current.feelslike, unitMode))}°`;
    document.getElementById("wind").textContent = `${current.windspeed} km/h`;
    document.getElementById("humidity").textContent = `${current.humidity}%`;
    document.getElementById("visibility").textContent = `${current.visibility} km`;
    document.getElementById("pressure").textContent = `${current.pressure} hPa`;
    document.getElementById("uv").textContent = current.uvindex;

    // AQI Logic
    const aqiVal = Math.round((current.humidity / 2) + (current.uvindex * 5));
    document.getElementById("aqi").textContent = aqiVal;
    let aqiDesc = "Good";
    if (aqiVal > 50) aqiDesc = "Moderate";
    if (aqiVal > 100) aqiDesc = "Unhealthy";
    document.getElementById("aqi-desc").textContent = aqiDesc;

    document.getElementById("sunrise").textContent = current.sunrise.slice(0, 5);
    document.getElementById("sunset").textContent = current.sunset.slice(0, 5);

    renderHourly(data.days, unitMode);
    renderWeekly(data.days, unitMode);
    updateBgEffects(current.icon);

    setLoading(false);
    animateEntrance();
}

export function setLoading(isLoading) {
    if (isLoading) {
        loadingEl.style.display = "flex";
        weatherEl.style.display = "none";
    } else {
        loadingEl.style.display = "none";
        weatherEl.style.display = "block";
    }
}
