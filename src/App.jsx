import { useState } from "react";

import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from "firebase/auth";
import { auth } from "./firebase";

import { useEffect } from "react";

export default function App() {
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);

  const [recentSearches, setRecentSearches] = useState([]);
  const [savedLocations, setSavedLocations] = useState([]);

  provider.setCustomParameters({
    prompt: "select_account",
  });


async function login() {
  try {
    const result = await signInWithPopup(auth, provider);
    const loggedInUser = result.user;
    setUser(loggedInUser);
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: loggedInUser.uid,
        name: loggedInUser.displayName,
        email: loggedInUser.email,
      }),
    });
    const savedUser = await response.json();
    console.log(savedUser);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
  }
}

const getWeather = async () => {
  if (!city.trim()) return;

  try {
    const res = await fetch(
      `http://localhost:3000/weather?city=${city}`
    );

    const data = await res.json();

    setWeather(data);
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

const searchCity = async (cityName) => {
  if (!cityName?.trim()) return;

  try {
    const res = await fetch(
      `http://localhost:3000/weather?city=${cityName}`
    );

    const data = await res.json();
    setWeather(data);

    // optional: keep input in sync
    setCity(cityName);

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

const getLocation = () => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const res = await fetch(
          `http://localhost:3000/weather?lat=${lat}&lon=${lon}`
        );

        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      }
    },
    (error) => {
      console.error(error);
      alert("Unable to get location");
    }
  );
};

async function logout() {
  try {

    await signOut(auth);

    setUser(null);

    console.log("Logged out");

  } catch (err) {

    console.error(err);

  }
}

async function saveLocation() {
  if (!weather || !user) return;

  const cleanCity = weather.city; // must come from backend API

  await fetch("http://localhost:3000/saved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: user.uid,
      city: cleanCity,
    }),
  });

  alert("Saved!");
}


async function checkAlerts() {

  if (!user) return;

  const savedRes = await fetch(
    `http://localhost:3000/get-saved-locations?uid=${user.uid}`
  );

  const locations = await savedRes.json();

  for (const location of locations) {

    const weatherRes = await fetch(
      `http://localhost:3000/weather?city=${location.city}`
    );

    const weather = await weatherRes.json();

    const rain =
      weather.forecast.daily
        .precipitation_probability_max?.[0];

    const wind =
      weather.forecast.daily
        .wind_speed_10m_max?.[0];

    const aqi =
      weather.airQuality.aqi;

    if (
      rain > 80 ||
      wind > 50 ||
      aqi > 150
    ) {

      if (
        Notification.permission === "granted"
      ) {

        new Notification(
          `Weather Alert: ${location.city}`,
          {
            body:
              `Rain ${rain}% | Wind ${wind} km/h | AQI ${aqi}`,
          }
        );

      }

    }

  }

}


useEffect(() => {

  const unsubscribe = onAuthStateChanged(
    auth,
    (firebaseUser) => {

      setUser(firebaseUser);

    }
  );

  return unsubscribe;
}, []);

useEffect(() => {

  Notification.requestPermission();

}, []);

useEffect(() => {

  if (!user) return;

  checkAlerts();

  const interval =
    setInterval(checkAlerts, 300000);

  return () =>
    clearInterval(interval);

}, [user]);


useEffect(() => {
  getLocation();
}, []);

