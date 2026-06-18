import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getSavedLocations } from "./services/weatherService";
import { getCurrentPosition } from "./services/locationService";
import Header from "./components/header/Header";
import Dashboard from "./components/dashboard/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [savedWeatherList, setSavedWeatherList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
const [recentSearches, setRecentSearches] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [searchResult, setSearchResult] = useState(null);

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, []);

  // LOAD WEATHER DATA
  useEffect(() => {
    const loadAllDashboardData = async () => {
      try {
        let initializedList = [];

        try {
          const position = await getCurrentPosition();
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const gpsRes = await fetch(
            `http://localhost:3000/weather?lat=${lat}&lon=${lon}`
          );

          const gpsData = await gpsRes.json();

          if (gpsData && !gpsData.error) {
            initializedList.push(gpsData);
          }
        } catch (gpsErr) {
          console.warn("GPS failed:", gpsErr);
        }

        if (user) {
          const savedMetaData = await getSavedLocations(user.uid);

          if (savedMetaData?.length > 0) {
            const dbPromises = savedMetaData.map(async (item) => {
              const res = await fetch(
                `http://localhost:3000/weather?city=${item.city}`
              );
              return res.json();
            });

            const dbResults = await Promise.all(dbPromises);

            const validResults = dbResults.filter(
              (item) => item && !item.error && item.city
            );

            initializedList = [...initializedList, ...validResults];
          }
        }

        setSavedWeatherList(initializedList);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllDashboardData();
  }, [user]);

  // RESET INDEX WHEN LIST CHANGES
  useEffect(() => {
    setActiveIndex(0);
  }, [savedWeatherList.length]);

  // NAVIGATION
  const handleNext = () => {
    if (savedWeatherList.length === 0 || searchResult) return;

    setActiveIndex((prev) => (prev + 1) % savedWeatherList.length);
  };

  const handlePrev = () => {
    if (savedWeatherList.length === 0 || searchResult) return;

    setActiveIndex(
      (prev) =>
        (prev - 1 + savedWeatherList.length) %
        savedWeatherList.length
    );
  };

const isSavedLocation = (city) => {
  return savedWeatherList.some(
    (item) => item.city?.toLowerCase() === city?.toLowerCase()
  );
};

const handleToggleSave = async () => {
  if (!user) {
    alert("Sign in!");
    return;
  }

  if (!currentLocation?.city) return;

  const city = currentLocation.city;

  const alreadySaved = isSavedLocation(city);

  try {
    if (alreadySaved) {
      const isCurrentLocation =
        currentLocation?.city === savedWeatherList?.[0]?.city;

      if (isCurrentLocation) {
        alert("Current location cannot be removed!");
        return;
      }

      await fetch("http://localhost:3000/saved", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          city,
        }),
      });

      setSavedWeatherList((prev) =>
        prev.filter(
          (item) =>
            item.city?.toLowerCase() !== city?.toLowerCase()
        )
      );

      alert("removed!");
    } else {
      await fetch("http://localhost:3000/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          city,
        }),
      });

      setSavedWeatherList((prev) => [...prev, currentLocation]);
        const newIndex = savedWeatherList.length;

setActiveIndex(newIndex);
setSearchResult(null);
      alert("saved!");
    }
  } catch (err) {
    console.error(err);
  }
};
const getSaveIcon = () => {
  if (!user) return "✢";

  if (!currentLocation?.city) return "☆";

  return isSavedLocation(currentLocation.city) ? "★" : "☆";
};

  // SEARCH
const handleSearch = async (city) => {
  try {
    setSearchLoading(true);

    const res = await fetch(
      `http://localhost:3000/weather?city=${encodeURIComponent(city)}`
    );

    const data = await res.json();

if (data && !data.error) {

  setRecentSearches((prev) => {
    const filtered = prev.filter(
      (item) =>
        item.city?.toLowerCase() !==
        data.city?.toLowerCase()
    );

    return [
      {
        _id: Date.now(),
        city: data.city,
      },
      ...filtered,
    ].slice(0, 5);
  });

  setSearchResult(data);
}
  } catch (err) {
    console.error(err);
  } finally {
    setSearchLoading(false);
  }
};
  // EXIT SEARCH MODE
  const handleReturnToCurrentLocation = () => {
    setSearchResult(null);
    setActiveIndex(0);
  };

  // SAFE CURRENT LOCATION
  const safeIndex =
    savedWeatherList.length > 0
      ? activeIndex % savedWeatherList.length
      : 0;

  const currentLocation = searchResult
    ? searchResult
    : savedWeatherList.length > 0
    ? savedWeatherList[safeIndex]
    : null;


useEffect(() => {
  const loadRecentSearches = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/recent-searches"
      );

      const data = await res.json();

      setRecentSearches(data);
    } catch (err) {
      console.error(err);
    }
  };

  loadRecentSearches();
}, []);


  return (
    <div className="app-layout">
<Header
  onSearch={handleSearch}
  onUseCurrentLocation={handleReturnToCurrentLocation}
  searchLoading={searchLoading}
  saveIcon={getSaveIcon()}
  onToggleSave={handleToggleSave}
  recentSearches={recentSearches}
  savedLocations={savedWeatherList}

/>

{searchLoading && (
  <div className="global-search-loading">
    Searching weather...
  </div>
)}
      <main className="dashboard-container">
        {isLoading ? (
          <div className="location-loading">
            Fetching details at your location...
          </div>
        ) : (
          <>
            <section className="switcher-zone">
{!searchResult && savedWeatherList.length > 1 && (
  <button className="carousel-btn" onClick={handlePrev}>
    ←
  </button>
)}

              <div className="hero-card">
                {currentLocation ? (
                  <>
                    <h2>{currentLocation?.city || "Unknown Location"}</h2>

                    <h1>
                      {currentLocation?.forecast?.current?.temperature_2m !==
                      undefined
                        ? `${currentLocation.forecast.current.temperature_2m}°C`
                        : "--°C"}
                    </h1>

                    <div className="hero-subinfo">
                      <span>
                        H:{" "}
                        {currentLocation?.forecast?.daily
                          ?.temperature_2m_max?.[0] ?? "--"}
                        °C / L:{" "}
                        {currentLocation?.forecast?.daily
                          ?.temperature_2m_min?.[0] ?? "--"}
                        °C
                      </span>

                      <p className="condition-text">
                        {currentLocation?.forecast?.current?.precipitation > 0
                          ? "Rainy"
                          : (currentLocation?.forecast?.current?.cloud_cover ??
                              0) > 50
                          ? "Cloudy"
                          : "Sunny"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>Loading weather...</div>
                )}
              </div>

{!searchResult && savedWeatherList.length > 1 && (
  <button className="carousel-btn" onClick={handleNext}>
    →
  </button>
)}
            </section>

            {!isLoading && currentLocation && (
              <Dashboard currentLocation={currentLocation} />
            )}
          </>
        )}
      </main>
    </div>
  );
}