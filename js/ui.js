/**
 * ui.js — DOM Rendering, Multi-Screen Navigation, and Thematic Cards for ClimaView
 *
 * What this file does:
 *   - Orchestrates multi-screen navigation (Cities, Report, Compare, History, Travel).
 *   - Formats temperatures accurately based on unit preference (°C vs °F).
 *   - Renders responsive hero weather cards, UV badge, and sunrise/sunset solar cycles.
 *   - Populates 24h hourly trends, 7-day forecast grids, 7-day historical observation archives,
 *     and interactive multi-city comparisons.
 *   - Provides user onboarding modal and profile settings dialogs.
 */

// ─── Screen Elements ───────────────────────────────────────────────
const screens = {
  cities:  document.getElementById("screen-cities"),
  report:  document.getElementById("screen-report"),
  compare: document.getElementById("screen-compare"),
  history: document.getElementById("screen-history"),
  travel:  document.getElementById("screen-travel"),
};

// ─── Navigation Buttons ────────────────────────────────────────────
const navButtons = {
  cities:  [document.getElementById("nav-tab-cities"), document.getElementById("bottom-tab-cities")],
  report:  [document.getElementById("nav-tab-report"), document.getElementById("bottom-tab-report")],
  compare: [document.getElementById("nav-tab-compare"), document.getElementById("bottom-tab-compare")],
  history: [document.getElementById("nav-tab-history"), document.getElementById("bottom-tab-history")],
  travel:  [document.getElementById("nav-tab-travel"), document.getElementById("bottom-tab-travel")],
};

// ─── Weather Report Elements ───────────────────────────────────────
const loadingIndicator    = document.getElementById("loading-indicator");
const errorPanel          = document.getElementById("weather-error");
const errorMessage        = document.getElementById("error-message");
const retryButton         = document.getElementById("retry-button");
const emptyState          = document.getElementById("empty-state");
const currentWeather      = document.getElementById("current-weather");
const statusMessage       = document.getElementById("status-message");

const weatherIcon         = document.getElementById("weather-icon");
const temperatureEl       = document.getElementById("temperature");
const tempUnitSymbol      = document.getElementById("temp-unit-symbol");
const conditionEl         = document.getElementById("weather-description");
const humidityEl          = document.getElementById("humidity");
const windSpeedEl         = document.getElementById("wind-speed");
const cityNameEl          = document.getElementById("city-name");
const cityCoordsText      = document.getElementById("city-coords-text");
const feelsLikeTempEl     = document.getElementById("feels-like-temp");
const windCardinalEl      = document.getElementById("wind-direction-cardinal");
const windDegreesEl       = document.getElementById("wind-direction-degrees");
const tempHighLowEl       = document.getElementById("temp-high-low");
const weatherSynopsisEl   = document.getElementById("weather-synopsis");
const uvIndexValEl        = document.getElementById("uv-index-val");
const uvIndexBadgeEl      = document.getElementById("uv-index-badge");
const solarSunriseEl      = document.getElementById("solar-sunrise");
const solarSunsetEl       = document.getElementById("solar-sunset");
const reportTimestampEl   = document.getElementById("report-timestamp");
const hourlyForecastList  = document.getElementById("hourly-forecast-list");
const dailyForecastList   = document.getElementById("daily-forecast-list");
const historyRecordsList  = document.getElementById("history-records-list");
const historyStationLabel = document.getElementById("history-station-label");
const compareGridContainer= document.getElementById("compare-grid-container");
const summaryStationName  = document.getElementById("summary-station-name");
const iconFavCurrent      = document.getElementById("icon-fav-current");
const locationSourceBadge = document.getElementById("location-source-badge");

// ─── Helpers: Temperature & Wind Conversions ───────────────────────

/**
 * Converts Celsius to user's preferred unit (°C or °F).
 * @param {number} c
 * @param {"celsius"|"fahrenheit"} unit
 * @returns {number}
 */
export function formatTemp(c, unit = "celsius") {
  if (typeof c !== "number" || !Number.isFinite(c)) return 0;
  if (unit === "fahrenheit") {
    return Math.round((c * 9) / 5 + 32);
  }
  return Math.round(c);
}

/**
 * Converts wind speed (km/h) to user's preferred unit ("km/h" or "mph").
 * @param {number} speedKmh
 * @param {"km/h"|"mph"} unit
 * @returns {string}
 */
