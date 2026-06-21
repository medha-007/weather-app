import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getSavedLocations } from "./services/weatherService";
import { getCurrentPosition } from "./services/locationService";
import Header from "./components/header/Header";
import Dashboard from "./components/dashboard/Dashboard";
import { getWeatherTheme } from "./theme/weatherTheme";
import "./theme/weatherTheme.css";
import { useRef } from "react";
import GradualBlur from './GradualBlur/GradualBlur';
//import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState(null);
  const [savedWeatherList, setSavedWeatherList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
const [recentSearches, setRecentSearches] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const carouselRef = useRef(null);
  const [carouselHovered, setCarouselHovered] = useState(false);

  const [searchResult, setSearchResult] = useState(null);
  const [activeCity, setActiveCity] = useState(null);

const heroLocations = searchResult
  ? [searchResult]
  : savedWeatherList;

const currentLocation =
  heroLocations.find(
    (loc) => loc.city === activeCity
  ) || heroLocations[0];

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, []);

useEffect(() => {
  if (heroLocations.length > 0) {
    setActiveCity(heroLocations[0]?.city);
    // Scroll carousel back to first card when locations change
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }
}, [heroLocations.length]); // depend on length, not the array object
  
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
  };



    const weatherTheme =
  getWeatherTheme(currentLocation);

useEffect(() => {
  if (!currentLocation) return;

  const theme = getWeatherTheme(currentLocation);

  document.documentElement.style.setProperty(
    "--weather-bg",
    theme.bg
  );

  document.documentElement.style.setProperty(
    "--weather-accent",
    theme.accent
  );
}, [currentLocation]);

useEffect(() => {
  const carousel = carouselRef.current;
  if (!carousel) return;

  let rafId;

const handleScroll = () => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;

    let closest = null;
    let closestDistance = Infinity;

    carousel.querySelectorAll(".hero-card").forEach((card) => {
      // offsetLeft includes the padding, so use getBoundingClientRect instead
      const cardRect = card.getBoundingClientRect();
      const carouselRect = carousel.getBoundingClientRect();
      
      // Card center relative to carousel's scroll position
      const cardCenter =
        cardRect.left - carouselRect.left + carousel.scrollLeft + cardRect.width / 2;

      const distance = Math.abs(viewportCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = card;
      }
    });

    if (closest) {
      setActiveCity(closest.dataset.city);
    }
  });
};
  carousel.addEventListener("scroll", handleScroll);
  handleScroll();

  return () => {
    carousel.removeEventListener("scroll", handleScroll);
    cancelAnimationFrame(rafId);
  };
}, [heroLocations]);
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
<div className={`app-layout ${weatherTheme}`}>
<Header
  onSearch={handleSearch}
  onUseCurrentLocation={handleReturnToCurrentLocation}
  searchLoading={searchLoading}
  saveIcon={getSaveIcon()}
  onToggleSave={handleToggleSave}
  recentSearches={recentSearches}
  savedLocations={savedWeatherList}

/>
   <div className="dashboard-spacer"></div>
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


<div
  className={`carousel-wrapper ${
    carouselHovered ? "expanded" : ""
  }`}
  onMouseEnter={() => setCarouselHovered(true)}
  onMouseLeave={() => setCarouselHovered(false)}
>
          <section
  className="hero-carousel"
  ref={carouselRef}
>
  {heroLocations.map((location) => (

    <motion.div
      key={location.city}
        data-city={location.city}

      className="hero-card"
animate={{
  scale:
    activeCity === location.city
      ? 1
      : carouselHovered
      ? 0.92
      : 0.75,

  opacity:
    activeCity === location.city
      ? 1
      : carouselHovered
      ? 0.6
      : 0,
}}
transition={{
  type: "spring",
  stiffness: 250,
  damping: 25,
}}
    >
      <h2>{location.city || "Unknown Location"}</h2>

      <h1>
        {location?.forecast?.current?.temperature_2m !==
        undefined
          ? `${location.forecast.current.temperature_2m}°C`
          : "--°C"}
      </h1>

      <div className="hero-subinfo">

        <span>
          H:
          {" "}
          {location?.forecast?.daily
            ?.temperature_2m_max?.[0] ?? "--"}
          °C

          /

          L:
          {" "}
          {location?.forecast?.daily
            ?.temperature_2m_min?.[0] ?? "--"}
          °C
        </span>

        <p className="condition-text">
          {location?.forecast?.current?.precipitation > 0
            ? "Rainy"
            : (location?.forecast?.current?.cloud_cover ?? 0) > 50
            ? "Cloudy"
            : "Sunny"}
        </p>

      </div>
    </motion.div>

  ))}

          </section>
          </div>

          <div className="dashboard-spacer"></div>

           {!isLoading && currentLocation && (
              <Dashboard currentLocation={currentLocation} />
            )}
          </>
        )}
      </main>
    </div>
  );
}