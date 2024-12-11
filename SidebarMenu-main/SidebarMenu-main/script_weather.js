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
    const temperature = data.main.temp; // Température actuelle
    const feelsLike = data.main.feels_like; // Température ressentie
    const conditions = data.weather[0].description; // Conditions météo (texte)
    const windSpeed = data.wind.speed;
    const weatherIcon = data.weather[0].icon; // Icône météo
    const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
    document.getElementById("humidity").innerText = `${humidity}%`;
    document.getElementById("temperature").innerText = `${temperature}°C`;
    document.getElementById("feels-like").innerText = `${feelsLike}°C`;
    document.getElementById("conditions").innerText = conditions.charAt(0).toUpperCase() + conditions.slice(1); 
    document.getElementById("wind-speed").innerText = `${windSpeed} m/s`;
    document.getElementById("weather-icon").src = iconUrl;
}

// Récupérer les données de qualité de l'air
async function fetchAirQualityData(city) {
    try {
        const geoResponse = await fetch(
            `${weatherBaseUrl}?q=${city}&appid=${apiKey}`
        );
        if (!geoResponse.ok) throw new Error("Ville introuvable !");
        const geoData = await geoResponse.json();
        const { lat, lon } = geoData.coord;

        const airResponse = await fetch(
            `${airQualityBaseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        if (!airResponse.ok) throw new Error("Données de qualité de l'air indisponibles !");
        const airData = await airResponse.json();

        if (!airData || !airData.list || airData.list.length === 0) {
            throw new Error("Aucune donnée disponible pour cette localisation.");
        }

        displayAirQualityComponents(airData.list[0].components);
        displayAirQualityIndex(airData.list[0].main.aqi);
        displayAirQualityChart(airData.list[0].components);
    } catch (error) {
        alert(error.message);
    }
}


function displayAirQualityComponents(components) {
    document.getElementById("pm25").textContent = `PM2.5: ${components.pm2_5} µg/m³`;
    document.getElementById("pm10").textContent = `PM10: ${components.pm10} µg/m³`;
    document.getElementById("no2").textContent = `NO2: ${components.no2} µg/m³`;
    document.getElementById("so2").textContent = `SO2: ${components.so2} µg/m³`;
    document.getElementById("co").textContent = `CO: ${components.co} µg/m³`;
}

// Afficher la qualité de l'air
function displayAirQualityIndex(aqi) {
    const aqiDescription = [
        "Bon",
        "Acceptable",
        "Modéré",
        "Mauvais",
        "Très mauvais",
    ][aqi - 1];
    document.getElementById("air-quality").innerText = aqiDescription;
}

///////// from here, the rest of the code is not actualy use////////
 function displayAirQualityChart(components) {
    renderPollutantsBarChart(components);
    renderAirQualityChart(components);
}

// Créer et afficher le graphique des polluants
function renderPollutantsBarChart(components) {
    const pollutantsData = {
        labels: ["PM2.5", "PM10", "NO2", "SO2", "CO"],
        datasets: [
            {
                label: "Polluants de l'air (µg/m³)",
                data: [
                    components.pm2_5,
                    components.pm10,
                    components.no2,
                    components.so2,
                    components.co,
                ],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                ],
            },
        ],
    };

    const ctx = document.getElementById("pollutantsChart");
    if (ctx) {
        new Chart(ctx.getContext("2d"), {
            type: "bar",
            data: pollutantsData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: "#bebcbb",
                        },
                    },
                    title: {
                        display: true,
                        text: "Polluants de l'air",
                        color: "#bebcbb",
                    },
                },
            },
        });
    } else {
        console.error("Element with ID 'pollutantsChart' not found.");
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
    const ctx = document.getElementById("airQualityChart");
    if (ctx) {
        new Chart(ctx.getContext("2d"), {
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
    } else {
        console.error("Element with ID 'airQualityChart' not found.");
    }
}