export function formatWind(speedKmh, unit = "km/h") {
  if (typeof speedKmh !== "number" || !Number.isFinite(speedKmh)) return `0 ${unit}`;
  if (unit === "mph") {
    return `${Math.round(speedKmh * 0.621371)} mph`;
  }
  return `${Math.round(speedKmh)} km/h`;
}

/**
 * Returns cardinal compass direction string.
 * @param {number} deg
 * @returns {string}
 */
function degreesToCardinal(deg) {
  if (typeof deg !== "number") return "—";
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const val = Math.floor((deg / 22.5) + 0.5);
  return cardinals[val % 16];
}

/**
 * Categorizes UV index into human-understandable safety level.
 * @param {number} uv
 * @returns {{ label: string, color: string }}
 */
function getUvCategory(uv) {
  if (uv <= 2) return { label: "Low", color: "bg-emerald-100 text-emerald-800" };
  if (uv <= 5) return { label: "Moderate", color: "bg-amber-100 text-amber-800" };
  if (uv <= 7) return { label: "High", color: "bg-orange-100 text-orange-800" };
  if (uv <= 10) return { label: "Very High", color: "bg-red-100 text-red-800" };
  return { label: "Extreme", color: "bg-purple-100 text-purple-800" };
}

// ─── Multi-Screen Switching ────────────────────────────────────────

/**
 * Switches the active screen view.
 * @param {"cities"|"report"|"compare"|"history"|"travel"} screenKey
 */
