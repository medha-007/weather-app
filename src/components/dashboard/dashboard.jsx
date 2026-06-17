import "./dashboard.css";

export default function Dashboard({ currentLocation }) {
  if (!currentLocation) return null;

  const forecast = currentLocation?.forecast ?? {};
  const airQuality = currentLocation?.airQuality ?? {};

  // SAFE ARRAY WRAPPER (critical for Open-Meteo responses)
  const arr = (v) => (Array.isArray(v) ? v : []);

  const hourlyTime = arr(forecast?.hourly?.time);
  const hourlyTemp = arr(forecast?.hourly?.temperature_2m);
  const hourlyRain = arr(forecast?.hourly?.precipitation);

  const dailyTime = arr(forecast?.daily?.time);
  const dailyMax = arr(forecast?.daily?.temperature_2m_max);
  const dailyMin = arr(forecast?.daily?.temperature_2m_min);

  const getAqiStatus = (aqi) => {
    if (aqi == null) return "Unknown";
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    return "Poor";
  };

  const getUvLabel = (uv) => {
    if (uv == null) return "Unknown";
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    return "High";
  };

  return (
    <div className="dashboard-stack">

{/* 1. HOURLY FORECAST */}
      <div className="short-card">
        <h3>Hourly Forecast</h3>
        <div className="hourly-row">
          {forecast.hourly.time.slice(0, 12).map((timeString, index) => {
            const displayHour = new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={index} className="hourly-item">
                <span className="time">{displayHour}</span>
                <span className="temp">{forecast.hourly.temperature_2m[index]}°C</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAILY FORECAST */}
      <div className="short-card">
        <h3>Weekly Forecast</h3>

        <div className="daily-list">
          {dailyTime.length > 0 ? (
            dailyTime.map((t, i) => (
              <div key={i} className="daily-row-item">
                <span>
                  {new Date(t).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </span>

                <span>
                  H: {dailyMax[i] ?? "—"}°C / L: {dailyMin[i] ?? "—"}°C
                </span>

                <span>
                  🌧️{" "}
                  {forecast?.daily?.precipitation_probability_max?.[i] ?? "—"}%
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: "red" }}>
              Daily data missing (Open-Meteo response mismatch)
            </p>
          )}
        </div>
      </div>

      {/* AQI */}
      <div className="short-card">
        <h3>AQI</h3>
        <p className="large-stat">{airQuality?.aqi ?? "N/A"}</p>
        <p>{getAqiStatus(airQuality?.aqi)}</p>
      </div>

      {/* UV INDEX */}
      <div className="short-card">
        <h3>UV Index</h3>
        <p className="large-stat">
          {forecast?.daily?.uv_index_max?.[0] ?? "N/A"}
        </p>
        <p>
          {getUvLabel(forecast?.daily?.uv_index_max?.[0])}
        </p>
      </div>

      {/* PRECIPITATION */}
      <div className="short-card">
        <h3>Precipitation</h3>

        <div className="grid-substats">
          <div>
            <span>Today</span>
            <strong>
              {forecast?.daily?.precipitation_sum?.[0] ?? "—"} mm
            </strong>
          </div>

          <div>
            <span>Probability</span>
            <strong>
              {forecast?.daily?.precipitation_probability_max?.[0] ?? "—"}%
            </strong>
          </div>
        </div>
      </div>

      {/* WIND */}
      <div className="short-card">
        <h3>Wind</h3>

        <div className="grid-substats">
          <div>
            <span>Direction</span>
            <strong>
              {forecast?.current?.wind_direction_10m ?? "—"}°
            </strong>
          </div>

          <div>
            <span>Speed</span>
            <strong>
              {forecast?.current?.wind_speed_10m ?? "—"} km/h
            </strong>
          </div>

          <div>
            <span>Max</span>
            <strong>
              {forecast?.daily?.wind_speed_10m_max?.[0] ?? "—"} km/h
            </strong>
          </div>
        </div>
      </div>

    </div>
  );
}