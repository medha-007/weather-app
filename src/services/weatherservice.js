export async function fetchWeatherByCity(city) {
  const res = await fetch(
    `http://localhost:3000/weather?city=${city}`
  );

  return await res.json();
}

export async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(
    `http://localhost:3000/weather?lat=${lat}&lon=${lon}`
  );

  return await res.json();
}

export async function saveLocationToDatabase(uid, city) {
  return await fetch(
    "http://localhost:3000/saved",
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
    `http://localhost:3000/get-saved-locations?uid=${uid}`
  );

  return await res.json();
}

export async function getRecentSearches() {
  const res = await fetch(
    "http://localhost:3000/recent-searches"
  );

  return await res.json();
}