export function setActiveScreen(screenKey) {
  // Toggle screen containers
  Object.keys(screens).forEach((key) => {
    const el = screens[key];
    if (!el) return;
    if (key === screenKey) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });

  // Update navigation button active styles
  Object.keys(navButtons).forEach((key) => {
    const [topBtn, bottomBtn] = navButtons[key] || [];
    const isActive = key === screenKey;

    if (topBtn) {
      if (isActive) {
        topBtn.className = "px-3.5 py-1.5 rounded-full transition-all duration-300 min-h-[32px] flex items-center justify-center bg-surface-container-lowest text-on-surface shadow-[0_2px_8px_rgba(36,56,75,0.06)] font-medium text-body-sm";
        topBtn.setAttribute("aria-current", "page");
      } else {
        topBtn.className = "px-3.5 py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant transition-all duration-300 min-h-[32px] flex items-center justify-center hover:text-on-surface text-body-sm";
        topBtn.removeAttribute("aria-current");
      }
    }

    if (bottomBtn) {
      if (isActive) {
        bottomBtn.className = "flex flex-col items-center justify-center px-2 text-primary font-medium";
        bottomBtn.setAttribute("aria-current", "page");
      } else {
        bottomBtn.className = "flex flex-col items-center justify-center px-2 text-on-surface-variant hover:text-on-surface";
        bottomBtn.removeAttribute("aria-current");
      }
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── Weather Data State Renderers ──────────────────────────────────

function hideReportPanels() {
  if (loadingIndicator) loadingIndicator.classList.add("hidden");
  if (errorPanel) errorPanel.classList.add("hidden");
  if (emptyState) emptyState.classList.add("hidden");
  if (currentWeather) currentWeather.classList.add("hidden");
}

export function showLoading() {
  hideReportPanels();
  if (loadingIndicator) loadingIndicator.classList.remove("hidden");
  if (statusMessage) statusMessage.textContent = "Fetching real-time atmospheric telemetry…";
}

export function showError(msg) {
  hideReportPanels();
  if (statusMessage) statusMessage.textContent = "";
  if (errorMessage) errorMessage.textContent = msg;
  if (errorPanel) errorPanel.classList.remove("hidden");
}

export function showEmpty() {
  hideReportPanels();
  if (statusMessage) statusMessage.textContent = "";
  if (emptyState) emptyState.classList.remove("hidden");
}

/**
 * Renders full weather telemetry with unit conversions and data cards.
 * @param {Object} data
 * @param {"celsius"|"fahrenheit"} unit
 * @param {boolean} isFavorite
 * @param {"km/h"|"mph"} windUnit
 */
export function showWeather(data, unit = "celsius", isFavorite = false, windUnit = "km/h") {
  hideReportPanels();
  if (statusMessage) statusMessage.textContent = "";

  const unitSymbol = unit === "fahrenheit" ? "°F" : "°C";

  // Core Hero Readings
  if (weatherIcon) weatherIcon.textContent = data.conditionIcon || "☀️";
  if (temperatureEl) temperatureEl.textContent = String(formatTemp(data.temperature, unit));
  if (tempUnitSymbol) tempUnitSymbol.textContent = unitSymbol;
  if (conditionEl) conditionEl.textContent = data.conditionLabel || "Clear sky";
  if (humidityEl) humidityEl.textContent = `${Math.round(data.humidity)}%`;
  if (windSpeedEl) windSpeedEl.textContent = formatWind(data.windSpeed, windUnit);

  // Place identification
  if (cityNameEl) cityNameEl.textContent = data.cityName || "Observed Station";
  if (cityCoordsText) {
    cityCoordsText.textContent = `Coordinates: ${data.lat.toFixed(4)}° N, ${data.lon.toFixed(4)}° E ${data.isLiveLocation ? "• (GPS Position)" : ""}`;
  }
  if (locationSourceBadge) {
    locationSourceBadge.textContent = data.isLiveLocation ? "GPS Geolocation" : "Accredited Station";
  }

  // Favorite star icon update
  if (iconFavCurrent) {
    iconFavCurrent.textContent = isFavorite ? "star" : "star_border";
    iconFavCurrent.className = `material-symbols-outlined text-[20px] ${isFavorite ? "text-amber-500" : "text-tertiary"}`;
  }

  // Apparent Temperature
  if (feelsLikeTempEl) {
    feelsLikeTempEl.textContent = `${formatTemp(data.apparentTemperature, unit)}${unitSymbol}`;
  }

  // Wind Azimuth
  if (windCardinalEl) windCardinalEl.textContent = degreesToCardinal(data.windDirection);
  if (windDegreesEl) windDegreesEl.textContent = `${Math.round(data.windDirection)}°`;

  // UV Index
  if (uvIndexValEl) uvIndexValEl.textContent = String(data.uvIndex);
  if (uvIndexBadgeEl) {
    const uvCat = getUvCategory(data.uvIndex);
    uvIndexBadgeEl.textContent = uvCat.label;
    uvIndexBadgeEl.className = `font-label-sm text-xs px-2 py-0.5 rounded-full font-medium ${uvCat.color}`;
  }

  // Solar Cycle (Sunrise / Sunset)
  if (solarSunriseEl && data.todayDaily?.sunrise) {
    solarSunriseEl.textContent = data.todayDaily.sunrise.slice(11, 16);
  }
  if (solarSunsetEl && data.todayDaily?.sunset) {
    solarSunsetEl.textContent = data.todayDaily.sunset.slice(11, 16);
  }

  // High/Low Temperature Header Summary
  if (tempHighLowEl && data.forecast?.[0]) {
    const f0 = data.forecast[0];
    tempHighLowEl.textContent = `High ${formatTemp(f0.maxTemp, unit)}${unitSymbol} • Low ${formatTemp(f0.minTemp, unit)}${unitSymbol}`;
  }

  // Intelligent Meteorological Synopsis
  if (weatherSynopsisEl) {
    const diff = Math.abs(data.temperature - data.apparentTemperature);
    const feelNote = diff >= 2 ? ` Humidity offset creates an apparent feel difference of ${Math.round(diff)}°.` : " Humidity index is comfortable.";
    const windNote = data.windSpeed >= 20 ? " Moderate winds detected at elevation." : " Calm surface breezes.";
    weatherSynopsisEl.textContent = `Live atmospheric telemetry indicates ${data.conditionLabel.toLowerCase()} with surface air at ${formatTemp(data.temperature, unit)}${unitSymbol}.${feelNote}${windNote} Relative humidity recorded at ${Math.round(data.humidity)}%.`;
  }

  // Timestamp
  if (reportTimestampEl) {
    reportTimestampEl.textContent = `Updated ${data.lastUpdated}`;
  }

  // ── Render 24-Hour Hourly Timeline ─────────────────────────────────
  if (hourlyForecastList && Array.isArray(data.hourly) && data.hourly.length > 0) {
    hourlyForecastList.innerHTML = "";
    data.hourly.forEach((hour, i) => {
      const timeLabel = i === 0 ? "Now" : hour.time.slice(11, 16);
      const card = document.createElement("div");
      card.className = `min-w-[80px] ${i === 0 ? "bg-surface-container-lowest" : "bg-surface-container-low"} rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center shadow-sm border border-surface-container-high/60 flex-shrink-0`;
      card.innerHTML = `
        <span class="font-label-sm text-xs text-tertiary font-medium">${timeLabel}</span>
        <span class="text-[22px] leading-none select-none">${hour.conditionIcon}</span>
        <span class="font-headline-sm text-base text-on-surface font-semibold">${formatTemp(hour.temperature, unit)}°</span>
        <span class="text-[10px] text-primary font-medium">${hour.precipProb}% rain</span>
      `;
      hourlyForecastList.appendChild(card);
    });
  }

  // ── Render 7-Day Synoptic Outlook ──────────────────────────────────
  if (dailyForecastList && Array.isArray(data.forecast) && data.forecast.length > 0) {
    dailyForecastList.innerHTML = "";
    data.forecast.forEach((day, idx) => {
      let dayName = "Today";
      if (idx > 0) {
        const d = new Date(day.date + "T00:00:00");
        dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      }

      const row = document.createElement("div");
      row.className = "flex items-center justify-between text-body-sm py-2 px-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-sm";
      row.innerHTML = `
        <span class="w-14 text-on-surface font-semibold text-xs">${dayName}</span>
        <div class="flex items-center gap-1.5 flex-1 pl-2">
          <span class="text-[18px] leading-none select-none">${day.conditionIcon}</span>
          <span class="text-tertiary text-xs truncate max-w-[110px]">${day.conditionLabel}</span>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0 text-xs">
          <span class="text-tertiary text-right w-7">${formatTemp(day.minTemp, unit)}°</span>
          <div class="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden relative">
            <div class="h-full bg-primary-container rounded-full" style="width: 75%"></div>
          </div>
          <span class="text-on-surface w-7 text-right font-bold">${formatTemp(day.maxTemp, unit)}°</span>
        </div>
      `;
      dailyForecastList.appendChild(row);
    });
  }

  // ── Render 7-Day Historical Records Screen ─────────────────────────
  if (historyRecordsList && Array.isArray(data.history)) {
    if (historyStationLabel) historyStationLabel.textContent = data.cityName;
    historyRecordsList.innerHTML = "";
    data.history.forEach((rec) => {
      const d = new Date(rec.date + "T00:00:00");
      const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });

      const item = document.createElement("div");
      item.className = "flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 text-body-sm";
      item.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="text-[20px] select-none">${rec.conditionIcon}</span>
          <div>
            <p class="font-semibold text-xs text-on-surface">${dateFormatted}</p>
            <p class="text-[11px] text-tertiary">${rec.conditionLabel}</p>
          </div>
        </div>
        <div class="flex items-center gap-4 text-xs">
          <div class="text-right">
            <p class="font-bold text-on-surface">${formatTemp(rec.maxTemp, unit)}${unitSymbol} / <span class="font-normal text-tertiary">${formatTemp(rec.minTemp, unit)}${unitSymbol}</span></p>
            <p class="text-[10px] text-tertiary">Mean: ${formatTemp(rec.meanTemp, unit)}${unitSymbol}</p>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${rec.precipSum > 0 ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-tertiary"}">
            ${rec.precipSum} mm
          </span>
        </div>
      `;
      historyRecordsList.appendChild(item);
    });
  }

  if (currentWeather) currentWeather.classList.remove("hidden");
}

// ─── City Cards Renderer (Screen 1) ────────────────────────────────

/**
 * Renders the city cards grid with search & favorite toggles.
 * @param {Array<Object>} cities
 * @param {number} selectedIndex
 * @param {Set<string>} favoriteSet
 * @param {Function} onSelectCity
 * @param {Function} onToggleFav
 */
export function renderCityCards(cities, selectedIndex, favoriteSet, onSelectCity, onToggleFav) {
  const container = document.getElementById("city-cards-container");
  if (!container) return;

  container.innerHTML = "";

  cities.forEach((city, index) => {
    const isSelected = index === selectedIndex;
    const isFav = favoriteSet.has(city.name);

    const card = document.createElement("div");
    card.setAttribute("role", "radio");
    card.setAttribute("aria-checked", isSelected ? "true" : "false");
    card.setAttribute("tabindex", "0");
    card.setAttribute("data-city-name", city.name);
    card.className = `city-card group relative w-full p-4 sm:p-5 rounded-2xl ${
      isSelected
        ? "bg-surface-container-lowest shadow-md border-2 border-primary/40"
        : "bg-surface-container-low hover:bg-surface-container-lowest shadow-sm border border-surface-container-high/60"
    } cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 flex flex-col justify-between`;

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="radio-indicator w-6 h-6 rounded-full ${
            isSelected ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface"
          } flex items-center justify-center shadow-sm flex-shrink-0 transition-colors">
            <span class="material-symbols-outlined text-[14px] ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-40"}">check</span>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-headline-sm text-base sm:text-lg text-on-surface font-medium truncate">${city.name}</span>
              ${isSelected ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-tertiary-fixed text-on-tertiary-fixed">Active</span>' : ""}
            </div>
            <p class="font-body-sm text-xs text-on-surface-variant truncate">Observatory Node • ${city.lat.toFixed(2)}° N, ${city.lon.toFixed(2)}° E</p>
          </div>
        </div>
        <button class="btn-fav-card w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-tertiary transition-colors flex-shrink-0" title="Favorite City" type="button">
          <span class="material-symbols-outlined text-[20px] ${isFav ? "text-amber-500" : "text-tertiary"}">${isFav ? "star" : "star_border"}</span>
        </button>
      </div>

      <div class="mt-4 pt-3 border-t border-surface-container-high/40 flex items-center justify-between text-xs">
        <span class="px-2.5 py-1 rounded-full ${isSelected ? "bg-secondary-container text-on-secondary-container font-medium" : "bg-surface-container text-on-surface-variant"}">${city.region || "Inland Hub"}</span>
        <span class="text-tertiary font-medium">15m Refresh</span>
      </div>
    `;

    // Click on card selects city
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-fav-card")) return;
      onSelectCity(index);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectCity(index);
      }
    });

    // Favorite toggle button inside card
    const favBtn = card.querySelector(".btn-fav-card");
    if (favBtn) {
      favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        onToggleFav(city.name);
      });
    }

    container.appendChild(card);
  });

  if (summaryStationName && cities[selectedIndex]) {
    summaryStationName.textContent = `${cities[selectedIndex].name} (${cities[selectedIndex].region || "Inland"})`;
  }
}

