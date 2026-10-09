/**
 * script.js — Application Initialisation and Event Coordination for ClimaView
 *
 * Coordinates:
 *   - User onboarding & profile management via localStorage
 *   - Browser Geolocation API permission and reverse-geocoding
 *   - Multi-screen navigation (Cities, Report, Compare, History, Travel)
 *   - Search & Favorite city management
 *   - Metric conversions (°C / °F)
 *   - Multi-station comparison & travel weather evaluation
 *   - Strict race-condition prevention
 */

// ─── Imports ──────────────────────────────────────────────────────────
import { CITIES } from "./cities.js";
import { fetchWeather, reverseGeocode } from "./weather.js";
import {
  showLoading,
  showError,
  showWeather,
  showEmpty,
  setRetryHandler,
  setActiveScreen,
  renderCityCards,
  filterCityCards,
  renderComparisonCards,
  renderTravelResult,
} from "./ui.js";

// ─── LocalStorage Persistence Helpers ─────────────────────────────────
const STORAGE_KEYS = {
  USER_PROFILE: "wd_user_profile",
  FAVORITES:    "wd_favorite_cities",
  UNIT:         "wd_temp_unit",
  WIND_UNIT:    "wd_wind_unit",
  LAST_CITY:    "wd_last_city",
};

/**
 * Loads user profile or defaults.
 * @returns {{ name: string, onboarded: boolean }}
 */
function loadUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { name: "Guest", onboarded: false };
}

function saveUserProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch {}
}

/**
 * Loads saved favorite cities.
 * @returns {Set<string>}
 */
function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set(["Indore", "Mumbai"]);
}

function saveFavorites(favSet) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(Array.from(favSet)));
  } catch {}
}

/**
 * Loads temperature unit preference (°C or °F).
 * @returns {"celsius"|"fahrenheit"}
 */
function loadUnitPreference() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNIT);
    if (raw === "fahrenheit") return "fahrenheit";
  } catch {}
  return "celsius";
}

function saveUnitPreference(unit) {
  try {
    localStorage.setItem(STORAGE_KEYS.UNIT, unit);
  } catch {}
}

/**
 * Loads wind speed unit preference ("km/h" or "mph").
 * @returns {"km/h"|"mph"}
 */
function loadWindPreference() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WIND_UNIT);
    if (raw === "mph") return "mph";
  } catch {}
  return "km/h";
}

function saveWindPreference(unit) {
  try {
    localStorage.setItem(STORAGE_KEYS.WIND_UNIT, unit);
  } catch {}
}

// ─── Application State ────────────────────────────────────────────────
let userProfile       = loadUserProfile();
let favoriteCities    = loadFavorites();
let tempUnit          = loadUnitPreference();
let windSpeedUnit     = loadWindPreference();

let selectedCity      = CITIES[0];
let selectedCityIndex = 0;
let lastFetchedCity   = null;
let latestWeatherData = null;
let requestCount      = 0;
let favoritesOnlyFilter = false;

// ─── DOM References ───────────────────────────────────────────────────
const navBrand            = document.getElementById("nav-brand");
const btnLiveLocation     = document.getElementById("btn-live-location");
const btnQuickDetectLoc   = document.getElementById("btn-quick-detect-loc");
const btnProfile          = document.getElementById("btn-profile");
const userGreetingPill    = document.getElementById("user-greeting-pill");
const userAvatarInitial   = document.getElementById("user-avatar-initial");
const btnToggleUnit       = document.getElementById("btn-toggle-unit");
const currentUnitBadge    = document.getElementById("current-unit-badge");

// Navigation Tabs
const navTabCities        = document.getElementById("nav-tab-cities");
const navTabReport        = document.getElementById("nav-tab-report");
const navTabCompare       = document.getElementById("nav-tab-compare");
const navTabHistory       = document.getElementById("nav-tab-history");
const navTabTravel        = document.getElementById("nav-tab-travel");

const bottomTabCities     = document.getElementById("bottom-tab-cities");
const bottomTabReport     = document.getElementById("bottom-tab-report");
const bottomTabCompare    = document.getElementById("bottom-tab-compare");
const bottomTabHistory    = document.getElementById("bottom-tab-history");
const bottomTabTravel     = document.getElementById("bottom-tab-travel");

