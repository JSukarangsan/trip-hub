#!/usr/bin/env node

/**
 * Sync script: pulls Places tab from Google Sheet, geocodes new entries,
 * merges with existing enriched data, writes src/data/sheet-places.json.
 *
 * Usage: node scripts/sync.mjs
 * Env vars: GOOGLE_SHEETS_API_KEY, GOOGLE_MAPS_API_KEY
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../src/data");
const CACHE_FILE = resolve(DATA_DIR, "sheet-places.json");

const SHEET_ID = "1eu_Zo9u5xEPuEs-4sxbaOY45SR49Bq51vnwopNv-UM4";
const SHEETS_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

const APT = { lat: 48.8534, lng: 2.2867 };

const CATEGORY_MAP = {
  gym: "fitness",
  "full club + classes": "fitness",
  "reformer pilates": "fitness",
  "reformer pilates / yoga": "fitness",
  "reformer pilates / yoga / barre": "fitness",
  "pilates / yoga / fitness": "fitness",
  restaurant: "restaurant",
  market: "market",
  "park & garden": "park",
  "museum & culture": "museum",
  "day trip": "daytrip",
  "bakery & cafe": "bakery",
  attraction: "attraction",
  shopping: "shopping",
  lodging: "lodging",
};

function normalizeCategory(raw) {
  return CATEGORY_MAP[raw.toLowerCase().trim()] || "attraction";
}

function estimateDistance(lat, lng) {
  const km = Math.sqrt((lat - APT.lat) ** 2 + (lng - APT.lng) ** 2) * 111;
  if (km < 1) return `${Math.round((km * 1000) / 80)} min walk`;
  if (km < 3) return `${Math.round(km * 3 + 5)} min metro`;
  if (km > 50) return "Day trip";
  return `${Math.round(km * 3 + 10)} min metro`;
}

async function fetchSheet() {
  if (!SHEETS_KEY) throw new Error("GOOGLE_SHEETS_API_KEY not set");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent("Places!A1:K200")}?key=${SHEETS_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const rows = data.values || [];
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i] || ""));
    return obj;
  });
}

async function geocode(query) {
  if (!MAPS_KEY) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query + " Paris, France")}&key=${MAPS_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === "OK" && data.results[0]) {
      const loc = data.results[0].geometry.location;
      const addr = data.results[0].formatted_address;
      return { lat: loc.lat, lng: loc.lng, address: addr };
    }
  } catch {
    // silent
  }
  return null;
}

function loadCache() {
  if (existsSync(CACHE_FILE)) {
    return JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
  }
  return [];
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

async function main() {
  console.log("Fetching Google Sheet...");
  const rows = await fetchSheet();
  console.log(`  ${rows.length} rows from Places tab`);

  const cache = loadCache();
  const cacheByName = new Map(cache.map((p) => [p.name.toLowerCase(), p]));

  const results = [];
  let newCount = 0;
  let geocodedCount = 0;

  for (const row of rows) {
    const name = (row.Name || "").trim();
    if (!name) continue;

    const cached = cacheByName.get(name.toLowerCase());
    if (cached) {
      // Update metadata from sheet but keep geocoded data
      results.push({
        ...cached,
        category: normalizeCategory(row.Category || "attraction"),
        notes: row.Notes || cached.notes,
        website: row.Website || cached.website,
        rating: row.Rating || cached.rating,
        pricing: row["Pricing (est.)"] || cached.pricing,
        hours: row.Hours || cached.hours,
        metro: row.Metro || cached.metro,
      });
      continue;
    }

    // New place — geocode it
    newCount++;
    console.log(`  New: "${name}" — geocoding...`);
    const geo = await geocode(name);

    if (geo) {
      geocodedCount++;
      results.push({
        id: `sheet-${slugify(name)}`,
        name,
        category: normalizeCategory(row.Category || "attraction"),
        address: geo.address,
        lat: geo.lat,
        lng: geo.lng,
        distanceFromApt: row["Distance from Apt"] || estimateDistance(geo.lat, geo.lng),
        notes: row.Notes || "",
        website: row.Website || undefined,
        rating: row.Rating || undefined,
        pricing: row["Pricing (est.)"] || undefined,
        hours: row.Hours || undefined,
        metro: row.Metro || undefined,
        segment: geo.lat > 44 ? "paris" : "provence",
      });
      console.log(`    ✓ ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)} — ${geo.address}`);
    } else {
      console.log(`    ✗ Could not geocode "${name}" — skipping`);
    }

    // Rate limit: 50ms between geocode calls
    if (newCount > 0) await new Promise((r) => setTimeout(r, 50));
  }

  writeFileSync(CACHE_FILE, JSON.stringify(results, null, 2));
  console.log(`\nDone: ${results.length} total, ${newCount} new, ${geocodedCount} geocoded`);
  console.log(`Written to ${CACHE_FILE}`);
}

main().catch((e) => {
  console.error("Sync failed:", e.message);
  process.exit(1);
});
