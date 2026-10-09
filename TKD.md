# TKD.md — Technical Knowledge Document

## Weather Dashboard · Version 1.0

> **Legend used in this document**
> - ✅ **Confirmed** — This decision is final and will not change without a documented reason.
> - 🔍 **To verify** — This is an assumption or implementation detail that should be confirmed during development.

---

## 1. Architecture

The application is a **client-side-only, single-page application (SPA)**. There is no server, no database, and no build step.

```
Browser
  └── index.html               (page structure)
       ├── css/style.css        (visual styles, loaded via <link>)
       └── js/script.js         (entry point, loaded via <script type="module">)
            ├── js/weather.js   (Open-Meteo API fetch and error handling)
            ├── js/ui.js        (DOM rendering: loading, error, weather states)
            └── js/cities.js    (city names and coordinates)
                 └── Open-Meteo API  (external, fetched over HTTPS)
```

The browser loads `index.html`, which pulls in `css/style.css` and `js/script.js`. When the user selects a city, `script.js` calls `fetchWeather()` from `weather.js`, which calls the Open-Meteo API, and then passes the result to `ui.js` to update the DOM.

✅ No backend.  
✅ No npm, no Webpack, no Vite.  
✅ `<script type="module">` is confirmed — ES module `import`/`export` syntax is used across all four JS files.

---

## 2. Technology Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Structure | HTML5 | Standard, no dependencies. |
| Styling | CSS3 | Native browser support; no library needed. |
| Logic | Vanilla JavaScript (ES2020+) | Keeps the project beginner-friendly and dependency-free. |
| Data | Open-Meteo API | Free, no API key, CORS-enabled, returns JSON. |
| Version control | Git + GitHub | Industry standard; free public hosting. |
| Deployment *(optional)* | GitHub Pages | Free static hosting directly from the repository. |

✅ All technology choices are confirmed.

---

## 3. Folder Structure

```
weather-dashboard/
├── index.html           ← The only HTML page
├── css/
│   └── style.css        ← All CSS styles
├── js/
│   ├── script.js        ← App entry point: events and coordination
│   ├── weather.js       ← Open-Meteo API requests and data handling
│   ├── ui.js            ← DOM updates: loading, error, and weather display
│   └── cities.js        ← City names and coordinates
├── README.md            ← How to open and use the project
├── PROJECT.md           ← Project overview and milestones
├── AGENTS.md            ← Rules for AI coding agents
├── PRD.md               ← Product requirements
├── TKD.md               ← This file (technical knowledge)
└── DESIGN.md            ← Visual design specification
```

✅ Sub-folder structure confirmed — `css/` contains the stylesheet; `js/` contains the four JavaScript modules.  
🔍 A `/icons/` folder may be added later if SVG weather icons are stored locally instead of rendered as emoji or Unicode characters.

---

## 4. Open-Meteo API

### 4.1 Base URL

```
https://api.open-meteo.com/v1/forecast
```

### 4.2 Required Query Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `latitude` | e.g. `51.5074` | City latitude (decimal degrees). |
| `longitude` | e.g. `-0.1278` | City longitude (decimal degrees). |
| `current` | `temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m` | Comma-separated list of current-condition fields to fetch. |

> **What is `current`?** The `current` parameter tells the API to return the most recently observed values rather than an hourly or daily forecast. ✅ **Confirmed by a live API call made on 2026-10-09.** Data updates approximately every **15 minutes** (the response contains `"interval": 900`, where 900 seconds = 15 minutes).

### 4.3 Example Request URL

```
https://api.open-meteo.com/v1/forecast
  ?latitude=51.5074
  &longitude=-0.1278
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m
```

### 4.4 Example JSON Response (confirmed real structure — numeric values change with live weather)

The shape below was returned by a live call on 2026-10-09 for London. **The numbers will be different when you call the API** because weather changes constantly.

```json
{
  "latitude": 51.51147,
  "longitude": -0.13078,
  "timezone": "GMT",
  "current_units": {
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "weather_code": "wmo code",
    "wind_speed_10m": "km/h"
  },
  "current": {
    "time": "2026-10-09T16:30",
    "interval": 900,
    "temperature_2m": 18.5,
    "relative_humidity_2m": 74,
    "weather_code": 2,
    "wind_speed_10m": 22.3
  }
}
```

> ℹ️ The `interval` field (value `900`) tells you data refreshes every 900 seconds (15 minutes). Your app code does **not** need to read or display this field.

> ⚠️ The `latitude` and `longitude` values in the response are snapped to the nearest model grid point and may differ slightly from the coordinates you sent. This is normal — no special handling is needed.

✅ **Field names confirmed** by live call: `temperature_2m`, `relative_humidity_2m`, `weather_code`, and `wind_speed_10m` are all present and correctly named.

### 4.5 Units Returned

| Field | Unit | Confirmed? |
|-------|------|------------|
| `temperature_2m` | °C (default) | ✅ Confirmed |
| `apparent_temperature` | °C (default) | ✅ Confirmed |
| `relative_humidity_2m` | % | ✅ Confirmed |
| `wind_speed_10m` | km/h (default) | ✅ Confirmed |
| `wind_direction_10m` | ° (degrees, 0–360) | ✅ Confirmed |
| `weather_code` | WMO code integer (see Section 6) | ✅ Confirmed |

✅ Default units match the project requirements; no extra unit parameters are needed.

---

## 5. City Coordinate Data

