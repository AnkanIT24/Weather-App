import { fetchWeatherData } from './api.js';
import { renderAll, setLoading } from './ui.js';

let weatherLocation = "howrah";
let unitMode = "C";
let rawWeatherData = null;

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const curtain = document.getElementById('theme-curtain');
const sunIcon = document.getElementById('theme-sun');
const moonIcon = document.getElementById('theme-moon');

themeToggle.addEventListener('click', (e) => {
    const isDark = document.body.classList.contains('dark-mode');
    const nextTheme = isDark ? 'light' : 'dark';
    const x = e.clientX;
    const y = e.clientY;

    curtain.style.background = nextTheme === 'dark' ? '#0f172a' : '#f8fafc';

    const tl = gsap.timeline();
    tl.to(curtain, {
        clipPath: `circle(150% at ${x}px ${y}px)`,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
            document.body.classList.toggle('dark-mode');
            sunIcon.style.display = nextTheme === 'dark' ? 'none' : 'block';
            moonIcon.style.display = nextTheme === 'dark' ? 'block' : 'none';
            gsap.set(curtain, { clipPath: `circle(0% at ${x}px ${y}px)` });
        }
    });

    gsap.fromTo(themeToggle, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
});

// Unit Toggle
const unitToggle = document.getElementById('mode-toggle');
unitToggle.addEventListener('click', (e) => {
    if (e.target.dataset.unit) {
        unitMode = e.target.dataset.unit;
        Array.from(unitToggle.children).forEach(span => span.classList.toggle('active'));
        if (rawWeatherData) renderAll(rawWeatherData, unitMode);
    }
});

async function showForecast(locationOverride) {
    setLoading(true);
    const loc = locationOverride || weatherLocation;
    try {
        rawWeatherData = await fetchWeatherData(loc);
        renderAll(rawWeatherData, unitMode);
    } catch (error) {
        console.error(error);
        alert("Could not fetch weather. Please try again.");
        setLoading(false);
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
            () => { showForecast(); }
        );
    } else {
        showForecast();
    }
}

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

initGeolocation();
