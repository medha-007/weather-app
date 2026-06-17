const rateLimit = require("express-rate-limit");
const Search = require("./models/search");
const saved = require("./models/saved");
const mongoose = require("mongoose");
require("dotenv").config();

console.log(process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));


const express = require("express");
const app = express();

const weatherLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // 20 requests
  message: {
    error: "Too many requests"
  }
});

const cors = require("cors");
const cache = {};

app.use(cors());

app.get("/weather", weatherLimiter, async (req, res) => {
  try {

    let lat;
    let lon;
    let cityName;


    if (req.query.city) {

      const city = req.query.city;

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );

      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return res.json({
          error: "City not found",
        });
      }

      lat = geoData.results[0].latitude;
      lon = geoData.results[0].longitude;
      cityName = geoData.results[0].name;
    }

    else if (req.query.lat && req.query.lon) {

      lat = req.query.lat;
      lon = req.query.lon;
      cityName = "Current Location";
    }

    else {

      return res.json({
        error: "City or coordinates required",
      });

    }

    if (cityName !== "Current Location") {
        await Search.create({
            city: cityName,
            uid: req.query.uid,
        });
    }

    const cacheKey = req.query.city ? `city-${req.query.city}` : `gps-${lat}-${lon}`;

    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < 10 * 60 * 1000) {
        return res.json(cache[cacheKey].data);
    }
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,rain_sum,showers_sum,precipitation_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant&hourly=temperature_2m,cloud_cover,relative_humidity_2m,precipitation_probability,apparent_temperature,precipitation,rain,showers,wind_direction_10m,wind_speed_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,wind_direction_10m,wind_speed_10m,cloud_cover&timezone=auto`
    );

    const weatherData = await weatherRes.json();

    const aqiRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`
    );

    const aqiData = await aqiRes.json();

    const result = {
        city: cityName,
        latitude: lat,
        longitude: lon,

        forecast: weatherData,

        airQuality: {
            aqi: aqiData.current?.us_aqi,
            pm25: aqiData.current?.pm2_5,
            pm10: aqiData.current?.pm10,
            carbonMonoxide: aqiData.current?.carbon_monoxide,
            nitrogenDioxide: aqiData.current?.nitrogen_dioxide,
            sulphurDioxide: aqiData.current?.sulphur_dioxide,
            ozone: aqiData.current?.ozone,
        },
    };

    cache[cacheKey] = {
        timestamp: Date.now(),
        data: result,
    };

    res.json(result);
  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error",
    });

  }
});

app.get("/recent-searches", async (req, res) => {

  const searches = await Search.find()
    .sort({ searchedAt: -1 })
    .limit(10);

  res.json(searches);

});

const User = require("./models/users");

app.use(express.json());

app.post("/login", async (req, res) => {

  console.log("LOGIN RECEIVED");
  console.log(req.body);

  let user = await User.findOne({
    uid: req.body.uid
  });

  if (!user) {

    console.log("CREATING USER");

    user = await User.create(req.body);
  }

  res.json(user);
});

app.get("/users", async (req, res) => {

  const users = await User.find();

  res.json(users);

});

app.post("/saved", async (req, res) => {

  const { uid, city } = req.body;

  const existing =
    await saved.findOne({
      uid,
      city,
    });

  if (existing) {
    return res.json({
      message: "Already saved",
    });
  }

  const saves =
    await saved.create({
      uid,
      city,
    });

  res.json(saves);
});

app.get("/get-saved-locations", async (req, res) => {

  const locations =
    await saved.find({
      uid: req.query.uid,
    });

  res.json(locations);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
