/**
 * cities.js — Supported Cities and their Geographic Coordinates
 *
 * What this file does:
 *   Exports a single array called CITIES.
 *   Each item in the array is an object describing one city:
 *     - name: the display name shown in the dropdown
 *     - lat:  latitude  (how far north or south the city is)
 *     - lon:  longitude (how far east or west the city is)
 *
 * Why a separate file?
 *   Keeping this data separate from the app logic means you can
 *   add, remove, or rename cities without touching any other code.
 *
 * Source: TKD.md Section 5 — City Coordinate Data
 *
 * ⚠️ Assumption: coordinates are standard reference values.
 *    Verify against a reliable source (e.g. Google Maps) before
 *    publishing. See TKD.md for details.
 *
 * Note: All weather values MUST come from the Open-Meteo API
 * response at runtime. No temperature, humidity, or condition
 * data should ever be stored here.
 */

// "export const" makes CITIES available to other JS files via import.
// A JavaScript array uses square brackets [].
// Each city is an object in curly braces {}.
export const CITIES = [
  { name: "Indore",    lat: 22.7196, lon: 75.8577, region: "Malwa Plateau" },
  { name: "Bhopal",    lat: 23.2599, lon: 77.4126, region: "Central Lakes" },
  { name: "Mumbai",    lat: 19.0760, lon: 72.8777, region: "Konkan Coast" },
  { name: "New Delhi", lat: 28.6139, lon: 77.2090, region: "Northern Plains" },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, region: "Deccan Plateau" },
  { name: "Chennai",   lat: 13.0827, lon: 80.2707, region: "Coromandel Coast" },
];
