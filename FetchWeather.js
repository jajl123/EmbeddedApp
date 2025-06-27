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

    // Find today in the daily.time array
    const daily = data.daily;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayIdx = daily.time.findIndex(date => date === todayStr);

    // If today is found, get today, tomorrow, next day
    let daysHtml = '';
    if (todayIdx !== -1 && todayIdx + 2 < daily.time.length) {
      daysHtml = daily.time.slice(todayIdx, todayIdx + 3).map((dateStr, i) => {
        const idx = todayIdx + i;
        return `
          <div class="day-block">
            <strong>${new Date(dateStr).toDateString()}</strong><br/>
            Max Temp: ${daily.temperature_2m_max[idx]}°C<br/>
            Min Temp: ${daily.temperature_2m_min[idx]}°C<br/>
            Precipitation Probability: ${daily.precipitation_probability_max[idx]}%<br/>
            Precipitation Hours: ${daily.precipitation_hours[idx]}<br/>
            Cloud Cover Mean: ${daily.cloud_cover_mean[idx]}%
          </div>
        `;
      }).join('');
    } else {
      daysHtml = "<p>Could not find 3-day forecast starting from today.</p>";
    }

    // Inject into page
    document.getElementById('forecast').innerHTML = currentHtml + "<h3>3-Day Forecast</h3>" + daysHtml;
  } catch (err) {
    console.error("Failed to fetch weather data:", err);
    document.getElementById('forecast').innerText = "Error loading weather data.";
  }
}

fetchWeather();