// Controls on Cities Screen
const stationSearch       = document.getElementById("station-search");
const searchClearBtn      = document.getElementById("search-clear-btn");
const filterAllCitiesBtn  = document.getElementById("filter-all-cities");
const filterFavCitiesBtn  = document.getElementById("filter-fav-cities");
const btnShowAllStations  = document.getElementById("btn-show-all-stations");
const btnViewWeather      = document.getElementById("btn-view-weather");
const btnHeaderSearch     = document.getElementById("btn-header-search");

// Controls on Report Screen
const btnChangeCity       = document.getElementById("btn-change-city");
const btnRefreshWeather   = document.getElementById("btn-refresh-weather");
const btnEmptySelectCity  = document.getElementById("btn-empty-select-city");
const btnToggleFavCurrent = document.getElementById("btn-toggle-favorite-current");

// Controls on Compare Screen
const btnRefreshCompare   = document.getElementById("btn-refresh-compare");

// Controls on Travel Screen
const travelDestSelect    = document.getElementById("travel-destination-select");
const travelDateInput     = document.getElementById("travel-date-input");
const btnCalculateTravel  = document.getElementById("btn-calculate-travel");

// Modals
const modalOnboarding     = document.getElementById("modal-onboarding");
const inputUserName       = document.getElementById("input-user-name");
const btnSaveOnboarding   = document.getElementById("btn-save-onboarding");
const btnSkipOnboarding   = document.getElementById("btn-skip-onboarding");

const modalProfileSettings= document.getElementById("modal-profile-settings");
const btnCloseProfile     = document.getElementById("btn-close-profile");
const settingsNameInput   = document.getElementById("settings-name-input");
const btnSetCelsius       = document.getElementById("btn-set-celsius");
const btnSetFahrenheit    = document.getElementById("btn-set-fahrenheit");
const btnSetKmh           = document.getElementById("btn-set-kmh");
const btnSetMph           = document.getElementById("btn-set-mph");
const btnSaveSettings     = document.getElementById("btn-save-settings");
const btnResetProfile     = document.getElementById("btn-reset-profile");

// ─── Step 1: User Identity & Profile Updating ─────────────────────────

function applyUserProfile() {
  if (userGreetingPill) {
    userGreetingPill.textContent = userProfile.name || "Guest";
  }
  if (userAvatarInitial) {
    const initial = (userProfile.name && userProfile.name !== "Guest")
      ? userProfile.name.trim().charAt(0).toUpperCase()
      : "U";
    userAvatarInitial.textContent = initial;
  }
  if (currentUnitBadge) {
    currentUnitBadge.textContent = tempUnit === "fahrenheit" ? "°F" : "°C";
  }
}

function checkOnboarding() {
  if (!userProfile.onboarded && modalOnboarding) {
    modalOnboarding.classList.remove("hidden");
    if (inputUserName) inputUserName.focus();
  }
}

if (btnSaveOnboarding) {
  btnSaveOnboarding.addEventListener("click", () => {
    const nameVal = inputUserName?.value?.trim();
    userProfile.name = nameVal || "Guest";
    userProfile.onboarded = true;
    saveUserProfile(userProfile);
    applyUserProfile();
    if (modalOnboarding) modalOnboarding.classList.add("hidden");
  });
}

if (btnSkipOnboarding) {
  btnSkipOnboarding.addEventListener("click", () => {
    userProfile.onboarded = true;
    saveUserProfile(userProfile);
    applyUserProfile();
    if (modalOnboarding) modalOnboarding.classList.add("hidden");
  });
}

function updateSettingsUnitButtons() {
  if (btnSetCelsius && btnSetFahrenheit) {
    if (tempUnit === "fahrenheit") {
      btnSetFahrenheit.className = "py-2 rounded-xl text-xs font-semibold bg-primary text-on-primary shadow-sm";
      btnSetCelsius.className = "py-2 rounded-xl text-xs font-semibold bg-surface-container-low text-tertiary";
    } else {
      btnSetCelsius.className = "py-2 rounded-xl text-xs font-semibold bg-primary text-on-primary shadow-sm";
      btnSetFahrenheit.className = "py-2 rounded-xl text-xs font-semibold bg-surface-container-low text-tertiary";
    }
  }

  if (btnSetKmh && btnSetMph) {
    if (windSpeedUnit === "mph") {
      btnSetMph.className = "py-2 rounded-xl text-xs font-semibold bg-primary text-on-primary shadow-sm";
      btnSetKmh.className = "py-2 rounded-xl text-xs font-semibold bg-surface-container-low text-tertiary";
    } else {
      btnSetKmh.className = "py-2 rounded-xl text-xs font-semibold bg-primary text-on-primary shadow-sm";
      btnSetMph.className = "py-2 rounded-xl text-xs font-semibold bg-surface-container-low text-tertiary";
    }
  }
}

