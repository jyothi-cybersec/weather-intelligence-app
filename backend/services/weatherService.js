const GEOCODING_API =
  "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

async function findLocation(location) {
  const url = new URL(GEOCODING_API);

  url.searchParams.set("name", location);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Location service unavailable.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Location not found.");
  }

  return data.results[0];
}

async function getWeatherForecast(
  latitude,
  longitude,
  startDate,
  endDate
) {
  const url = new URL(WEATHER_API);

  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);

  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
    ].join(",")
  );

  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather service unavailable.");
  }

  return response.json();
}

function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return {
      valid: false,
      message: "Start date and end date are required.",
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return {
      valid: false,
      message: "Invalid date format.",
    };
  }

  if (start > end) {
    return {
      valid: false,
      message: "Start date cannot be after end date.",
    };
  }

  return {
    valid: true,
  };
}

module.exports = {
  findLocation,
  getWeatherForecast,
  validateDateRange,
};