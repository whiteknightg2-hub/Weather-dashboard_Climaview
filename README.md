# Weather Dashboard

A clean, minimal, responsive weather dashboard that shows real current weather data for a selection of cities. Built with plain HTML, CSS, and vanilla JavaScript — no frameworks or build tools required.

---

## Features

- Choose from 6 predefined cities via a dropdown menu.
- Live current weather data from the free [Open-Meteo API](https://open-meteo.com/) — no API key needed.
- Displays: temperature (°C), weather condition with emoji icon, relative humidity (%), and wind speed (km/h).
- Loading spinner while data is being fetched.
- Clear error message and a **Try Again** button if the request fails.
- Fully responsive — works on mobile (375 px) and desktop (1280 px).
- Keyboard-accessible controls.

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

Weather data is provided by **[Open-Meteo](https://open-meteo.com/)** — a free, open-source weather API that requires no registration or API key.

- API endpoint: `https://api.open-meteo.com/v1/forecast`
- Fields used: `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `weather_code`, `wind_speed_10m`, `wind_direction_10m`
- Data refreshes approximately every 15 minutes.

---

## Status

> This project is currently under active development.
> Not all features are fully implemented yet.
