# Weather Dashboard

A clean, minimal, responsive weather dashboard that shows real current weather data for a selection of cities. Built with plain HTML, CSS, and vanilla JavaScript — no frameworks or build tools required.

---

## Features

- **India-Wide Dynamic Search:** Search for any city, town, or district across India using the Open-Meteo Geocoding API with live debounced autocomplete suggestions.
- **6 Curated Regional Hubs:** Quick picks for Indore, Bhopal, Mumbai, Delhi, Bengaluru, and Chennai.
- **Real-Time Atmospheric Telemetry:** Live current weather from [Open-Meteo](https://open-meteo.com/) — temperature, condition icons, relative humidity, wind speed, wind direction, apparent temperature, and UV index.
- **24-Hour Thermal Trajectory:** Interactive SVG sparkline chart illustrating 24-hour temperature evolution.
- **7-Day Synoptic Outlook:** Daily high/low temperature forecasts and precipitation probabilities.
- **Multi-Screen Experience:** Seamlessly navigate between City Observatory, Weather Report, Historical Comparisons, Travel Weather Planner, and User Settings.
- **Customizable Preferences:** Temperature unit toggle (°C / °F), wind speed unit toggle (km/h / mph), and persistent favorites in `localStorage`.
- **Keyboard & Screen-Reader Accessible:** Accessible autocomplete combobox (`role="combobox"`, `aria-autocomplete`, Arrow navigation, Enter to select, Escape to close).
- **Graceful Error Recovery:** Built-in loading spinners, polite empty-search feedback, and connection retry banners.

---

## How to Open the Project

You do **not** need to install anything. There is no build step.

### Option 1 — Open directly in a browser (simplest)

> ⚠️ **Note:** Because the JavaScript files use ES modules (`import`/`export`), most browsers block them when opened as plain files (`file:///...`). Use Option 2 or 3 instead.

### Option 2 — Use VS Code Live Server (recommended for beginners)

1. Install the **Live Server** extension in VS Code (search "Live Server" in the Extensions panel).
2. Open the `weather-dashboard` folder in VS Code.
3. Right-click `index.html` in the file explorer.
4. Choose **"Open with Live Server"**.
5. A browser tab will open automatically at `http://127.0.0.1:5500`.

### Option 3 — Use Python's built-in HTTP server

If you have Python installed, open a terminal in the project folder and run:

```bash
# Python 3
python -m http.server 8080
```

Then visit `http://localhost:8080` in your browser.

---

## Project Structure

```
weather-dashboard/
├── index.html          ← The single HTML page
├── css/
│   └── style.css       ← All visual styles and responsive rules
├── js/
│   ├── script.js       ← App entry point: events and coordination
│   ├── weather.js      ← Open-Meteo API requests and data handling
│   ├── ui.js           ← DOM updates: loading, error, and weather display
│   └── cities.js       ← City names and coordinates
├── README.md           ← This file
├── .gitignore          ← Files Git should not track
├── PROJECT.md          ← Project overview and milestones
├── AGENTS.md           ← AI agent coding rules
├── PRD.md              ← Product requirements
├── TKD.md              ← Technical knowledge document
└── DESIGN.md           ← Visual design specification
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, flexbox, grid) |
| Logic | Vanilla JavaScript (ES2020 modules) |
| Weather data | [Open-Meteo API](https://open-meteo.com/) |

---

## API Attribution

Weather data and geocoding services are provided by **[Open-Meteo](https://open-meteo.com/)** — a free, open-source weather and geocoding platform that requires no registration or API key.

- **Forecast API endpoint:** `https://api.open-meteo.com/v1/forecast`
  - Fields used: `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `weather_code`, `wind_speed_10m`, `wind_direction_10m`, `uv_index`, `precipitation_probability`
  - Data refreshes approximately every 15 minutes.
- **Geocoding API endpoint:** `https://geocoding-api.open-meteo.com/v1/search`
  - Powers India-wide city and town search (`country_code=IN`) with district/state disambiguation.

---

## Status

> This project is currently under active development.
> Not all features are fully implemented yet.