/**
 * Filter city cards in search.
 * @param {string} query
 * @param {boolean} favoritesOnly
 * @param {Set<string>} favoriteSet
 */
export function filterCityCards(query, favoritesOnly = false, favoriteSet = new Set()) {
  const term = query.toLowerCase().trim();
  const cards = document.querySelectorAll(".city-card");
  const clearBtn = document.getElementById("search-clear-btn");
  const emptySearch = document.getElementById("empty-search-state");

  if (clearBtn) {
    if (term.length > 0) clearBtn.classList.remove("hidden");
    else clearBtn.classList.add("hidden");
  }

  let visibleCount = 0;
  cards.forEach((card) => {
    const cityName = card.getAttribute("data-city-name") || "";
    const text = card.textContent.toLowerCase();
    const matchesSearch = text.includes(term);
    const matchesFav = !favoritesOnly || favoriteSet.has(cityName);

    if (matchesSearch && matchesFav) {
      card.classList.remove("hidden");
      visibleCount++;
    } else {
      card.classList.add("hidden");
    }
  });

  if (emptySearch) {
    if (visibleCount === 0) {
      emptySearch.classList.remove("hidden");
      emptySearch.classList.add("flex");
    } else {
      emptySearch.classList.add("hidden");
      emptySearch.classList.remove("flex");
    }
  }
}

