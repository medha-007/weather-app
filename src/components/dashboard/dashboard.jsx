import "./dashboard.css";

export default function Dashboard({ currentLocation }) {
  if (!currentLocation) return null;

  const forecast = currentLocation?.forecast ?? {};
  const airQuality = currentLocation?.airQuality ?? {};

  // SAFE ARRAY WRAPPER
  const arr = (v) => (Array.isArray(v) ? v : []);

const hourlyTime = arr(forecast?.hourly?.time);
const hourlyTemp = arr(forecast?.hourly?.temperature_2m);
const hourlyRain = arr(forecast?.hourly?.precipitation);
const hourlyCloud = arr(forecast?.hourly?.cloud_cover);

const now = new Date();

let startIndex = hourlyTime.findIndex(
  (time) => new Date(time) >= now
);

if (startIndex < 0) {
  startIndex = 0;
}

const next24Hours = hourlyTime.slice(
  startIndex,
  startIndex + 24
);

  const dailyTime = arr(forecast?.daily?.time);
  const dailyMax = arr(forecast?.daily?.temperature_2m_max);
  const dailyMin = arr(forecast?.daily?.temperature_2m_min);
  const dailyPrecipProb = arr(
    forecast?.daily?.precipitation_probability_max
  );
  const dailyPrecipSum = arr(
    forecast?.daily?.precipitation_sum
  );
  const dailyUv = arr(
    forecast?.daily?.uv_index_max
  );
  const dailyWindMax = arr(
    forecast?.daily?.wind_speed_10m_max
  );

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


const getDayName = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
  });

  return (
    <div className="dashboard-stack">

{/* HOURLY FORECAST */}
<div className="short-card">
  <h3>Hourly Forecast</h3>

  <div className="hourly-row">
    {hourlyTime.length > 0 ? (
next24Hours.map((timeString, displayIndex) => {
  const actualIndex = startIndex + displayIndex;
const displayHour =
  displayIndex === 0
    ? "Now"
    : new Date(timeString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

const hourCloud = hourlyCloud[actualIndex] ?? 0;
const hourRain = hourlyRain[actualIndex] ?? 0;
        let weatherEmoji = "☀️";

        if (hourRain > 0) {
          weatherEmoji = "🌧️";
        } else if (hourCloud > 70) {
          weatherEmoji = "☁️";
        } else if (hourCloud > 20) {
          weatherEmoji = "⛅";
        }

      
        return (
          <div key={displayIndex} className="hourly-item">
            <span className="time">{displayHour}</span>

            <span
              className="weather-icon"
              style={{
                fontSize: "16px",
                margin: "2px 0",
              }}
            >
              {weatherEmoji}
            </span>

            <span className="temp">
              {hourlyTemp[actualIndex] ?? "—"}°C
            </span>
          </div>
        );
      })
    ) : (
      <p>No hourly forecast available.</p>
    )}
  </div>
</div>

      {/* WEEKLY FORECAST */}
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
                  🌧️ {dailyPrecipProb[i] ?? "—"}%
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: "red" }}>
              Daily forecast unavailable
            </p>
          )}
        </div>
      </div>
      {/* AQI */}
      <div className="short-card expandable-card">
        <div className="card-default">
          <h3>AQI</h3>
          <p className="large-stat">{airQuality?.aqi ?? "N/A"}</p>
          <p>{getAqiStatus(airQuality?.aqi)}</p>
        </div>

        <div className="card-expanded">
          <h3>7 Day AQI Outlook</h3>

          {dailyTime.map((day, i) => (
            <div key={i} className="expanded-row">
              <span>{getDayName(day)}</span>

              <span>{airQuality?.aqi ?? "N/A"}</span>

              <span>{getAqiStatus(airQuality?.aqi)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* UV INDEX */}
      <div className="short-card expandable-card">
        <div className="card-default">
          <h3>UV Index</h3>

          <p className="large-stat">
            {dailyUv[0] ?? "N/A"}
          </p>

          <p>{getUvLabel(dailyUv[0])}</p>
        </div>

        <div className="card-expanded">
          <h3>7 Day UV Forecast</h3>

          {dailyTime.map((day, i) => (
            <div key={i} className="expanded-row">
              <span>{getDayName(day)}</span>

              <span>{dailyUv[i] ?? "—"}</span>

              <span>{getUvLabel(dailyUv[i])}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PRECIPITATION */}
      <div className="short-card expandable-card">
        <div className="card-default">
          <h3>Precipitation</h3>

          <div className="grid-substats">
            <div>
              <span>Today</span>
              <strong>
                {dailyPrecipSum[0] ?? "—"} mm
              </strong>
            </div>

            <div>
              <span>Probability</span>
              <strong>
                {dailyPrecipProb[0] ?? "—"}%
              </strong>
            </div>
          </div>
        </div>

        <div className="card-expanded">
          <h3>7 Day Rain Forecast</h3>

          {dailyTime.map((day, i) => (
            <div key={i} className="expanded-row">
              <span>{getDayName(day)}</span>

              <span>{dailyPrecipProb[i] ?? "—"}%</span>

              <span>{dailyPrecipSum[i] ?? "—"} mm</span>
            </div>
          ))}
        </div>
      </div>

      {/* WIND */}
      <div className="short-card expandable-card">
        <div className="card-default">
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
                {dailyWindMax[0] ?? "—"} km/h
              </strong>
            </div>
          </div>
        </div>

        <div className="card-expanded">
          <h3>7 Day Wind Forecast</h3>

          {dailyTime.map((day, i) => (
            <div key={i} className="expanded-row">
              <span>{getDayName(day)}</span>

              <span>{dailyWindMax[i] ?? "—"} km/h</span>

              <span>
                {dailyWindMax[i] > 30
                  ? "Strong"
                  : dailyWindMax[i] > 15
                  ? "Moderate"
                  : "Light"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}