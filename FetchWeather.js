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

    // Extract and display current weather
    const current = data.current;
    const currentTime = new Date(current.time);
    const currentHtml = `
      <h3>Current Conditions</h3>
      <p>Time: ${currentTime.toLocaleString()}</p>
      <p>Temperature: ${current.temperature_2m}°C</p>
      <p>Precipitation: ${current.precipitation} mm</p>
      <p>Cloud Cover: ${current.cloud_cover}%</p>
    `;

    // Extract daily data
    const daily = data.daily;
    const dailyHtml = daily.time.map((timeStr, i) => {
      return `
        <div class="day-block">
          <strong>${new Date(timeStr).toDateString()}</strong><br/>
          Max Temp: ${daily.temperature_2m_max[i]}°C<br/>
          Min Temp: ${daily.temperature_2m_min[i]}°C<br/>
          Precip. Probability: ${daily.precipitation_probability_max[i]}%<br/>
          Precip. Hours: ${daily.precipitation_hours[i]}<br/>
          Cloud Cover: ${daily.cloud_cover_mean[i]}%
        </div>
      `;
    }).join('');

    // Render to page
    document.getElementById('weather').innerHTML = currentHtml + "<h3>6-Day Forecast</h3>" + dailyHtml;

    // Log to console (optional)
    for (let i = 0; i < daily.time.length; i++) {
      console.log(
        new Date(daily.time[i]).toISOString(),
        daily.temperature_2m_max[i],
        daily.temperature_2m_min[i],
        daily.precipitation_probability_max[i],
        daily.precipitation_hours[i],
        daily.cloud_cover_mean[i]
      );
    }

  } catch (err) {
    console.error("Weather fetch error:", err);
    document.getElementById('weather').innerText = "Error fetching weather data.";
  }
}

fetchWeather();