useEffect(() => {
  if (!user) return;

  const fetchData = async () => {
    try {
      const savedRes = await fetch(
        `http://localhost:3000/get-saved-locations?uid=${user.uid}`
      );
      const saved = await savedRes.json();
      setSavedLocations(saved);

      const recentRes = await fetch(
        `http://localhost:3000/recent-searches`
      );
      const recent = await recentRes.json();
      setRecentSearches(recent);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, [user]);

return (
  <div className="app">

 {/* TOP BAR */}
    <header className="topbar">
      <div className="title">🌦 Weather Dashboard
        {weather && weather.city && (
        <p className="meta">
        {weather.city}
        </p>
        
      )}
      </div>
      <div className="icons">



</div>
      <div className="user-panel">
          {/* SEARCH ICON */}
  <button
    className="icon-btn"
    onClick={() => setShowSearchPopup(true)}
  >
    🔍︎
  </button>
        <button
          className="icon-btn"
            onClick={() => setShowSidebar(true)}
        >
          ☰
        </button>
      </div>
    </header>

    {/* DASHBOARD GRID */}
    {weather && (
      <div className="grid">

        {/* CURRENT WEATHER */}
        <section className="card main">
          <h2>Current Weather</h2>

          <div className="big">
            {weather.forecast.current.temperature_2m}°C
          </div>

          <div className="meta">
            Feels like: {weather.forecast.current.apparent_temperature}°C
          </div>

          <div className="meta">
            Humidity: {weather.forecast.current.relative_humidity_2m}%
          </div>

          <div className="meta">
            Cloud Cover: {weather.forecast.current.cloud_cover}%
          </div>
        </section>

        {/* TODAY SUMMARY */}
        <section className="card">
          <h2>Today</h2>

          <div className="meta">
            High: {Math.max(...weather.forecast.daily.temperature_2m_max)}°C
          </div>

          <div className="meta">
            Low: {Math.min(...weather.forecast.daily.temperature_2m_min)}°C
          </div>

          <div className="meta">
            Rain: {weather.forecast.daily.precipitation_sum[0]} mm
          </div>
        </section>

        {/* AQI */}
        <section className="card">
          <h2>Air Quality</h2>

          <div className="big">
            AQI {weather.airQuality.aqi}
          </div>

          <div className="meta">PM2.5: {weather.airQuality.pm25}</div>
          <div className="meta">PM10: {weather.airQuality.pm10}</div>
        </section>

        {/* UV INDEX */}
        <section className="card">
          <h2>UV Index</h2>

          <div className="big">
            {weather.forecast.daily.uv_index_max[0]}
          </div>
        </section>

        {/* PRECIPITATION */}
        <section className="card">
          <h2>Precipitation</h2>

          <div className="meta">
            Chance: {weather.forecast.daily.precipitation_probability_max[0]}%
          </div>

          <div className="meta">
            Total: {weather.forecast.daily.precipitation_sum[0]} mm
          </div>
        </section>

        {/* HOURLY FORECAST */}
        <section className="card wide">
          <h2>Hourly Forecast</h2>

          <div className="scroll">
            {weather.forecast.hourly.time.slice(0, 12).map((t, i) => (
              <div key={i} className="row">
                <span>{t.slice(11, 16)}</span>
                <span>{weather.forecast.hourly.temperature_2m[i]}°C</span>
                <span>{weather.forecast.hourly.precipitation_probability[i]}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* 7 DAY FORECAST */}
        <section className="card wide">
          <h2>7 Day Forecast</h2>

          {weather.forecast.daily.time.map((d, i) => (
            <div key={i} className="row">
              <span>{d}</span>
              <span>{weather.forecast.daily.temperature_2m_max[i]}°</span>
              <span>{weather.forecast.daily.temperature_2m_min[i]}°</span>
              <span>{weather.forecast.daily.precipitation_probability_max[i]}%</span>
            </div>
          ))}
        </section>

      </div>
    )}

    {/* fallback */}
    {!weather && (
      <div className="empty">
        Fetching data at your location..
      </div>
    )}

{showSidebar && (
  <>
    {/* overlay */}
    <div
      className="overlay"
      onClick={() => setShowSidebar(false)}
    />

    {/* sidebar */}
    <div className="sidebar open">
     {user && (
    <>
      {/* RECENT SEARCHES */}
      <details className="dropdown">
        <summary>Recent Searches</summary>
        <ul>
          {recentSearches.map((item, i) => (
<li
  key={i}
  onClick={() => {
    searchCity(item.city);
    setShowSidebar(false);
  }}
  style={{ cursor: "pointer" }}
>
  {item.city}
</li>
))}
        </ul>
      </details>

      {/* SAVED SEARCHES */}
      <details className="dropdown">
        <summary>Saved Locations</summary>
        <ul>
          {savedLocations.map((item, i) => (
<li
  key={i}
  onClick={() => {
    searchCity(item.city);
    setShowSidebar(false);
  }}
  style={{ cursor: "pointer" }}
>
  {item.city}
</li>
          ))}
        </ul>
      </details>
    </>
  )}
    <div className="auth">
    {user ? (
      <>
        <p>Logged in as</p>
        <b>{user.displayName}</b>

        <button onClick={logout}>
          Sign out
        </button>
      </>
    ) : (
      <button onClick={login}>
        Sign in
      </button>
    )}
    </div>
    </div>
  </>
)}
{/* popup box */}
{showSearchPopup && (
  <div className="search-popup">
    <input
      autoFocus
      placeholder="Enter city..."
      value={city}
      onChange={(e) => setCity(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          searchCity(city);
          setShowSearchPopup(false);
        }
      }}
    />

    <div className="popup-buttons">
      <button
        onClick={() => {
          searchCity(city);
          setShowSearchPopup(false);
        }}
      >
        Search
      </button>

      <button
        onClick={() => {
          getLocation();
          setShowSearchPopup(false);
        }}
      >
        GPS
      </button>

      <button
        onClick={() => {
          saveLocation(city); // only saves searched city
        }}
      >
        Save
      </button>
    </div>
  </div>
)}

  </div>

);
}