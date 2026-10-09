/**
 * weather.js — Open-Meteo API Requests, Validations, and Weather-Data Handling
 *
 * What this file does:
 *   - Builds comprehensive API request URLs from geographic coordinates.
 *   - Fetches current weather, hourly forecast, 7-day outlook, solar cycles, UV,
 *     and 7-day observed historical weather in a unified Open-Meteo request.
 *   - Provides safe reverse geocoding to resolve human-readable place names.
 *   - Strictly validates all numeric fields using Number.isFinite().
 *   - Converts WMO weather codes into descriptive labels and icons.
 *   - Enforces a 10-second timeout with AbortController.
 */

// ─── API Configuration ────────────────────────────────────────────────
const API_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Mandatory and auxiliary current fields from Open-Meteo.
 */
const CURRENT_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "weather_code",
  "wind_speed_10m",
  "wind_direction_10m",
  "uv_index",
].join(",");

// ─── WMO Weather Interpretation Codes ─────────────────────────────────
const WEATHER_CODES = {
  0:  { label: "Clear sky",                   icon: "☀️"  },
  1:  { label: "Mainly clear",                icon: "🌤️" },
  2:  { label: "Partly cloudy",               icon: "⛅"  },
  3:  { label: "Overcast",                    icon: "☁️"  },
  45: { label: "Foggy",                       icon: "🌫️" },
  48: { label: "Depositing rime fog",         icon: "🌫️" },
  51: { label: "Light drizzle",               icon: "🌦️" },
  53: { label: "Moderate drizzle",            icon: "🌦️" },
  55: { label: "Dense drizzle",               icon: "🌧️" },
  56: { label: "Light freezing drizzle",      icon: "🌧️" },
  57: { label: "Dense freezing drizzle",      icon: "🌧️" },
  61: { label: "Slight rain",                 icon: "🌧️" },
  63: { label: "Moderate rain",               icon: "🌧️" },
  65: { label: "Heavy rain",                  icon: "🌧️" },
  66: { label: "Light freezing rain",         icon: "🌧️" },
  67: { label: "Heavy freezing rain",         icon: "🌧️" },
  71: { label: "Slight snow fall",            icon: "🌨️" },
  73: { label: "Moderate snow fall",          icon: "🌨️" },
  75: { label: "Heavy snow fall",             icon: "❄️"  },
  77: { label: "Snow grains",                 icon: "🌨️" },
  80: { label: "Slight rain showers",         icon: "🌦️" },
  81: { label: "Moderate rain showers",       icon: "🌧️" },
  82: { label: "Violent rain showers",        icon: "🌧️" },
  85: { label: "Slight snow showers",         icon: "🌨️" },
  86: { label: "Heavy snow showers",          icon: "❄️"  },
  95: { label: "Thunderstorm",                icon: "⛈️" },
  96: { label: "Thunderstorm with slight hail",icon: "⛈️" },
  99: { label: "Thunderstorm with heavy hail", icon: "⛈️" },
};

/**
 * Returns weather label and emoji icon for any WMO code.
 * @param {number} code
 * @returns {{ label: string, icon: string }}
 */
export function getWeatherCondition(code) {
  return WEATHER_CODES[code] ?? { label: "Unknown condition", icon: "❓" };
}

// ─── Internal Helpers ─────────────────────────────────────────────────

/**
 * Custom error factory marking weather-specific domain errors.
 * @param {string} message
 * @returns {Error}
 */
function weatherError(message) {
  const err = new Error(message);
  err.isWeatherError = true;
  return err;
}

/**
 * Strictly verifies finite numbers to prevent NaN, null, or Infinity.
 * @param {*} val
 * @param {string} field
 * @returns {number}
 */
function requireFiniteNumber(val, field) {
  if (!Number.isFinite(val)) {
    throw weatherError(`Incomplete weather telemetry: "${field}" is missing or invalid.`);
  }
  return val;
}

/**
 * Build URL incorporating current conditions, 24h hourly, 7-day outlook,
 * and 7-day historical observation archive.
 * @param {number} lat
 * @param {number} lon
 * @returns {string}
 */
function buildUrl(lat, lon) {
  const params = new URLSearchParams({
    latitude:      lat,
    longitude:     lon,
    current:       CURRENT_FIELDS,
    hourly:        "temperature_2m,weather_code,precipitation_probability",
    daily:         "weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,uv_index_max,sunrise,sunset",
    past_days:     "7",
    forecast_days: "7",
    timezone:      "auto",
  });
  return `${API_BASE_URL}?${params.toString()}`;
}

// ─── Reverse Geocoding ────────────────────────────────────────────────

/**
 * Resolves geographic coordinates into a human-readable city and region name.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{ cityName: string, regionName: string, isApproximate: boolean }>}
 */
