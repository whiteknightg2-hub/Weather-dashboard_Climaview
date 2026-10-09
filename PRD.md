# PRD.md — Product Requirements Document

## Weather Dashboard · Version 1.0

---

## 1. Target User

**Primary user:** A beginner web developer (or a curious general user) who wants to quickly check the current weather in one of several predefined cities. They are using a modern web browser on either a laptop or a smartphone. They do not need to sign in or install anything.

---

## 2. Problem Statement

Checking weather often means navigating to a cluttered, ad-heavy website or installing a mobile app. This project provides a clean, minimal, single-page dashboard that shows only the essential current weather data, loads instantly, and works without any account or installation.

---

## 3. User Stories

| ID | As a… | I want to… | So that… |
|----|-------|------------|----------|
| US-01 | user | choose a city from a dropdown | I can see weather for the city I care about. |
| US-02 | user | see the current temperature in Celsius | I immediately know how hot or cold it is. |
| US-03 | user | see a weather condition label and icon | I can understand the weather at a glance (sunny, rainy, etc.). |
| US-04 | user | see relative humidity | I know how muggy or dry it will feel. |
| US-05 | user | see wind speed in km/h | I can decide whether to bring a jacket or not. |
| US-06 | user | see a loading indicator while data is fetching | I know the app is working and not frozen. |
| US-07 | user | see a clear error message if data cannot be loaded | I understand what went wrong and what to do next. |
| US-08 | user | click a retry button after an error | I can try again without refreshing the whole page. |
| US-09 | user | use the page on my phone | The layout is still usable on a small screen. |
| US-10 | user | navigate the page with only my keyboard | The app is accessible to me even without a mouse. |

---

## 4. Functional Requirements

### 4.1 Mandatory (Must Have)

| ID | Requirement |
|----|-------------|
| FR-01 | A dropdown (`<select>`) must list at least 5 predefined cities. |
| FR-02 | Selecting a city must trigger a fetch to the Open-Meteo API using that city's latitude and longitude. |
| FR-03 | The response must be parsed and the following values displayed: temperature (°C), weather condition text, weather icon, relative humidity (%), wind speed (km/h). |
| FR-04 | While the request is in flight, a loading indicator must be visible and the weather data area must be hidden or dimmed. |
| FR-05 | If the request fails (network error, non-2xx response, or malformed JSON), a descriptive error message must be shown in place of the weather data. |
| FR-06 | An error state must include a "Retry" button that re-triggers the same request without a page reload. |
| FR-07 | No weather value may be hardcoded or fabricated; all values must come from the live API response. |
| FR-08 | The layout must be responsive: fully usable at 375 px wide (mobile) and 1280 px wide (desktop). |
| FR-09 | All interactive controls must be reachable and operable using the keyboard alone. |
| FR-10 | The page must include a visible page title. |

### 4.2 Optional Enhancements (Nice to Have)

| ID | Enhancement |
|----|-------------|
| OPT-01 | Auto-fetch weather for the first city when the page loads (no click needed). |
| OPT-02 | Display the local date and time at the selected city. ⚠️ **Deadline risk:** Showing the correct local time requires timezone conversion (the `Intl` browser API or the `timezone` field from Open-Meteo). This is noticeably harder than the other features and may consume several hours. Attempt only after all mandatory requirements are done. |
| OPT-03 | Show a "last updated" timestamp below the weather data. |
| OPT-04 | GitHub Pages deployment with a shareable URL. |
| OPT-05 | Smooth fade-in animation when new weather data appears. |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | The page must load and be interactive within 3 seconds on a standard broadband connection. |
| NFR-02 | Text must meet WCAG AA contrast ratio (at least 4.5:1 for body text). |
| NFR-03 | The codebase must use no external JavaScript libraries; only native browser APIs. |
| NFR-04 | The code must be readable by a beginner: meaningful variable names, short functions, and inline comments on non-obvious lines. |
| NFR-05 | The application must work in the latest stable versions of Chrome, Firefox, and Safari. |
| NFR-06 | No user data (location, preferences) may be sent to any server other than the Open-Meteo API. |

---

## 6. Error Scenarios

| Scenario | Expected Behaviour |
|----------|--------------------|
| Network is offline | Show error message: "Could not connect. Check your internet connection." + Retry button. |
| Open-Meteo returns a non-2xx status | Show error message: "The weather service returned an error. Please try again." + Retry button. |
| API response is missing expected fields | Show error message: "Weather data is incomplete. Please try again." Log the raw response to the browser console. |
| User selects the default "Select a city" placeholder option | Do not fetch; display nothing or a prompt asking the user to choose a city. |

---

## 7. Priorities

Features are prioritised using MoSCoW:

- **Must Have:** FR-01 through FR-10.
- **Should Have:** NFR-01 through NFR-06.
- **Could Have:** OPT-01, OPT-04.
- **Won't Have (this version):** Forecasts, geolocation, unit conversion, user accounts.

---

## 8. Acceptance Criteria

The feature is accepted when **all** of the following pass a manual check in a real browser:

| AC | Criterion |
|----|-----------|
| AC-01 | Choosing "London" from the dropdown shows London's live temperature within 5 seconds. |
| AC-02 | The temperature value changes when a different city is selected. |
| AC-03 | The temperature shown matches (within rounding) the value returned by directly querying the Open-Meteo API URL for that city. |
| AC-04 | In browser DevTools → Network tab, set throttling to "Offline", then click "Retry" — the error message appears. Re-enable the network and retry — data loads successfully. |
| AC-05 | A loading spinner is visible between clicking the dropdown and the data appearing. |
| AC-06 | The page layout does not overflow or break at 375 px viewport width. |
| AC-07 | All buttons and the dropdown are reachable by pressing the Tab key. |
| AC-08 | A screen reader announces the city name and temperature (manual check with OS accessibility tool, or inspection of ARIA attributes). |
