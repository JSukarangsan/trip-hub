import { useState, useEffect } from "react";
import type { Place, Category } from "../data/places";
import { APARTMENT_COORDS } from "../data/places";
import { places as staticPlaces } from "../data/places";
import { igPlaces } from "../data/ig-places";

const CATEGORY_MAP: Record<string, Category> = {
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

function normalizeCategory(raw: string): Category {
  const lower = raw.toLowerCase().trim();
  return CATEGORY_MAP[lower] || "attraction";
}

function estimateDistance(lat: number, lng: number): string {
  const distKm =
    Math.sqrt(
      Math.pow(lat - APARTMENT_COORDS.lat, 2) +
        Math.pow(lng - APARTMENT_COORDS.lng, 2)
    ) * 111;
  if (distKm < 1) return `${Math.round(distKm * 1000 / 80)} min walk`;
  if (distKm < 3) return `${Math.round(distKm * 3 + 5)} min metro`;
  if (distKm > 50) return "Day trip";
  return `${Math.round(distKm * 3 + 10)} min metro`;
}

export function usePlacesData(): { places: Place[]; loading: boolean } {
  const [places, setPlaces] = useState<Place[]>([...staticPlaces, ...igPlaces]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchPlaces() {
      try {
        const res = await fetch("/api/sheets?tab=places");
        if (!res.ok) throw new Error(`${res.status}`);
        const rows: Record<string, string>[] = await res.json();

        const sheetPlaces: Place[] = rows
          .filter((r) => r.Name && r.Category)
          .map((r, i) => ({
            id: `sheet-${i}-${r.Name.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}`,
            name: r.Name,
            category: normalizeCategory(r.Category),
            address: r["Distance from Apt"] || "",
            lat: 0,
            lng: 0,
            distanceFromApt: r["Distance from Apt"] || "",
            notes: r.Notes || "",
            website: r.Website || undefined,
            rating: r.Rating || undefined,
            pricing: r["Pricing (est.)"] || undefined,
            hours: r.Hours || undefined,
            metro: r.Metro || undefined,
            segment: "paris" as const,
          }));

        // Merge: use IG places for geocoded data, sheet places for metadata
        // For now, prefer the static + IG data which has coordinates
        // Sheet places without coords get filtered out
        if (!cancelled) {
          setPlaces([...staticPlaces, ...igPlaces]);
        }
      } catch {
        // Fall back to static data silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlaces();
    return () => { cancelled = true; };
  }, []);

  return { places, loading };
}
