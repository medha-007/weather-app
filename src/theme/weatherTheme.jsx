export function getWeatherTheme(weather) {
  if (!weather) {
    return {
      accent: "#4f9cff",

      grain1: "#FF9FFC",
      grain2: "#5227FF",
      grain3: "#B497CF",
    };
  }

  const current = weather.forecast?.current;

  const cloudCover = current?.cloud_cover ?? 0;
  const precipitation = current?.precipitation ?? 0;
  const isDay = current?.is_day === 1;

  const now = new Date();
  const hour = now.getHours();

  const isSunrise = hour >= 5 && hour <= 7;
  const isSunset = hour >= 17 && hour <= 19;

  /* SUNRISE */

  if (isSunrise) {
    return {
      accent: "#9b4f00",

      grain1: "#d849b0",
      grain2: "#f4d78e",
      grain3: "#b768e5",
    };
  }

  /* SUNSET */

  if (isSunset) {
    return {
      accent: "#7b2559",

      grain1: "#ffdc8a",
      grain2: "#d164a4",
      grain3: "#8159a8",
    };
  }

  /* NIGHT */

  if (!isDay) {
    return {
      accent: "#6ea8ff",

      grain1: "#0D1B2A",
      grain2: "#1B263B",
      grain3: "#304A6E",
    };
  }

  /* RAIN */

  if (precipitation > 0.5) {
    return {
      accent: "#73C7FF",

      grain1: "#587289",
      grain2: "#495768",
      grain3: "#3a444d",
    };
  }

  /* VERY CLOUDY */

  if (cloudCover > 75) {
    return {
      accent: "#B8D3FF",

      grain1: "#324f74",
      grain2: "#50647c",
      grain3: "#414c56",
    };
  }

  /* PARTLY CLOUDY */

  if (cloudCover > 35) {
    return {
      accent: "#43546B",

      grain1: "#556a81",
      grain2: "#8fa0b7",
      grain3: "#8e96a3",
    };
  }

  /* SUNNY */

  return {
    accent: "#2459A8",

    grain1: "#7499c1",
    grain2: "#57a7b4",
    grain3: "#2373db",
  };
}