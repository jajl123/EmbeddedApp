async function fetchWeather() {
  const params = new URLSearchParams({
    latitude: 43.7064,
    longitude: -79.3986,
    hourly: "temperature_2m,precipitation_probability,precipitation,cloud_cover",
    timezone: "America/New_York",
    forecast_days: 3,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const hourly = data.hourly;
    const output = hourly.time.map((time, i) => {
      return `
        <p>
          <strong>${new Date(time).toLocaleString()}</strong><br/>
          Temp: ${hourly.temperature_2m[i]}°C,
          Precip: ${hourly.precipitation[i]}mm,
          Chance: ${hourly.precipitation_probability[i]}%,
          Clouds: ${hourly.cloud_cover[i]}%
        </p>`;
    }).join('');

    document.getElementById('forecast').innerHTML = output;
  } catch (error) {
    console.error("Failed to load weather data:", error);
    document.getElementById('forecast').innerText = "Error loading weather.";
  }
}

fetchWeather();