The city list is defined as a JavaScript array of objects exported from `js/cities.js`. It is imported by `js/script.js` at startup to populate the dropdown and look up coordinates for each API request.

```js
// Source: js/cities.js (actual current content)
// ⚠️ Assumption: coordinates are standard reference values.
//    Verify against a reliable source (e.g. Google Maps) before publishing.
export const CITIES = [
  { name: "Indore",    lat:  22.7196,  lon:  75.8577  },
  { name: "Bhopal",    lat:  23.2599,  lon:  77.4126  },
  { name: "Mumbai",    lat:  19.0760,  lon:  72.8777  },
  { name: "New Delhi", lat:  28.6139,  lon:  77.2090  },
  { name: "Bengaluru", lat:  12.9716,  lon:  77.5946  },
  { name: "Chennai",   lat:  13.0827,  lon:  80.2707  },
];
```

🔍 These coordinate values are standard reference values but should be confirmed against a reliable source (e.g., Wikipedia city article or Google Maps) before publishing.

---

## 6. Weather Code to Condition Mapping

Open-Meteo uses **WMO Weather Interpretation Codes** (integers). Each code maps to a human-readable condition and a visual icon.

### Mapping Strategy

A plain JavaScript object (a "lookup table") maps each code to a label and an icon character. Using emoji or Unicode symbols avoids the need for image files.

```js
// Assumption: these WMO codes are correct as of the Open-Meteo documentation.
// Verify against https://open-meteo.com/en/docs#weathervariables
const WEATHER_CODES = {
  0:  { label: "Clear sky",          icon: "☀️" },
  1:  { label: "Mainly clear",       icon: "🌤️" },
  2:  { label: "Partly cloudy",      icon: "⛅" },
  3:  { label: "Overcast",           icon: "☁️" },
  45: { label: "Foggy",              icon: "🌫️" },
  48: { label: "Icy fog",            icon: "🌫️" },
  51: { label: "Light drizzle",      icon: "🌦️" },
  61: { label: "Slight rain",        icon: "🌧️" },
  71: { label: "Slight snow",        icon: "🌨️" },
  80: { label: "Slight showers",     icon: "🌦️" },
  95: { label: "Thunderstorm",       icon: "⛈️" },
};
```

🔍 This is a **partial list**. The full WMO code table has more entries (codes 53, 55, 63, 65, 73, 75, 77, 81, 82, 85, 86, 96, 99). The complete map must be populated during implementation.

**Fallback:** If a code is not found in the map, display "Unknown condition" and a `❓` icon rather than crashing.

---

## 7. Request Lifecycle

This describes exactly what happens, step by step, from the user's action to the displayed result.

```
1. User selects a city from the <select> dropdown.
2. script.js reads the selected city's lat/lon from the CITIES array (imported from cities.js).
3. script.js calls showLoading() from ui.js, which hides other panels and shows the spinner.
4. weather.js constructs the API URL with the city's lat/lon and the required field names.
5. weather.js calls: const response = await fetch(url)
6a. If fetch throws (network offline):
    → weather.js throws a descriptive Error; script.js catches it → Section 8.
6b. If response.ok is false (e.g., HTTP 400, 500):
    → weather.js throws a descriptive Error; script.js catches it → Section 8.
7. weather.js calls: const data = await response.json()
8. weather.js reads data.current.temperature_2m, .relative_humidity_2m,
          .weather_code, .wind_speed_10m
9. If any field is undefined or null:
    → weather.js throws a descriptive Error; script.js catches it → Section 8.
10. weather.js looks up the weather code in WEATHER_CODES to get label + icon.
11. weather.js returns the weather object to script.js.
12. script.js calls showWeather(data) from ui.js, which writes all values to the DOM.
13. ui.js hides the loading spinner and reveals the weather card.
```

---

## 8. Error Handling Strategy

All errors must be caught inside a `try/catch` block. On any error:

1. Hide the loading spinner.
2. Hide the weather data panel.
3. Show the error message panel with a descriptive message.
4. Show the "Retry" button, which calls the same fetch function again.

```js
// Pseudocode structure — not final implementation
async function fetchWeather(city) {
  showLoading();
  hideError();
  hideWeatherData();

  try {
    const response = await fetch(buildUrl(city));

    if (!response.ok) {
      throw new Error(`API error: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.current) {
      throw new Error("Response is missing 'current' data.");
    }

    displayWeather(data.current);

  } catch (error) {
    console.error("fetchWeather failed:", error);
    showError("Could not load weather data. Please check your connection and try again.");
  } finally {
    hideLoading();
  }
}
```

🔍 The exact error messages are not finalised. They should be reviewed for clarity before the project is published.

---

## 9. Testing Strategy

This is a beginner, single-day project. Testing is manual.

| Test type | Approach |
|-----------|----------|
| **Happy path** | Select each city in the dropdown; verify live data appears. |
| **Network failure** | Use the browser DevTools "Network" tab → set throttling to "Offline"; verify error message and Retry button appear. |
| **Retry** | After the error state, re-enable the network and click Retry; verify data loads. |
| **Mobile layout** | Use browser DevTools "Device Toolbar" to simulate a 375 px screen; verify no horizontal scrolling. |
| **Keyboard access** | Tab through all interactive elements; verify they are all reachable and activatable. |
| **API shape** | Open the API URL directly in the browser and inspect the raw JSON to confirm field names match the code. |

🔍 Automated testing (unit tests, end-to-end tests) is out of scope for this version but could be added later using a tool such as Playwright.
