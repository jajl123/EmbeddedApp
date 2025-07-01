async function fetchWeather() {
  const params = new URLSearchParams({
    latitude: 43.7064,
    longitude: -79.3986,
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_hours,cloud_cover_mean",
    current: "temperature_2m,precipitation,cloud_cover",
    hourly: "temperature_2m,precipitation_probability,cloud_cover,wind_speed_10m,wind_direction_10m,rain,showers,snowfall",
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
        <div class="current-block">
          <strong>${currentTime.toLocaleString()}</strong><br/>
          Temperature: ${current.temperature_2m}°C<br/>
          Precipitation: ${current.precipitation} mm<br/>
          Cloud Cover: ${current.cloud_cover}%
        </div>
      `;

    // Extract and display hourly weather

    const hourly = data.hourly;

    // Helper to get hour from ISO string
    function getHour(timeStr) {
      return new Date(timeStr).getHours();
    }

    // Filter for today's morning (6AM-12PM) and afternoon (1PM-6PM)
    const today = new Date().getDate();
    const morningHours = [];
    const afternoonHours = [];

    for (let i = 0; i < hourly.time.length; i++) {
      const dateObj = new Date(hourly.time[i]);
      if (
        dateObj.getDate() === today &&
        dateObj.getMonth() === new Date().getMonth() &&
        dateObj.getFullYear() === new Date().getFullYear()
      ) {
        const hour = dateObj.getHours();
        if (hour >= 7 && hour <= 12) {
          morningHours.push(i);
        } else if (hour >= 13 && hour <= 18) {
          afternoonHours.push(i);
        }
      }
    }

    const morningHtml = `
      <h3>Morning (7AM - 12PM)</h3>
      <div class="hourly-row">
        ${morningHours.map(i => `
          <div class="hour-block">
            <strong>${new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</strong><br/>
            ${hourly.temperature_2m[i]}°C<br/>
            ${hourly.precipitation_probability[i]}% rain<br/>
            ${hourly.cloud_cover[i]}% clouds
          </div>
        `).join('')}
      </div>
    `;

    const afternoonHtml = `
      <h3>Afternoon (1PM - 6PM)</h3>
      <div class="hourly-row">
        ${afternoonHours.map(i => `
          <div class="hour-block">
            <strong>${new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</strong><br/>
            ${hourly.temperature_2m[i]}°C<br/>
            ${hourly.precipitation_probability[i]}% rain<br/>
            ${hourly.cloud_cover[i]}% clouds
          </div>
        `).join('')}
      </div>
    `;

    // Extract daily data
    const daily = data.daily;
    const dailyHtml = daily.time.slice(2, -2).map((timeStr, i) => {
      const arrIndex = i + 2;
      return `
        
        <div class="day-block">
          <strong>${new Date(timeStr).toDateString()}</strong><br/>
          Max Temp: ${daily.temperature_2m_max[i + 1]}°C<br/>
          Min Temp: ${daily.temperature_2m_min[i + 1]}°C<br/>
          Precip. Probability: ${daily.precipitation_probability_max[i + 1]}%<br/>
          Precip. Hours: ${daily.precipitation_hours[i + 1]}<br/>
          Cloud Cover: ${daily.cloud_cover_mean[i + 1]}%
        </div>
      `;
    }).join('');

    // Render to page
    document.getElementById('weather').innerHTML = currentHtml + morningHtml + afternoonHtml + "<h3>6-Day Forecast</h3>" + dailyHtml;

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