// ─── Multi-City Comparison Renderer (Screen 3) ─────────────────────

/**
 * Renders comparative analytics cards across all 6 stations.
 * @param {Array<{ city: Object, weather: Object }>} compareData
 * @param {"celsius"|"fahrenheit"} unit
 * @param {Function} onSelectCity
 * @param {"km/h"|"mph"} windUnit
 */
export function renderComparisonCards(compareData, unit = "celsius", onSelectCity, windUnit = "km/h") {
  if (!compareGridContainer) return;
  compareGridContainer.innerHTML = "";
  const unitSymbol = unit === "fahrenheit" ? "°F" : "°C";

  compareData.forEach(({ city, weather }) => {
    const card = document.createElement("div");
    card.className = "p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container-lowest border border-surface-container-high/60 shadow-sm transition-all flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <div>
            <h3 class="font-headline-sm text-lg text-on-surface font-semibold">${city.name}</h3>
            <span class="text-xs text-tertiary">${city.region}</span>
          </div>
          <span class="text-3xl leading-none select-none">${weather.conditionIcon}</span>
        </div>

        <div class="my-3 flex items-baseline gap-1">
          <span class="text-4xl font-light text-on-surface">${formatTemp(weather.temperature, unit)}</span>
          <span class="text-primary font-bold text-sm">${unitSymbol}</span>
          <span class="text-xs text-tertiary ml-2">Feels ${formatTemp(weather.apparentTemperature, unit)}°</span>
        </div>

        <p class="text-xs text-on-surface font-medium capitalize mb-3">${weather.conditionLabel}</p>

        <div class="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-surface-container-high/40">
          <div>
            <span class="text-tertiary block text-[10px] uppercase">Humidity</span>
            <span class="font-semibold text-on-surface">${Math.round(weather.humidity)}%</span>
          </div>
          <div>
            <span class="text-tertiary block text-[10px] uppercase">Wind</span>
            <span class="font-semibold text-on-surface">${formatWind(weather.windSpeed, windUnit)}</span>
          </div>
          <div>
            <span class="text-tertiary block text-[10px] uppercase">UV Index</span>
            <span class="font-semibold text-on-surface">${weather.uvIndex}</span>
          </div>
          <div>
            <span class="text-tertiary block text-[10px] uppercase">Direction</span>
            <span class="font-semibold text-on-surface">${degreesToCardinal(weather.windDirection)}</span>
          </div>
        </div>
      </div>

      <button class="btn-inspect-station mt-4 w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs transition-colors flex items-center justify-center gap-1" type="button">
        <span>Inspect Detailed Telemetry</span>
        <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    `;

    const btn = card.querySelector(".btn-inspect-station");
    if (btn) btn.addEventListener("click", () => onSelectCity(city));

    compareGridContainer.appendChild(card);
  });
}

// ─── Travel Weather Planner Result (Screen 5) ──────────────────────

/**
 * Displays the verified travel analysis outcome.
 * @param {Object} analysis
 * @param {"celsius"|"fahrenheit"} unit
 */
export function renderTravelResult(analysis, unit = "celsius") {
  const container = document.getElementById("travel-result-card");
  if (!container) return;
  const unitSymbol = unit === "fahrenheit" ? "°F" : "°C";

  container.classList.remove("hidden");

  if (!analysis.available) {
    container.innerHTML = `
      <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
        <div class="flex items-center gap-2 mb-1">
          <span class="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
          <strong class="font-semibold">Beyond Forecast Horizon:</strong>
        </div>
        <p>${analysis.message}</p>
      </div>
    `;
    return;
  }

  const { city, date, dayData } = analysis;
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-surface-container-high/60">
      <div>
        <span class="text-xs uppercase font-semibold text-tertiary tracking-wider">Travel Telemetry Assessment</span>
        <h3 class="font-headline-sm text-xl text-on-surface font-semibold">${city.name} on ${new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</h3>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-4xl select-none">${dayData.conditionIcon}</span>
        <div class="text-right">
          <p class="text-2xl font-bold text-on-surface">${formatTemp(dayData.maxTemp, unit)}${unitSymbol}</p>
          <p class="text-xs text-tertiary">Low ${formatTemp(dayData.minTemp, unit)}${unitSymbol}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
      <div class="p-3 rounded-xl bg-surface-container-low">
        <span class="text-tertiary block mb-0.5 font-medium">Condition</span>
        <span class="font-semibold text-on-surface text-sm">${dayData.conditionLabel}</span>
      </div>
      <div class="p-3 rounded-xl bg-surface-container-low">
        <span class="text-tertiary block mb-0.5 font-medium">Precipitation</span>
        <span class="font-semibold text-on-surface text-sm">${dayData.precipSum} mm</span>
      </div>
      <div class="p-3 rounded-xl bg-surface-container-low">
        <span class="text-tertiary block mb-0.5 font-medium">Max UV Radiation</span>
        <span class="font-semibold text-on-surface text-sm">${dayData.uvMax}</span>
      </div>
      <div class="p-3 rounded-xl bg-surface-container-low">
        <span class="text-tertiary block mb-0.5 font-medium">Sunrise / Sunset</span>
        <span class="font-semibold text-on-surface text-sm">${dayData.sunrise ? dayData.sunrise.slice(11, 16) : "—"} / ${dayData.sunset ? dayData.sunset.slice(11, 16) : "—"}</span>
      </div>
    </div>

    <div class="p-3.5 rounded-xl bg-surface-container text-xs text-on-surface leading-relaxed">
      <strong>Travel Advisory:</strong> ${dayData.precipSum > 5 ? "Rain gear recommended for outdoor activities." : dayData.maxTemp > 32 ? "Expect hot conditions; prioritize hydration and solar protection." : "Mild weather favorable for commuting and outdoor excursions."}
    </div>
  `;
}

// ─── Retry Handler Attachment ──────────────────────────────────────
export function setRetryHandler(fn) {
  if (retryButton) retryButton.addEventListener("click", fn);
}
