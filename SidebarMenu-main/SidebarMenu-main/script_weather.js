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
        displayAirQualityChart(airData.list[0].components);
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

/* ______*/


// Afficher un graphique des composants de qualité de l'air
function displayAirQualityChart(components) {
    // Charger Chart.js si non présent
    if (typeof Chart === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        document.head.appendChild(script);
        script.onload = () => renderAirQualityChart(components);
    } else {
        renderAirQualityChart(components);
    }
}

// Créer et afficher le graphique
function renderAirQualityChart(components) {
    const chartData = {
        labels: ["PM2.5", "PM10", "NOx", "NH3", "CO2", "SO2"],
        datasets: [
            {
                label: "Air Quality Components (µg/m³)",
                data: [
                    components.pm2_5,
                    components.pm10,
                    components.nox || 0, // Replace undefined values with 0
                    components.nh3,
                    components.co,
                    components.so2,
                ],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                ],
            },
        ],
    };

    const ctx = document.getElementById("airQualityChart").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: "Air Quality Components",
                },
            },
        },
    });
}