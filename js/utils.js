export function fToC(f) { return parseFloat(((f - 32) * 5 / 9).toFixed(1)); }

export function formatValue(val, unitMode) {
    return unitMode === "C" ? fToC(val) : val;
}

export function getClothingAdvice(tempC, condition) {
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
