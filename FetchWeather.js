async function fetchWeather() {
  const params = new URLSearchParams({
    latitude: 43.7064,
    longitude: -79.3986,
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_hours,cloud_cover_mean",
    current: "temperature_2m,precipitation,cloud_cover",
    timezone: "America/New_York",
    forecast_days: 4
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Format current conditions
    const current = data.current;
    const currentHtml = `
      <h3>Current Conditions</h3>
      <p>Time: ${current.time}</p>
      <p>Temperature: ${current.temperature_2m}°C</p>
      <p>Precipitation: ${current.precipitation}mm</p>
      <p>Cloud Cover: ${current.cloud_cover}%</p>
    `;

    // Format 3-day forecast (skip the first day, which is usually yesterday)
    const daily = data.daily;
    const forecastHtml = daily.time.slice(1, 4).map((time, i) => {
      return `
        <div class="day-block">
          <strong>${new Date(time).toDateString()}</strong><br/>
          Max Temp: ${daily.temperature_2m_max[i + 1]}°C<br/>
          Min Temp: ${daily.temperature_2m_min[i + 1]}°C<br/>
          Precip. Probability: ${daily.precipitation_probability_max[i + 1]}%<br/>
          Precip. Hours: ${daily.precipitation_hours[i + 1]}<br/>
          Cloud Cover Avg: ${daily.cloud_cover_mean[i + 1]}%
        </div>
      `;
    }).join('');

    document.getElementById('weather').innerHTML = currentHtml + "<h3>3-Day Forecast</h3>" + forecastHtml;
  } catch (err) {
    console.error("Error fetching weather:", err);
    document.getElementById('weather').innerText = "Failed to load weather data.";
  }
}

fetchWeather();
