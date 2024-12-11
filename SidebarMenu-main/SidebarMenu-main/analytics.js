// Remplacer par votre propre clé API
const apiKey = '8ab4431e3edf2971b5cb1ceec8cb1e0a'; // Remplacer avec votre clé API OpenWeatherMap
const airQualityUrl = 'https://api.openweathermap.org/data/2.5/air_pollution';
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

document.addEventListener("DOMContentLoaded", () => {
    // Nom de la ville pour laquelle vous souhaitez récupérer les données
    const city = 'moscou'; // Vous pouvez remplacer "Paris" par la ville de votre choix

    // Récupération des coordonnées de la ville
    async function getCityCoordinates(city) {
        try {
            const geoResponse = await fetch(`${weatherUrl}?q=${city}&appid=${apiKey}`);
            if (!geoResponse.ok) throw new Error("Erreur lors de la récupération des coordonnées de la ville.");
            const geoData = await geoResponse.json();
            return geoData.coord;
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la récupération des données de la ville.");
        }
    }

    // Récupérer les données de la qualité de l'air
    async function getAirQualityData(city) {
        try {
            const { lat, lon } = await getCityCoordinates(city);
            const airQualityResponse = await fetch(`${airQualityUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            if (!airQualityResponse.ok) throw new Error("Erreur lors de la récupération des données de qualité de l'air.");
            const airQualityData = await airQualityResponse.json();

            return airQualityData.list[0].components; // On récupère les composants de la qualité de l'air
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la récupération des données de qualité de l'air.");
        }
    }

    // Récupérer les données de température et d'humidité
    async function getTemperatureHumidityData(city) {
        try {
            const { lat, lon } = await getCityCoordinates(city);
            const weatherResponse = await fetch(`${weatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
            if (!weatherResponse.ok) throw new Error("Erreur lors de la récupération des données météorologiques.");
            const weatherData = await weatherResponse.json();

            return {
                temperature: weatherData.main.temp,  // Température en °C
                humidity: weatherData.main.humidity  // Humidité en %
            };
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la récupération des données météorologiques.");
        }
    }

    // Mettre à jour les graphiques avec les vraies données récupérées
    async function updateCharts() {
        try {
            // Récupérer les données réelles pour la qualité de l'air
            const airQuality = await getAirQualityData(city);

            // Récupérer les données réelles pour la température et l'humidité
            const { temperature, humidity } = await getTemperatureHumidityData(city);

            // Remplacer les données simulées par les vraies données pour le graphique de la qualité de l'air
            const airQualityData = {
                labels: ["Azote (N2)", "Oxygène (O2)", "Argon (Ar)", "Dioxyde de carbone (CO2)", "Autres"],
                datasets: [{
                    data: [
                        airQuality.nh3 || 0,  // Ammoniac
                        airQuality.o3 || 0,   // Ozone
                        airQuality.co || 0,   // Monoxyde de carbone
                        airQuality.no2 || 0,  // Dioxyde d'azote
                        airQuality.so2 || 0   // Dioxyde de soufre
                    ],
                    backgroundColor: [
                        "#4caf50",  // Azote
                        "#2196f3",  // Oxygène
                        "#ff9800",  // Argon
                        "#f44336",  // Dioxyde de carbone
                        "#9c27b0"   // Autres
                    ]
                }]
            };

            // Mettre à jour le graphique de la qualité de l'air
            const airQualityCtx = document.getElementById("airQualityChart").getContext("2d");
            new Chart(airQualityCtx, {
                type: "pie",
                data: airQualityData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "top",
                            labels: {
                                color: "#bebcbb"
                            }
                        },
                        title: {
                            display: true,
                            text: "Contenu de l'air",
                            color: "#bebcbb"
                        },
                    }
                }
            });

            // Remplacer les données simulées par les vraies données pour le graphique de la température et de l'humidité
            const temperatureHumidityData = {
                labels: ['10:00', '12:00', '14:00', '16:00', '18:00'],  // Exemple d'horaires
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: [temperature, temperature + 2, temperature + 1, temperature + 3, temperature + 4], // Exemple de tendance basée sur la température
                        borderColor: '#FF5733',
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Humidity (%)',
                        data: [humidity, humidity + 5, humidity + 10, humidity + 8, humidity + 7], // Exemple de tendance basée sur l'humidité
                        borderColor: '#33A1FF',
                        fill: false,
                        tension: 0.1
                    }
                ]
            };

            // Mettre à jour le graphique de la température et de l'humidité
            const tempHumCtx = document.getElementById("temperatureHumidityChart").getContext("2d");
            new Chart(tempHumCtx, {
                type: "line",
                data: temperatureHumidityData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "top",
                            labels: {
                                color: "#bebcbb"
                            }
                        },
                        title: {
                            display: true,
                            text: "Tendances de la température et de l'humidité",
                            color: "#bebcbb",
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Heure',
                                color: "#bebcbb"
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Valeurs',
                                color: "#bebcbb"
                            },
                            min: 0
                        }
                    }
                }
            });
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de la mise à jour des graphiques.");
        }
    }

    // Appeler la fonction pour mettre à jour les graphiques au chargement de la page
    updateCharts();

    // Mettre à jour régulièrement les graphiques toutes les 15 minutes (900000 ms)
    setInterval(updateCharts, 900000);  // Met à jour toutes les 15 minutes
});
