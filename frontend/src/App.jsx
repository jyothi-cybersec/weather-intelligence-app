import { useState } from "react";
import "./App.css";

function App() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Drizzle",
      55: "Heavy drizzle",
      61: "Light rain",
      63: "Rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Rain showers",
      82: "Heavy rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with hail",
    };

    return weatherCodes[code] || "Unknown conditions";
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if ([1, 2].includes(code)) return "🌤️";
    if ([3, 45, 48].includes(code)) return "☁️";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return "🌧️";
    }
    if ([71, 73, 75].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";

    return "🌡️";
  };

  const searchWeather = async () => {
    if (!location.trim()) {
      setError("Please enter a location.");
      setWeather(null);
      return;
    }

    setError("");
    setWeather(null);
    setLoading(true);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location.trim()
        )}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("LOCATION_SERVICE_ERROR");
      }

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("Location not found. Please try another city or town.");
        return;
      }

      const place = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`
      );

      if (!weatherResponse.ok) {
        throw new Error("WEATHER_SERVICE_ERROR");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        place,
        data: weatherData,
      });
    } catch (err) {
      console.error(err);
      setError(
        "Unable to retrieve weather data right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError("");
    setWeather(null);
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`
          );

          if (!response.ok) {
            throw new Error("CURRENT_LOCATION_WEATHER_ERROR");
          }

          const data = await response.json();

          setWeather({
            place: {
              name: "Your Current Location",
              latitude,
              longitude,
            },
            data,
          });
        } catch (err) {
          console.error(err);
          setError("Unable to retrieve weather for your location.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error(error);

        if (error.code === error.PERMISSION_DENIED) {
          setError(
            "Location permission was denied. Please allow location access and try again."
          );
        } else {
          setError("Unable to determine your current location.");
        }

        setLocationLoading(false);
      }
    );
  };

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">WEATHER INTELLIGENCE</p>

        <h1>
          Know the weather.
          <br />
          Plan smarter.
        </h1>

        <p className="subtitle">
          Get real-time weather conditions and a 5-day forecast for any
          location.
        </p>

        <div className="search-area">
          <input
            type="text"
            placeholder="Enter a city or location..."
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                searchWeather();
              }
            }}
            disabled={loading || locationLoading}
          />

          <button
            onClick={searchWeather}
            disabled={loading || locationLoading}
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            className="location-button"
            onClick={useCurrentLocation}
            disabled={loading || locationLoading}
          >
            {locationLoading ? "Finding you..." : "📍 Use My Location"}
          </button>
        </div>

        {loading && (
          <div className="loading">
            Fetching real-time weather data...
          </div>
        )}

        {locationLoading && (
          <div className="loading">
            Requesting your current location...
          </div>
        )}

        {error && <div className="error">{error}</div>}
      </section>

      {weather && (
        <section className="weather-section">
          <div className="current-weather">
            <div>
              <p className="location-name">
                {weather.place.name}
                {weather.place.country
                  ? `, ${weather.place.country}`
                  : ""}
              </p>

              <div className="temperature">
                {Math.round(weather.data.current.temperature_2m)}
                {weather.data.current_units.temperature_2m}
              </div>

              <p className="condition">
                {getWeatherIcon(weather.data.current.weather_code)}{" "}
                {getWeatherDescription(weather.data.current.weather_code)}
              </p>
            </div>

            <div className="weather-details">
              <div>
                <span>Feels like</span>
                <strong>
                  {Math.round(
                    weather.data.current.apparent_temperature
                  )}
                  °
                </strong>
              </div>

              <div>
                <span>Humidity</span>
                <strong>
                  {weather.data.current.relative_humidity_2m}%
                </strong>
              </div>

              <div>
                <span>Wind</span>
                <strong>
                  {Math.round(weather.data.current.wind_speed_10m)} km/h
                </strong>
              </div>

              <div>
                <span>Rain</span>
                <strong>
                  {weather.data.current.precipitation} mm
                </strong>
              </div>
            </div>
          </div>

          <div className="forecast">
            <h2>5-Day Forecast</h2>

            <div className="forecast-grid">
              {weather.data.daily.time.map((date, index) => (
                <div className="forecast-card" key={date}>
                  <p>
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </p>

                  <div className="forecast-icon">
                    {getWeatherIcon(
                      weather.data.daily.weather_code[index]
                    )}
                  </div>

                  <strong>
                    {Math.round(
                      weather.data.daily.temperature_2m_max[index]
                    )}
                    °
                  </strong>

                  <span>
                    {Math.round(
                      weather.data.daily.temperature_2m_min[index]
                    )}
                    °
                  </span>

                  <small>
                    🌧️{" "}
                    {weather.data.daily.precipitation_probability_max[
                      index
                    ] ?? 0}
                    %
                  </small>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer>
        <strong>Weather Intelligence App</strong>
        <span>AI Engineer Technical Assessment</span>
      </footer>
    </main>
  );
}

export default App;