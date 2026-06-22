export async function fetchWeatherByCity(city) {
  const res = await fetch(
    `https://weather-app6-mo3z.onrender.com/weather?city=${city}`
  );

  return await res.json();
}

export async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(
    `https://weather-app6-mo3z.onrender.com/weather?lat=${lat}&lon=${lon}`
  );

  return await res.json();
}

export async function saveLocationToDatabase(uid, city) {
  return await fetch(
    "https://weather-app6-mo3z.onrender.com/saved",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        city,
      }),
    }
  );
}

export async function getSavedLocations(uid) {
  const res = await fetch(
    `https://weather-app6-mo3z.onrender.com/get-saved-locations?uid=${uid}`
  );

  return await res.json();
}

export async function getRecentSearches() {
  const res = await fetch(
    "https://weather-app6-mo3z.onrender.com/recent-searches"
  );

  return await res.json();
}