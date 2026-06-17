import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getSavedLocations } from "./services/weatherService";
import { getCurrentPosition } from "./services/locationService";
import Header from "./components/header/Header";
import Dashboard from "./components/dashboard/Dashboard";
//
export default function App() {
  const [user, setUser] = useState(null);
  const [savedWeatherList, setSavedWeatherList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePopup, setActivePopup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadAllDashboardData = async () => {
      try {
        let initializedList = [];

        try {
          const position = await getCurrentPosition();
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          const gpsRes = await fetch(`http://localhost:3000/weather?lat=${lat}&lon=${lon}`);
          const gpsData = await gpsRes.json();
          if (gpsData && !gpsData.error) {
            initializedList.push(gpsData);
          }
        } catch (gpsErr) {
          console.warn("GPS Access denied or failed:", gpsErr);
        }

        if (user) {
          const savedMetaData = await getSavedLocations(user.uid);
          if (savedMetaData && savedMetaData.length > 0) {
            const dbPromises = savedMetaData.map(async (item) => {
              const res = await fetch(`http://localhost:3000/weather?city=${item.city}`);
              return res.json();
            });
            const dbResults = await Promise.all(dbPromises);
            initializedList = [...initializedList, ...dbResults];
          }
        }

        setSavedWeatherList(initializedList);
      } catch (err) {
        console.error("Error setting up location array:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllDashboardData();
  }, [user]);

  const handlePrev = () => {
    if (savedWeatherList.length === 0) return;
    setActiveIndex((prev) => (prev === 0 ? savedWeatherList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (savedWeatherList.length === 0) return;
    setActiveIndex((prev) => (prev === savedWeatherList.length - 1 ? 0 : prev + 1));
  };

  const currentLocation = savedWeatherList[activeIndex];

  return (
    <div className="app-layout">
      <Header
        onSearchClick={() => setActivePopup("search")}
        onSavedClick={() => setActivePopup("saved")}
        onAccountClick={() => setActivePopup("account")}
      />

      <main className="dashboard-container">
        <section className="switcher-zone">
          <button className="carousel-btn" onClick={handlePrev}>←</button>
          
          <div className="hero-card">
            {isLoading ? (
              <div style={{ padding: "20px 0", color: "#666", fontStyle: "italic" }}>
                Fetching details at your location...
              </div>
            ) : (
              currentLocation && (
                <>
                  <h2>{currentLocation.city}</h2>
                  <h1>{currentLocation.forecast.current.temperature_2m}°C</h1>
                  <div className="hero-subinfo">
                    <span>
                      H: {currentLocation.forecast.daily.temperature_2m_max[0]}°C / L: {currentLocation.forecast.daily.temperature_2m_min[0]}°C
                    </span>
                    <p className="condition-text">
                      {currentLocation.forecast.current.precipitation > 0 
                        ? "Rainy" 
                        : currentLocation.forecast.current.cloud_cover > 50 
                        ? "Cloudy" 
                        : "Sunny"}
                    </p>
                  </div>
                </>
              )
            )}
          </div>
          
          <button className="carousel-btn" onClick={handleNext}>→</button>
        </section>

        {!isLoading && currentLocation && (
          <Dashboard currentLocation={currentLocation} />
        )}
      </main>

      {activePopup && (
        <div className="simple-modal-overlay" onClick={() => setActivePopup(null)}>
          <div className="simple-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{activePopup.toUpperCase()} PANEL</h2>
            <button className="close-btn" onClick={() => setActivePopup(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}