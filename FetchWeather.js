async function fetchWeather() {
  const params = new URLSearchParams({
    latitude: 43.7064,
    longitude: -79.3986,
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_hours,cloud_cover_mean",
    current: "temperature_2m,precipitation,cloud_cover",
    timezone: "America/New_York"
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Current weather
    const current = data.current;
    const currentHtml = `
      <h3>Current Weather</h3>
      <p>Time: ${current.time}</p>
      <p>Temperature: ${current.temperature_2m}°C</p>
      <p>Precipitation: ${current.precipitation} mm</p>
      <p>Cloud Cover: ${current.cloud_cover}%</p>
    `;

    // Daily weather
    const daily = data.daily;
    const dailyHtml = daily.time.map((dateStr, i) => {
      return `
        <div class="day-block">
          <strong>${new Date(dateStr).toDateString()}</strong><br/>
          Max Temp: ${daily.temperature_2m_max[i]}°C<br/>
          Min Temp: ${daily.temperature_2m_min[i]}°C<br/>
          Precipitation Probability: ${daily.precipitation_probability_max[i]}%<br/>
          Precipitation Hours: ${daily.precipitation_hours[i]}<br/>
          Cloud Cover Mean: ${daily.cloud_cover_mean[i]}%
        </div>
      `;
    }).join('');

    // Inject into page
    document.getElementById('weather').innerHTML = currentHtml + "<h3>3-Day Forecast</h3>" + dailyHtml;
  } catch (err) {
    console.error("Failed to fetch weather data:", err);
    document.getElementById('weather').innerText = "Error loading weather data.";
  }
}

fetchWeather();
