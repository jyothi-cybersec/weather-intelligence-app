import { useState } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";

const API_URL = "http://localhost:5000/api";

function App() {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // OWNER LOGIN
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // ==========================================
  // WEATHER DESCRIPTION
  // ==========================================

  const getWeatherDescription = (code) => {
    const codes = {
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

    return codes[code] || "Unknown conditions";
  };

  // ==========================================
  // WEATHER ICON
  // ==========================================

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";

    if ([1, 2].includes(code)) {
      return "🌤️";
    }

    if ([3, 45, 48].includes(code)) {
      return "☁️";
    }

    if (
      [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)
    ) {
      return "🌧️";
    }

    if ([71, 73, 75].includes(code)) {
      return "❄️";
    }

    if ([95, 96, 99].includes(code)) {
      return "⛈️";
    }

    return "🌡️";
  };

  // ==========================================
  // SEARCH WEATHER THROUGH BACKEND
  // ==========================================

  const searchWeather = async () => {
    setError("");
    setWeather(null);

    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both a start date and an end date.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after the end date.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/weather`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: location.trim(),
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to retrieve weather data."
        );
      }

      const record = result.record;

      const weatherData = JSON.parse(
        record.weather_data
      );

      setWeather({
        recordId: record.id,

        place: {
          name: record.location,
          latitude: record.latitude,
          longitude: record.longitude,
        },

        data: weatherData,

        startDate: record.start_date,
        endDate: record.end_date,
      });
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to retrieve weather data right now."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CURRENT LOCATION
  // ==========================================

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setError("");
    setWeather(null);
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } =
          position.coords;

        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=5`
          );

          if (!response.ok) {
            throw new Error(
              "Unable to retrieve weather for your location."
            );
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

          setError(
            "Unable to retrieve weather for your current location."
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (geoError) => {
        console.error(geoError);

        if (
          geoError.code ===
          geoError.PERMISSION_DENIED
        ) {
          setError(
            "Location permission was denied. Please allow location access and try again."
          );
        } else {
          setError(
            "Unable to determine your current location."
          );
        }

        setLocationLoading(false);
      }
    );
  };

  // ==========================================
  // OWNER LOGIN
  // ==========================================

  const adminLogin = async () => {
    setAdminError("");
    setAdminLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: adminUsername,
            password: adminPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Invalid owner credentials."
        );
      }

      setAdminToken(data.token);
      setIsAdmin(true);

      setShowAdminLogin(false);

      setAdminUsername("");
      setAdminPassword("");
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // ==========================================
  // OWNER LOGOUT
  // ==========================================

  const adminLogout = () => {
    setIsAdmin(false);
    setAdminToken("");
  };

  // ==========================================
  // OWNER DASHBOARD
  // ==========================================

  if (isAdmin) {
    return (
      <AdminDashboard
        token={adminToken}
        onLogout={adminLogout}
      />
    );
  }

  // ==========================================
  // DAILY DATA
  // ==========================================

  const daily = weather?.data?.daily;

  // ==========================================
  // WEATHER INTELLIGENCE
  // ==========================================

  const getWeatherInsights = () => {
    if (
      !daily ||
      !daily.time ||
      daily.time.length === 0
    ) {
      return null;
    }

    let hottestIndex = 0;
    let wettestIndex = 0;
    let highestRainIndex = 0;

    daily.temperature_2m_max.forEach(
      (temperature, index) => {
        if (
          temperature >
          daily.temperature_2m_max[hottestIndex]
        ) {
          hottestIndex = index;
        }
      }
    );

    const precipitation = daily.precipitation_sum || [];

    precipitation.forEach((rain, index) => {
      if (
        rain >
        (precipitation[wettestIndex] || 0)
      ) {
        wettestIndex = index;
      }
    });

    const rainProbability =
      daily.precipitation_probability_max || [];

    rainProbability.forEach(
      (probability, index) => {
        if (
          probability >
          (rainProbability[highestRainIndex] || 0)
        ) {
          highestRainIndex = index;
        }
      }
    );

    const highestRain =
      rainProbability[highestRainIndex] || 0;

    let recommendation;

    if (highestRain >= 70) {
      recommendation =
        "High rain risk detected. Consider indoor plans on the wettest days.";
    } else if (highestRain >= 40) {
      recommendation =
        "Moderate rain risk. Keep an umbrella nearby for outdoor activities.";
    } else {
      recommendation =
        "Overall rain risk is relatively low. Outdoor plans look reasonable.";
    }

    return {
      hottestDay: daily.time[hottestIndex],

      hottestTemperature:
        daily.temperature_2m_max[hottestIndex],

      wettestDay: daily.time[wettestIndex],

      wettestRain:
        precipitation[wettestIndex] || 0,

      highestRainDay:
        daily.time[highestRainIndex],

      highestRainProbability:
        highestRain,

      recommendation,
    };
  };

  const insights = getWeatherInsights();

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <main className="app">

      {/* HERO */}

      <section className="hero">

        <p className="eyebrow">
          WEATHER INTELLIGENCE
        </p>

        <h1>
          Know the weather.
          <br />
          Plan smarter.
        </h1>

        <p className="subtitle">
          Get real-time weather conditions and a
          forecast for any location and date range.
        </p>

        {/* SEARCH */}

        <div className="search-area">

          <input
            type="text"
            placeholder="Enter a city or location..."
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            disabled={
              loading || locationLoading
            }
          />

          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(event.target.value)
            }
            disabled={
              loading || locationLoading
            }
          />

          <input
            type="date"
            value={endDate}
            onChange={(event) =>
              setEndDate(event.target.value)
            }
            disabled={
              loading || locationLoading
            }
          />

          <button
            onClick={searchWeather}
            disabled={
              loading || locationLoading
            }
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>

          <button
            className="location-button"
            onClick={useCurrentLocation}
            disabled={
              loading || locationLoading
            }
          >
            {locationLoading
              ? "Finding you..."
              : "📍 Use My Location"}
          </button>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="loading">
            Fetching and saving weather data...
          </div>
        )}

        {locationLoading && (
          <div className="loading">
            Requesting your current location...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

      </section>

      {/* WEATHER RESULT */}

      {weather && (
        <section className="weather-section">

          {/* CURRENT WEATHER */}

          <div className="current-weather">

            <div>

              <p className="location-name">
                {weather.place.name}
              </p>

              {weather.recordId && (
                <small>
                  Saved record #{weather.recordId}
                  {" • "}
                  {weather.startDate}
                  {" → "}
                  {weather.endDate}
                </small>
              )}

              {weather.data.current && (
                <>

                  <div className="temperature">
                    {Math.round(
                      weather.data.current
                        .temperature_2m
                    )}
                    °
                  </div>

                  <p className="condition">

                    {getWeatherIcon(
                      weather.data.current
                        .weather_code
                    )}

                    {" "}

                    {getWeatherDescription(
                      weather.data.current
                        .weather_code
                    )}

                  </p>

                  <div className="weather-details">

                    <div>
                      <span>
                        Feels like
                      </span>

                      <strong>
                        {Math.round(
                          weather.data.current
                            .apparent_temperature
                        )}
                        °
                      </strong>
                    </div>

                    <div>
                      <span>
                        Humidity
                      </span>

                      <strong>
                        {
                          weather.data.current
                            .relative_humidity_2m
                        }
                        %
                      </strong>
                    </div>

                    <div>
                      <span>
                        Wind
                      </span>

                      <strong>
                        {Math.round(
                          weather.data.current
                            .wind_speed_10m
                        )}{" "}
                        km/h
                      </strong>
                    </div>

                    <div>
                      <span>
                        Rain
                      </span>

                      <strong>
                        {
                          weather.data.current
                            .precipitation
                        }{" "}
                        mm
                      </strong>
                    </div>

                  </div>

                </>
              )}

            </div>

          </div>

          {/* WEATHER INTELLIGENCE */}

          {insights && (
            <div className="weather-intelligence">

              <h2>
                🧠 Weather Intelligence
              </h2>

              <div className="insight-grid">

                <div>
                  <span>
                    🌡️ Hottest Day
                  </span>

                  <strong>
                    {new Date(
                      insights.hottestDay
                    ).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                      }
                    )}

                    {" — "}

                    {Math.round(
                      insights.hottestTemperature
                    )}
                    °
                  </strong>
                </div>

                <div>
                  <span>
                    🌧️ Highest Rain Risk
                  </span>

                  <strong>
                    {new Date(
                      insights.highestRainDay
                    ).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                      }
                    )}

                    {" — "}

                    {
                      insights.highestRainProbability
                    }
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    💧 Wettest Day
                  </span>

                  <strong>
                    {new Date(
                      insights.wettestDay
                    ).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                      }
                    )}

                    {" — "}

                    {insights.wettestRain}
                    {" "}
                    mm
                  </strong>
                </div>

              </div>

              <p className="planning-advice">
                💡{" "}
                {insights.recommendation}
              </p>

            </div>
          )}

          {/* FORECAST */}

          {daily && (
            <div className="forecast">

              <h2>
                Forecast
              </h2>

              <div className="forecast-grid">

                {daily.time.map(
                  (date, index) => (

                    <div
                      className="forecast-card"
                      key={date}
                    >

                      <p>
                        {new Date(
                          date
                        ).toLocaleDateString(
                          "en-US",
                          {
                            weekday:
                              "short",
                          }
                        )}
                      </p>

                      <div className="forecast-icon">

                        {getWeatherIcon(
                          daily
                            .weather_code[
                            index
                          ]
                        )}

                      </div>

                      <strong>
                        {Math.round(
                          daily
                            .temperature_2m_max[
                            index
                          ]
                        )}
                        °
                      </strong>

                      <span>
                        {Math.round(
                          daily
                            .temperature_2m_min[
                            index
                          ]
                        )}
                        °
                      </span>

                      <small>
                        🌧️{" "}
                        {daily
                          .precipitation_probability_max?.[
                          index
                        ] ?? 0}
                        %
                      </small>

                    </div>

                  )
                )}

              </div>

            </div>
          )}

        </section>
      )}

      {/* FOOTER */}

      <footer>

        <strong>
          Weather Intelligence App
        </strong>

        <span>
          AI Engineer Technical Assessment
        </span>

        <button
          className="owner-button"
          onClick={() => {
            setAdminError("");
            setShowAdminLogin(true);
          }}
        >
          🔐 Owner
        </button>

      </footer>

      {/* OWNER LOGIN */}

      {showAdminLogin && (
        <div className="admin-login-overlay">

          <div className="admin-login">

            <h2>
              Owner Login
            </h2>

            <p>
              Private app management area
            </p>

            <input
              type="text"
              placeholder="Owner username"
              value={adminUsername}
              onChange={(event) =>
                setAdminUsername(
                  event.target.value
                )
              }
            />

            <input
              type="password"
              placeholder="Owner password"
              value={adminPassword}
              onChange={(event) =>
                setAdminPassword(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  adminLogin();
                }
              }}
            />

            {adminError && (
              <div className="error">
                {adminError}
              </div>
            )}

            <div className="admin-login-actions">

              <button
                onClick={adminLogin}
                disabled={adminLoading}
              >
                {adminLoading
                  ? "Signing in..."
                  : "Login"}
              </button>

              <button
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminError("");
                  setAdminPassword("");
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default App;