# PROJECT.md — Weather Dashboard

## Overview

The Weather Dashboard is a single-day beginner web project. It is a responsive web page that lets a user choose a city from a dropdown list and immediately see real, current weather data for that city — including temperature, weather condition, humidity, and wind speed.

There is no backend server. All weather data comes directly from the free [Open-Meteo API](https://open-meteo.com/), which requires no API key.

---

## Objectives

1. Build a working, real-data weather dashboard in a single day.
2. Practice HTML, CSS, and vanilla JavaScript as a beginner.
3. Publish the project on GitHub and optionally deploy it on GitHub Pages.
4. Keep the codebase simple enough that any beginner can read and understand every line.

---

## Scope

### In Scope

- A single HTML page with embedded or linked CSS and JavaScript.
- A city dropdown populated with a fixed list of cities and their coordinates.
- Live weather data fetched from the Open-Meteo API.
- Display of: current temperature (°C), weather condition with icon, relative humidity (%), and wind speed (km/h).
- A loading spinner shown while data is being fetched.
- Clear error messages and a retry button when a network request fails.
- Responsive layout that works on desktop and mobile screens.
- Basic accessibility (keyboard-navigable controls, adequate colour contrast).
- A `README.md` file explaining how to run the project.
- A public GitHub repository.

### Out of Scope (for this version)

- User accounts or saved preferences.
- Hourly or weekly forecasts.
- Geolocation / "use my current location" feature.
- Unit conversion (Fahrenheit, mph).
- A backend server or database.
- React, Vue, or any build tool (Webpack, Vite, etc.).
- Any hardcoded or invented weather numbers.

---

## Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | `index.html` | The single page of the application. |
| 2 | `css/style.css` | All visual styling and responsive rules. |
| 3 | `js/script.js` | App entry point: event handling and module coordination. |
| 4 | `js/weather.js` | Open-Meteo API requests, error handling, and WMO code mapping. |
| 5 | `js/ui.js` | DOM updates: loading, error, and weather display states. |
| 6 | `js/cities.js` | Supported city names and coordinates. |
| 7 | `README.md` | Setup and usage instructions. |
| 8 | Public GitHub repository | Source code hosted on GitHub. |
| 9 | GitHub Pages deployment *(optional)* | Live, shareable URL. |

---

## Constraints

- **No API key required.** The Open-Meteo API is free and open; no registration is needed.
- **No invented data.** Every weather value displayed must come from the live API response.
- **No unnecessary libraries.** Only native browser APIs (Fetch, DOM) are used.
- **No automatic Git commits or pushes.** All version-control actions require explicit developer approval.
- **One-day timeline.** The project must be completable in a single working day by a beginner.

---

## Milestones

| Milestone | Goal |
|-----------|------|
| M1 — Docs | All five documentation files created and reviewed. |
| M2 — Structure | `index.html` skeleton and `style.css` base layout committed. |
| M3 — Core logic | City dropdown, API fetch, and data display working. |
| M4 — Polish | Loading indicator, error handling, and responsive layout complete. |
| M5 — Publish | `README.md` written; code pushed to GitHub; Pages deployed (optional). |

---

## Definition of Done

The project is complete when **all** of the following are true:

- [ ] Selecting any city in the dropdown fetches and displays real weather data.
- [ ] Temperature, condition, humidity, and wind speed are all shown.
- [ ] A loading spinner appears while data loads and disappears when data arrives.
- [ ] A clear error message and retry button appear if the fetch fails.
- [ ] The layout is usable on a 375 px mobile screen and a 1280 px desktop screen.
- [ ] All interactive controls are keyboard-accessible.
- [ ] No hardcoded weather values exist anywhere in the code.
- [ ] The code is pushed to a public GitHub repository.
- [ ] `README.md` explains how to open and use the project.
