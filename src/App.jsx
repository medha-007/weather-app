import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getSavedLocations } from "./services/weatherService";
import { getCurrentPosition } from "./services/locationService";
import Header from "./components/header/Header";
import Dashboard from "./components/dashboard/Dashboard";
import Search from "./components/search/Search";

export default function App() {
  const [user, setUser] = useState(null);
  const [savedWeatherList, setSavedWeatherList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePopup, setActivePopup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // SEARCH
  const handleSearch = async (city) => {
    try {
      const res = await fetch(
        `http://localhost:3000/weather?city=${encodeURIComponent(city)}`
      );

      const data = await res.json();

      if (data && !data.error) {
        setSearchResult(data);
        setActivePopup(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // EXIT SEARCH MODE
  const handleReturnToCurrentLocation = () => {
    setSearchResult(null);
    setActiveIndex(0);
    setActivePopup(null);
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

  return (
    <div className="app-layout">
      <Header
        onSearchClick={() => setActivePopup("search")}
        onSavedClick={() => setActivePopup("saved")}
      />

      <main className="dashboard-container">
        {isLoading ? (
          <div className="location-loading">
            Fetching details at your location...
          </div>
        ) : (
          <>
            <section className="switcher-zone">
              {!searchResult && (
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
                        {currentLocation?.forecast?.current
                          ?.precipitation > 0
                          ? "Rainy"
                          : (currentLocation?.forecast?.current
                              ?.cloud_cover ?? 0) > 50
                          ? "Cloudy"
                          : "Sunny"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>Loading weather...</div>
                )}
              </div>

              {!searchResult && (
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

      {/* MODAL */}
      {activePopup && (
        <div
          className="simple-modal-overlay"
          onClick={() => setActivePopup(null)}
        >
          <div
            className="simple-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {activePopup === "search" && (
              <Search
                onClose={() => setActivePopup(null)}
                onSearch={handleSearch}
                onUseCurrentLocation={
                  handleReturnToCurrentLocation
                }
              />
            )}

            <button
              className="close-btn"
              onClick={() => setActivePopup(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}