// Profile dialog opening / closing
if (btnProfile && modalProfileSettings) {
  btnProfile.addEventListener("click", () => {
    if (settingsNameInput) settingsNameInput.value = userProfile.name || "";
    updateSettingsUnitButtons();
    modalProfileSettings.classList.remove("hidden");
  });
}

if (btnCloseProfile && modalProfileSettings) {
  btnCloseProfile.addEventListener("click", () => {
    modalProfileSettings.classList.add("hidden");
  });
}

if (btnSetCelsius && btnSetFahrenheit) {
  btnSetCelsius.addEventListener("click", () => {
    tempUnit = "celsius";
    updateSettingsUnitButtons();
  });
  btnSetFahrenheit.addEventListener("click", () => {
    tempUnit = "fahrenheit";
    updateSettingsUnitButtons();
  });
}

if (btnSetKmh && btnSetMph) {
  btnSetKmh.addEventListener("click", () => {
    windSpeedUnit = "km/h";
    updateSettingsUnitButtons();
  });
  btnSetMph.addEventListener("click", () => {
    windSpeedUnit = "mph";
    updateSettingsUnitButtons();
  });
}

if (btnSaveSettings) {
  btnSaveSettings.addEventListener("click", () => {
    const newName = settingsNameInput?.value?.trim();
    if (newName) userProfile.name = newName;
    saveUserProfile(userProfile);
    saveUnitPreference(tempUnit);
    saveWindPreference(windSpeedUnit);
    applyUserProfile();
    if (modalProfileSettings) modalProfileSettings.classList.add("hidden");
    if (latestWeatherData) {
      showWeather(latestWeatherData, tempUnit, favoriteCities.has(latestWeatherData.cityName), windSpeedUnit);
    }
  });
}

if (btnResetProfile) {
  btnResetProfile.addEventListener("click", () => {
    localStorage.clear();
    userProfile = { name: "Guest", onboarded: false };
    favoriteCities = new Set(["Indore", "Mumbai"]);
    tempUnit = "celsius";
    windSpeedUnit = "km/h";
    applyUserProfile();
    if (modalProfileSettings) modalProfileSettings.classList.add("hidden");
    location.reload();
  });
}

// Quick Unit Toggle (°C / °F) in header
if (btnToggleUnit) {
  btnToggleUnit.addEventListener("click", () => {
    tempUnit = tempUnit === "celsius" ? "fahrenheit" : "celsius";
    saveUnitPreference(tempUnit);
    applyUserProfile();
    if (latestWeatherData) {
      showWeather(latestWeatherData, tempUnit, favoriteCities.has(latestWeatherData.cityName), windSpeedUnit);
    }
  });
}

// ─── Step 2: Geolocation Support ──────────────────────────────────────

