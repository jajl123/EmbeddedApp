async function fetchWeather() {
  const params = new URLSearchParams({
    latitude: 36.739824,
    longitude: -79.444818,
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_hours,weather_code,cloud_cover_mean",
    current: "temperature_2m,precipitation,weather_code,cloud_cover",
    hourly: "temperature_2m,precipitation_probability,cloud_cover,wind_speed_10m,wind_direction_10m,rain,showers,snowfall,weather_code",
    timezone: "America/New_York",
	  wind_speed_unit: "mph",
	  temperature_unit: "fahrenheit",
	  precipitation_unit: "inch"
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Weather code to emoji and description mapping (already defined above)
    const weatherCodeMap = {
      0:  { icon: "☀️", desc: "Clear sky" },
      1:  { icon: "🌤️", desc: "Mainly clear" },
      2:  { icon: "⛅", desc: "Partly cloudy" },
      3:  { icon: "☁️", desc: "Overcast" },
      45: { icon: "🌫️", desc: "Fog" },
      48: { icon: "🌫️", desc: "Depositing rime fog" },
      51: { icon: "🌦️", desc: "Light drizzle" },
      53: { icon: "🌦️", desc: "Moderate drizzle" },
      55: { icon: "🌦️", desc: "Dense drizzle" },
      56: { icon: "🌧️", desc: "Light freezing drizzle" },
      57: { icon: "🌧️", desc: "Dense freezing drizzle" },
      61: { icon: "🌧️", desc: "Slight rain" },
      63: { icon: "🌧️", desc: "Moderate rain" },
      65: { icon: "🌧️", desc: "Heavy rain" },
      66: { icon: "🌧️", desc: "Light freezing rain" },
      67: { icon: "🌧️", desc: "Heavy freezing rain" },
      71: { icon: "❄️", desc: "Slight snow fall" },
      73: { icon: "❄️", desc: "Moderate snow fall" },
      75: { icon: "❄️", desc: "Heavy snow fall" },
      77: { icon: "❄️", desc: "Snow grains" },
      80: { icon: "🌦️", desc: "Slight rain showers" },
      81: { icon: "🌦️", desc: "Moderate rain showers" },
      82: { icon: "🌧️", desc: "Violent rain showers" },
      85: { icon: "🌨️", desc: "Slight snow showers" },
      86: { icon: "🌨️", desc: "Heavy snow showers" },
      95: { icon: "⛈️", desc: "Thunderstorm" },
      96: { icon: "⛈️", desc: "Thunderstorm with hail" },
      99: { icon: "⛈️", desc: "Thunderstorm with heavy hail" }
    };

    function getWeatherIconAndDesc(code) {
      return weatherCodeMap[code] || { icon: "❓", desc: "Unknown" };
    }

    // --- CURRENT WEATHER ---
    const current = data.current;
    const currentTime = new Date(current.time);
    const currentIconObj = getWeatherIconAndDesc(current.weather_code);
    const currentHtml = `
      <h3>Current Conditions</h3>
      <div class="current-block" style="text-align:center;">
        <span style="font-size:1rem; display:block;">
          ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </span>
        <span style="font-size:2rem; display:block;" title="${currentIconObj.desc}">${currentIconObj.icon}</span>
        <span style="font-size:1.1rem; display:block;">${current.temperature_2m}°F</span>
      </div>
    `;

    // --- DAILY FORECAST ---
    const daily = data.daily;
    const precipCodes = [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99,71,73,75,77,85,86]; // All precipitation-related codes

    const dailyHtml = daily.time.slice(2, -2).map((timeStr, i) => {
      const arrIndex = i + 2;
      const code = daily.weather_code[arrIndex];
      const { icon, desc } = getWeatherIconAndDesc(code);
      const isPrecip = precipCodes.includes(code);
      const precipHtml = isPrecip
        ? `<div style="font-size:0.95rem;">Precip: ${daily.precipitation_probability_max[arrIndex]}%</div>`
        : "";
      return `
        <div class="day-block" style="text-align:center;">
          <strong>${new Date(timeStr).toDateString()}</strong><br/>
          <span style="font-size:2rem;" title="${desc}">${icon}</span>
          ${precipHtml}
          <div style="font-size:1rem;">Low: ${daily.temperature_2m_min[arrIndex]}°F - High: ${daily.temperature_2m_max[arrIndex]}°F</div>
        </div>
      `;
    }).join('');

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
        ${morningHours.map(i => {
          const { icon, desc } = getWeatherIconAndDesc(hourly.weather_code[i]);
          return `
            <div class="hour-block">
              <span style="font-size:1rem; display:block;">
                ${new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
              <span style="font-size:2rem; display:block;" title="${desc}">${icon}</span>
              <span style="font-size:1.1rem; display:block;">${hourly.temperature_2m[i]}°F</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const afternoonHtml = `
      <h3>Afternoon (1PM - 6PM)</h3>
      <div class="hourly-row">
        ${afternoonHours.map(i => {
          const { icon, desc } = getWeatherIconAndDesc(hourly.weather_code[i]);
          return `
            <div class="hour-block">
              <span style="font-size:1rem; display:block;">
                ${new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
              <span style="font-size:2rem; display:block;" title="${desc}">${icon}</span>
              <span style="font-size:1.1rem; display:block;">${hourly.temperature_2m[i]}°F</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Render to page
    document.getElementById('weather').innerHTML = currentHtml + morningHtml + afternoonHtml + "<h3>3-Day Forecast</h3>" + dailyHtml;

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
