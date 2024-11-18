// Clé API et URL de base
const apiKey = "8ab4431e3edf2971b5cb1ceec8cb1e0a"; // Remplacez par votre clé API OpenWeatherMap
const weatherBaseUrl = "https://api.openweathermap.org/data/2.5/weather";
const airQualityBaseUrl = "https://api.openweathermap.org/data/2.5/air_pollution";

// Rechercher une ville
document.querySelector(".search-bar button").addEventListener("click", () => {
    const city = document.querySelector(".search-bar input").value;
    if (city) {
        fetchWeatherData(city);
        fetchAirQualityData(city);
    }
});

// Récupérer les données météo
async function fetchWeatherData(city) {
    try {
        const response = await fetch(
            `${weatherBaseUrl}?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error("Ville introuvable !");
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        alert(error.message);
    }
}

// Afficher l'humidité
function displayWeatherData(data) {
    const humidity = data.main.humidity; // Humidité en %
    document.getElementById("humidity").innerText = `${humidity}%`;
}

// Récupérer les données de qualité de l'air
async function fetchAirQualityData(city) {
    try {
        const geoResponse = await fetch(
            `${weatherBaseUrl}?q=${city}&appid=${apiKey}`
        );
        const geoData = await geoResponse.json();
        const { lat, lon } = geoData.coord;

        const airResponse = await fetch(
            `${airQualityBaseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        const airData = await airResponse.json();
        displayAirQualityData(airData);
    } catch (error) {
        alert("Impossible de récupérer la qualité de l'air.");
    }
}

// Afficher la qualité de l'air
function displayAirQualityData(data) {
    const aqi = data.list[0].main.aqi;
    const aqiDescription = [
        "Bon",
        "Acceptable",
        "Modéré",
        "Mauvais",
        "Très mauvais",
    ][aqi - 1]; // Description en fonction de l'index
    document.getElementById("air-quality").innerText = `${aqiDescription}`;
}