async function requestUserLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your current browser.");
    return;
  }

  showLoading();
  setActiveScreen("report");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const geoInfo = await reverseGeocode(lat, lon);
        const customLoc = {
          name: geoInfo.cityName,
          lat: lat,
          lon: lon,
          region: geoInfo.regionName,
          isLiveLocation: true,
        };
        selectedCity = customLoc;
        await loadWeatherForCity(customLoc);
      } catch {
        const fallbackLoc = {
          name: `GPS Point (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          lat: lat,
          lon: lon,
          region: "Current Coordinates",
          isLiveLocation: true,
        };
        selectedCity = fallbackLoc;
        await loadWeatherForCity(fallbackLoc);
      }
    },
    (err) => {
      // Graceful fallback to Indore upon permission denial or timeout
      showError(
        `Location access was ${err.code === 1 ? "denied" : "unavailable"}. Displaying telemetry for Indore.`
      );
      selectedCity = CITIES[0];
      setTimeout(() => loadWeatherForCity(selectedCity), 1500);
    },
    { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
  );
}

if (btnLiveLocation) btnLiveLocation.addEventListener("click", requestUserLocation);
if (btnQuickDetectLoc) btnQuickDetectLoc.addEventListener("click", requestUserLocation);

// ─── Step 3: City Cards & Search Filter ────────────────────────────────

function toggleFavoriteCity(cityName) {
  if (favoriteCities.has(cityName)) {
    favoriteCities.delete(cityName);
  } else {
    favoriteCities.add(cityName);
  }
  saveFavorites(favoriteCities);
  updateCityCardsDisplay();
  if (latestWeatherData && latestWeatherData.cityName === cityName) {
    showWeather(latestWeatherData, tempUnit, favoriteCities.has(cityName), windSpeedUnit);
  }
}

function updateCityCardsDisplay() {
  renderCityCards(
    CITIES,
    selectedCityIndex,
    favoriteCities,
    (newIndex) => {
      selectedCityIndex = newIndex;
      selectedCity = CITIES[newIndex];
      updateCityCardsDisplay();
    },
    (cityName) => {
      toggleFavoriteCity(cityName);
    }
  );
  filterCityCards(stationSearch?.value || "", favoritesOnlyFilter, favoriteCities);
}

// Search and filter listeners
if (stationSearch) {
  stationSearch.addEventListener("input", (e) => {
    filterCityCards(e.target.value, favoritesOnlyFilter, favoriteCities);
  });
}

if (searchClearBtn) {
  searchClearBtn.addEventListener("click", () => {
    if (stationSearch) {
      stationSearch.value = "";
      filterCityCards("", favoritesOnlyFilter, favoriteCities);
      stationSearch.focus();
    }
  });
}

if (filterAllCitiesBtn && filterFavCitiesBtn) {
  filterAllCitiesBtn.addEventListener("click", () => {
    favoritesOnlyFilter = false;
    filterAllCitiesBtn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-container-lowest text-on-surface shadow-sm transition-all";
    filterFavCitiesBtn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold text-tertiary hover:text-on-surface transition-all flex items-center gap-1";
    filterCityCards(stationSearch?.value || "", false, favoriteCities);
  });

  filterFavCitiesBtn.addEventListener("click", () => {
    favoritesOnlyFilter = true;
    filterFavCitiesBtn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-container-lowest text-on-surface shadow-sm transition-all flex items-center gap-1";
    filterAllCitiesBtn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold text-tertiary hover:text-on-surface transition-all";
    filterCityCards(stationSearch?.value || "", true, favoriteCities);
  });
}

if (btnShowAllStations) {
  btnShowAllStations.addEventListener("click", () => {
    if (stationSearch) stationSearch.value = "";
    favoritesOnlyFilter = false;
    filterCityCards("", false, favoriteCities);
  });
}

// ─── Step 4: Weather Loading & Race-Condition Safeguard ───────────────

async function loadWeatherForCity(city) {
  requestCount += 1;
  const thisRequest = requestCount;
  lastFetchedCity = city;

  showLoading();

  try {
    const rawData = await fetchWeather(city);

    // Stale response guard
    if (thisRequest !== requestCount) return;

    latestWeatherData = {
      ...rawData,
      cityName: city.name,
      lat: city.lat,
      lon: city.lon,
      isLiveLocation: Boolean(city.isLiveLocation),
    };

    const isFav = favoriteCities.has(city.name);
    showWeather(latestWeatherData, tempUnit, isFav, windSpeedUnit);

    // Synchronize Travel form destination dropdown
    if (travelDestSelect) travelDestSelect.value = city.name;
  } catch (error) {
    if (thisRequest !== requestCount) return;
    showError(error.message);
  }
}

// Favorite button on report screen
if (btnToggleFavCurrent) {
  btnToggleFavCurrent.addEventListener("click", () => {
    if (latestWeatherData?.cityName) {
      toggleFavoriteCity(latestWeatherData.cityName);
    }
  });
}

// ─── Step 5: Screen Navigation Handlers ───────────────────────────────

function setupNav() {
  const switchScreen = (screenKey) => {
    setActiveScreen(screenKey);
    if (screenKey === "report") {
      if (!lastFetchedCity || lastFetchedCity.name !== selectedCity.name) {
        loadWeatherForCity(selectedCity);
      }
    } else if (screenKey === "compare") {
      loadComparisonScreen();
    } else if (screenKey === "history") {
      if (!lastFetchedCity) {
        loadWeatherForCity(selectedCity);
      }
    }
  };

  navTabCities?.addEventListener("click", () => switchScreen("cities"));
  bottomTabCities?.addEventListener("click", () => switchScreen("cities"));
  btnChangeCity?.addEventListener("click", () => switchScreen("cities"));
  btnEmptySelectCity?.addEventListener("click", () => switchScreen("cities"));
  navBrand?.addEventListener("click", () => switchScreen("cities"));

  navTabReport?.addEventListener("click", () => switchScreen("report"));
  bottomTabReport?.addEventListener("click", () => switchScreen("report"));
  btnViewWeather?.addEventListener("click", () => switchScreen("report"));

  navTabCompare?.addEventListener("click", () => switchScreen("compare"));
  bottomTabCompare?.addEventListener("click", () => switchScreen("compare"));

  navTabHistory?.addEventListener("click", () => switchScreen("history"));
  bottomTabHistory?.addEventListener("click", () => switchScreen("history"));

  navTabTravel?.addEventListener("click", () => switchScreen("travel"));
  bottomTabTravel?.addEventListener("click", () => switchScreen("travel"));

  btnRefreshWeather?.addEventListener("click", () => {
    if (lastFetchedCity) loadWeatherForCity(lastFetchedCity);
    else loadWeatherForCity(selectedCity);
  });

  btnHeaderSearch?.addEventListener("click", () => {
    switchScreen("cities");
    if (stationSearch) stationSearch.focus();
  });
}

// ─── Step 6: Multi-City Comparison Telemetry ──────────────────────────

async function loadComparisonScreen() {
  try {
    const results = await Promise.all(
      CITIES.map(async (city) => {
        const weather = await fetchWeather(city);
        return { city, weather };
      })
    );

    renderComparisonCards(results, tempUnit, (cityObj) => {
      selectedCity = cityObj;
      selectedCityIndex = CITIES.findIndex((c) => c.name === cityObj.name);
      setActiveScreen("report");
      loadWeatherForCity(cityObj);
    }, windSpeedUnit);
  } catch (err) {
    showError("Could not complete full comparison refresh: " + err.message);
  }
}

if (btnRefreshCompare) btnRefreshCompare.addEventListener("click", loadComparisonScreen);

// ─── Step 7: Travel Weather Planner Logic ─────────────────────────────

function setupTravelPlanner() {
  if (travelDestSelect) {
    travelDestSelect.innerHTML = "";
    CITIES.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = `${c.name} (${c.region})`;
      travelDestSelect.appendChild(opt);
    });
  }

  // Pre-fill tomorrow as default travel date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().slice(0, 10);
  if (travelDateInput) {
    travelDateInput.value = minDateStr;
    travelDateInput.min = new Date().toISOString().slice(0, 10);
  }

  if (btnCalculateTravel) {
    btnCalculateTravel.addEventListener("click", async () => {
      const cityName = travelDestSelect?.value || CITIES[0].name;
      const targetCity = CITIES.find((c) => c.name === cityName) || CITIES[0];
      const targetDate = travelDateInput?.value;

      if (!targetDate) {
        alert("Please pick a departure date.");
        return;
      }

      try {
        const weather = await fetchWeather(targetCity);
        const dayMatch = weather.forecast?.find((f) => f.date === targetDate);

        if (dayMatch) {
          renderTravelResult({
            available: true,
            city: targetCity,
            date: targetDate,
            dayData: dayMatch,
          }, tempUnit);
        } else {
          renderTravelResult({
            available: false,
            message: `Selected date (${targetDate}) exceeds Open-Meteo's standard 7-day forecast limit. Reliable forecasts cannot be generated past this horizon. Please select a date within the upcoming 7 days.`,
          }, tempUnit);
        }
      } catch (err) {
        renderTravelResult({
          available: false,
          message: `Unable to retrieve forecast telemetry for ${cityName}: ${err.message}`,
        }, tempUnit);
      }
    });
  }
}

// ─── Initialization ───────────────────────────────────────────────────

applyUserProfile();
checkOnboarding();
updateCityCardsDisplay();
setupNav();
setupTravelPlanner();

setRetryHandler(() => {
  if (lastFetchedCity) loadWeatherForCity(lastFetchedCity);
  else loadWeatherForCity(selectedCity);
});

// Start on Cities screen
setActiveScreen("cities");