export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "WeatherDashboard-IntelligenceApp/2.0" },
    });
    if (!response.ok) throw new Error("Reverse geocoding failed");
    const data = await response.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || addr.county || "Current Location";
    const region = addr.state || addr.country || "Local Area";
    return {
      cityName: city,
      regionName: region,
      isApproximate: true,
    };
  } catch {
    return {
      cityName: `Local Station (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      regionName: "Current Coordinates",
      isApproximate: true,
    };
  }
}

// ─── Main Weather Fetch Function ──────────────────────────────────────

/**
 * Fetches comprehensive real weather telemetry for any city or coordinate pair.
 * @param {{ lat: number, lon: number, name?: string }} location
 * @returns {Promise<Object>}
 */
export async function fetchWeather(location) {
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lon)) {
    throw weatherError("Invalid location coordinates provided.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = buildUrl(location.lat, location.lon);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw weatherError(
        `Weather service returned HTTP ${response.status}. Please try again shortly.`
      );
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw weatherError("Received invalid response from weather service.");
    }

    if (!data || typeof data.current !== "object") {
      throw weatherError("Weather service response is missing current conditions.");
    }

    const c = data.current;
    const temp      = requireFiniteNumber(c.temperature_2m,       "temperature_2m");
    const humidity  = requireFiniteNumber(c.relative_humidity_2m, "relative_humidity_2m");
    const feelsLike = requireFiniteNumber(c.apparent_temperature, "apparent_temperature");
    const code      = requireFiniteNumber(c.weather_code,         "weather_code");
    const windSpd   = requireFiniteNumber(c.wind_speed_10m,       "wind_speed_10m");
    const windDir   = requireFiniteNumber(c.wind_direction_10m,   "wind_direction_10m");
    const uvIndex   = Number.isFinite(c.uv_index) ? c.uv_index : 0;

    const { label: conditionLabel, icon: conditionIcon } = getWeatherCondition(code);

    // ── Parse 24-hour hourly trend ───────────────────────────────────
    let hourly = [];
    if (data.hourly && Array.isArray(data.hourly.time)) {
      const nowStr = c.time || new Date().toISOString();
      const startIndex = Math.max(0, data.hourly.time.findIndex((t) => t >= nowStr.slice(0, 13)));
      const times = data.hourly.time.slice(startIndex, startIndex + 24);
      const temps = (data.hourly.temperature_2m || []).slice(startIndex, startIndex + 24);
      const codes = (data.hourly.weather_code || []).slice(startIndex, startIndex + 24);
      const precips = (data.hourly.precipitation_probability || []).slice(startIndex, startIndex + 24);

      hourly = times.map((t, idx) => {
        const hourCode = codes[idx] ?? 0;
        const cond = getWeatherCondition(hourCode);
        return {
          time: t,
          temperature: temps[idx] ?? temp,
          weatherCode: hourCode,
          precipProb: precips[idx] ?? 0,
          conditionIcon: cond.icon,
          conditionLabel: cond.label,
        };
      });
    }

    // ── Parse Daily (Splitting 7 Days Historical vs 7 Days Forecast) ──
    let history = [];
    let forecast = [];
    let todayDaily = null;

    if (data.daily && Array.isArray(data.daily.time)) {
      const allDaily = data.daily.time.map((dStr, idx) => {
        const dayCode = (data.daily.weather_code || [])[idx] ?? 0;
        const cond = getWeatherCondition(dayCode);
        return {
          date: dStr,
          maxTemp: (data.daily.temperature_2m_max || [])[idx] ?? temp,
          minTemp: (data.daily.temperature_2m_min || [])[idx] ?? temp,
          meanTemp: (data.daily.temperature_2m_mean || [])[idx] ?? temp,
          precipSum: (data.daily.precipitation_sum || [])[idx] ?? 0,
          uvMax: (data.daily.uv_index_max || [])[idx] ?? uvIndex,
          sunrise: (data.daily.sunrise || [])[idx] ?? "",
          sunset: (data.daily.sunset || [])[idx] ?? "",
          weatherCode: dayCode,
          conditionIcon: cond.icon,
          conditionLabel: cond.label,
        };
      });

      // Past 7 days (index 0 to 6)
      history = allDaily.slice(0, 7);
      // Today + upcoming 6 days (index 7 to 13)
      forecast = allDaily.slice(7);
      todayDaily = allDaily[7] || allDaily[0];
    }

    return {
      temperature:         temp,
      apparentTemperature: feelsLike,
      humidity:            humidity,
      weatherCode:         code,
      windSpeed:           windSpd,
      windDirection:       windDir,
      uvIndex:             uvIndex,
      conditionLabel,
      conditionIcon,
      hourly,
      forecast,
      history,
      todayDaily,
      lastUpdated:         new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.isWeatherError) {
      throw error;
    }
    if (error.name === "AbortError") {
      throw weatherError(
        `Weather service took too long to respond (>${REQUEST_TIMEOUT_MS / 1000}s). Please retry.`
      );
    }
    throw weatherError("Could not reach weather service. Check your internet connection.");
  }
}
