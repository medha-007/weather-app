export function getWeatherTheme(weather) {
  if (!weather) return {};

  const current = weather.forecast?.current;
  const daily = weather.forecast?.daily;

  const cloudCover = current?.cloud_cover ?? 0;
  const precipitation = current?.precipitation ?? 0;
  const isDay = current?.is_day === 1;

  const now = new Date();
  const hour = now.getHours();

  const isSunrise = hour >= 5 && hour <= 7;
  const isSunset = hour >= 17 && hour <= 19;

  // SUNRISE
  if (isSunrise) {
    return {
      bg: "linear-gradient(180deg,#ffd7b0 0%,#ffc9a9 35%,#d6b3ff 100%)",
      accent: "#9b4f00",
    };
  }

  // SUNSET
  if (isSunset) {
    return {
      bg: "linear-gradient(180deg,#ffb38a 0%,#d88cb8 45%,#5960a8 100%)",
      accent: "#7b2559",
    };
  }

  // NIGHT
  if (!isDay) {
    return {
      bg: "linear-gradient(180deg,#0d1b2a 0%,#1b263b 100%)",
      accent: "#6ea8ff",
    };
  }

  // RAIN
  if (precipitation > 0.5) {
    return {
      bg: "linear-gradient(180deg,#53697f 0%,#74869a 100%)",
      accent: "#18374d",
    };
  }

  // VERY CLOUDY
  if (cloudCover > 75) {
    return {
      bg: "linear-gradient(180deg,#596779 0%,#7a8797 100%)",
      accent: "#263544",
    };
  }

  // PARTLY CLOUDY
  if (cloudCover > 35) {
    return {
      bg: "linear-gradient(180deg,#8d9cad 0%,#b8c2cf 100%)",
      accent: "#43546b",
    };
  }

  // SUNNY
  return {
    bg: "linear-gradient(180deg,#8ec5ff 0%,#c8e3ff 100%)",
    accent: "#2459a8",
  };
}