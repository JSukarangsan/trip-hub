import { useState, useMemo, useCallback, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  places as basePlaces,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  APARTMENT_COORDS,
  type Place,
  type Category,
} from "./data/places";
import { igPlaces } from "./data/ig-places";
import sheetPlacesRaw from "./data/sheet-places.json";
import { itinerary, segmentColor, isToday } from "./data/itinerary";
import "./App.css";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || "";

const sheetPlaces: Place[] = (sheetPlacesRaw as Place[]).filter(
  (sp) => sp.lat && sp.lng
);

// Merge: static + IG + sheet, deduplicate by name
const seenNames = new Set<string>();
const allPlaces: Place[] = [];
for (const list of [basePlaces, igPlaces, sheetPlaces]) {
  for (const p of list) {
    const key = p.name.toLowerCase();
    if (!seenNames.has(key)) {
      seenNames.add(key);
      allPlaces.push(p);
    }
  }
}

type DistanceFilter = "all" | "walk" | "nearby" | "metro" | "daytrip";

const DISTANCE_OPTIONS: { value: DistanceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "walk", label: "Walking" },
  { value: "nearby", label: "Nearby" },
  { value: "metro", label: "Metro" },
  { value: "daytrip", label: "Day trip" },
];

function classifyDistance(d: string): DistanceFilter {
  const lower = d.toLowerCase();
  if (lower.includes("home") || lower.includes("0 min")) return "walk";
  if (lower.includes("walk") && !lower.includes("20") && !lower.includes("25") && !lower.includes("28") && !lower.includes("30"))
    return "walk";
  if (lower.includes("walk")) return "nearby";
  if (lower.includes("provence")) return "daytrip";
  if (lower.includes("rer") || lower.includes("train") || lower.includes("45") || lower.includes("60") || lower.includes("75"))
    return "daytrip";
  if (lower.includes("metro") || lower.includes("min")) return "metro";
  return "metro";
}

function getDaysUntilTrip(): number {
  const departure = new Date(2026, 6, 17); // July 17, 2026
  const now = new Date();
  return Math.ceil((departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function useZoom() {
  const map = useMap();
  const [zoom, setZoom] = useState(13);
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("zoom_changed", () => {
      setZoom(map.getZoom() ?? 13);
    });
    setZoom(map.getZoom() ?? 13);
    return () => listener.remove();
  }, [map]);
  return zoom;
}

function MapPanHandler({ selectedId, places }: { selectedId: string | null; places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !selectedId) return;
    const place = places.find((p) => p.id === selectedId);
    if (!place) return;
    map.panTo({ lat: place.lat, lng: place.lng });
    const zoom = map.getZoom() ?? 13;
    if (zoom < 15) map.setZoom(15);
  }, [map, selectedId, places]);
  return null;
}

function pinSize(zoom: number, isSelected: boolean): number {
  let base: number;
  if (zoom <= 11) base = 10;
  else if (zoom <= 12) base = 14;
  else if (zoom <= 14) base = 20;
  else base = 24;
  return isSelected ? base + 8 : base;
}

function MyLocationButton() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const controls = map.controls[google.maps.ControlPosition.RIGHT_BOTTOM];
    // Prevent duplicates on hot reload
    if (controls.getLength() > 0) return;

    const btn = document.createElement("button");
    btn.title = "My location";
    btn.style.cssText =
      "background:#fff;border:none;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,.3);width:40px;height:40px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin:0 10px 10px 0;";
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>`;
    btn.addEventListener("mouseover", () => (btn.style.background = "#f5f5f5"));
    btn.addEventListener("mouseout", () => (btn.style.background = "#fff"));
    btn.addEventListener("click", () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          map.setZoom(15);
        },
        () => alert("Could not get your location"),
        { enableHighAccuracy: true }
      );
    });
    controls.push(btn);
  }, [map]);

  return null;
}

function ArrondissementLayer({ visible }: { visible: boolean }) {
  const map = useMap();
  const zoom = useZoom();
  const [labels, setLabels] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Load/unload GeoJSON and labels
  useEffect(() => {
    if (!map) return;

    labels.forEach((l) => (l.map = null));
    setLabels([]);
    map.data.forEach((f) => map.data.remove(f));
    google.maps.event.clearListeners(map.data, "mouseover");
    google.maps.event.clearListeners(map.data, "mouseout");

    if (!visible) return;

    const newLabels: google.maps.marker.AdvancedMarkerElement[] = [];

    map.data.loadGeoJson("/paris-arrondissements.geojson", undefined, (features) => {
      features.forEach((feature) => {
        const id = feature.getProperty("cartodb_id") as number;
        const name = feature.getProperty("name") as string;
        const geo = feature.getGeometry();
        if (!geo) return;

        let latSum = 0, lngSum = 0, count = 0;
        geo.forEachLatLng((ll) => { latSum += ll.lat(); lngSum += ll.lng(); count++; });
        const center = { lat: latSum / count, lng: lngSum / count };

        const el = document.createElement("div");
        el.className = "arr-label";
        el.innerHTML = `<span class="arr-num">${id}e</span><span class="arr-name">${name}</span>`;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: center,
          map,
          content: el,
          zIndex: 0,
        });
        newLabels.push(marker);
      });
      setLabels(newLabels);
    });

    map.data.setStyle({
      fillColor: "#1e3a5f",
      fillOpacity: 0.04,
      strokeColor: "#1e3a5f",
      strokeWeight: 1.5,
      strokeOpacity: 0.5,
    });

    map.data.addListener("mouseover", (e: google.maps.Data.MouseEvent) => {
      map.data.overrideStyle(e.feature, {
        fillColor: "#c4a35a",
        fillOpacity: 0.2,
        strokeColor: "#c4a35a",
        strokeWeight: 3,
        strokeOpacity: 0.9,
      });
    });
    map.data.addListener("mouseout", (e: google.maps.Data.MouseEvent) => {
      map.data.revertStyle(e.feature);
    });

    return () => {
      newLabels.forEach((l) => (l.map = null));
      map.data.forEach((f) => map.data.remove(f));
      google.maps.event.clearListeners(map.data, "mouseover");
      google.maps.event.clearListeners(map.data, "mouseout");
    };
  }, [map, visible]);

  // Show/hide labels based on zoom
  useEffect(() => {
    const showLabels = zoom >= 13;
    labels.forEach((l) => {
      if (l.content instanceof HTMLElement) {
        l.content.style.display = showLabels ? "" : "none";
      }
    });
  }, [zoom, labels]);

  return null;
}

function TransitLayer({ visible }: { visible: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const transitLayer = new google.maps.TransitLayer();
    if (visible) {
      transitLayer.setMap(map);
    }
    return () => transitLayer.setMap(null);
  }, [map, visible]);
  return null;
}

interface PlaceDetails {
  photoUrls: string[];
  website: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  openNow: boolean | null;
  hoursText: string | null;
  rating: number | null;
}

const EMPTY_DETAILS: PlaceDetails = {
  photoUrls: [], website: null, address: null,
  googleMapsUrl: null, openNow: null, hoursText: null, rating: null,
};

function usePlaceDetails(place: Place | undefined) {
  const [details, setDetails] = useState<PlaceDetails>(EMPTY_DETAILS);

  useEffect(() => {
    if (!place) {
      setDetails(EMPTY_DETAILS);
      return;
    }
    setDetails(EMPTY_DETAILS);

    async function fetchDetails() {
      try {
        await google.maps.importLibrary("places");
        const request = {
          textQuery: place!.name,
          fields: [
            "photos", "websiteURI", "formattedAddress", "googleMapsURI",
            "regularOpeningHours", "rating",
          ],
          locationBias: {
            center: { lat: place!.lat, lng: place!.lng },
            radius: 500,
          },
          maxResultCount: 1,
        };
        const { places: results } = await google.maps.places.Place.searchByText(request);
        const p = results?.[0];
        if (!p) return;

        const hours = p.regularOpeningHours;
        let openNow: boolean | null = null;
        let hoursText: string | null = null;
        if (hours) {
          openNow = hours.periods ? isOpenNow(hours.periods as any) : null;
          hoursText = hours.weekdayDescriptions?.join(" | ") ?? null;
        }

        const photoUrls = (p.photos ?? [])
          .slice(0, 4)
          .map((photo: any) => photo.getURI?.({ maxWidth: 400, maxHeight: 200 }))
          .filter(Boolean) as string[];

        setDetails({
          photoUrls,
          website: p.websiteURI ?? null,
          address: p.formattedAddress ?? null,
          googleMapsUrl: p.googleMapsURI ?? null,
          openNow,
          hoursText,
          rating: p.rating ?? null,
        });
      } catch (e) {
        console.log("Places detail error:", place!.name, e);
      }
    }
    fetchDetails();
  }, [place?.id]);

  return details;
}

function isOpenNow(periods: Array<{ open: { hour: number; minute: number; day: number }; close?: { hour: number; minute: number; day: number } }>): boolean {
  const paris = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  const day = paris.getDay();
  const mins = paris.getHours() * 60 + paris.getMinutes();
  for (const period of periods) {
    if (period.open.day === day) {
      const openMins = period.open.hour * 60 + period.open.minute;
      const closeMins = period.close
        ? period.close.hour * 60 + period.close.minute
        : 24 * 60;
      if (mins >= openMins && mins < closeMins) return true;
    }
  }
  return false;
}

function MapMarkers({
  filtered,
  selectedId,
  onSelect,
}: {
  filtered: Place[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const zoom = useZoom();
  const selectedPlace = filtered.find((p) => p.id === selectedId);
  const details = usePlaceDetails(selectedPlace);

  const handleMarkerClick = useCallback(
    (place: Place) => {
      onSelect(place.id);
    },
    [onSelect]
  );

  return (
    <>
      {filtered.map((place) => {
        const size = pinSize(zoom, selectedId === place.id);
        return (
        <AdvancedMarker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          onClick={() => handleMarkerClick(place)}
          title={place.name}
        >
          <div
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: CATEGORY_COLORS[place.category],
              border: `2px solid white`,
              boxShadow: selectedId === place.id
                ? `0 0 0 3px ${CATEGORY_COLORS[place.category]}`
                : "0 1px 3px rgba(0,0,0,0.3)",
              transition: "all 0.15s",
            }}
          />
        </AdvancedMarker>
        );
      })}
      {selectedPlace && (
        <InfoWindow
          position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
          onCloseClick={() => onSelect(null)}
          pixelOffset={[0, -10]}
        >
          <div style={{ fontFamily: "Inter, -apple-system, sans-serif", width: 500 }}>
            {details.photoUrls.length > 0 && (
              <div style={{ position: "relative", marginBottom: 8 }}>
                <div
                  id="photo-strip"
                  style={{ display: "flex", gap: 4, overflowX: "auto", borderRadius: 6, scrollbarWidth: "none", scrollBehavior: "smooth" }}
                >
                  {details.photoUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${selectedPlace.name} ${i + 1}`}
                      style={{
                        width: details.photoUrls.length === 1 ? "100%" : 340,
                        height: 280,
                        objectFit: "cover",
                        borderRadius: 6,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
                {details.photoUrls.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); document.getElementById("photo-strip")?.scrollBy(-350, 0); }}
                      style={{ position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                    >&lsaquo;</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); document.getElementById("photo-strip")?.scrollBy(350, 0); }}
                      style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                    >&rsaquo;</button>
                  </>
                )}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                  color: CATEGORY_COLORS[selectedPlace.category],
                }}
              >
                {CATEGORY_LABELS[selectedPlace.category]}
              </div>
              {selectedPlace.igPostUrl && (
                <a href={selectedPlace.igPostUrl} target="_blank" rel="noopener noreferrer" title="View on Instagram" style={{ opacity: 0.5, transition: "opacity 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E4405F" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="#E4405F" stroke="none" /></svg>
                </a>
              )}
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 4, color: "#0d1b3e" }}>
              {selectedPlace.name}
            </h3>
            {details.rating && (
              <div style={{ fontSize: "0.8rem", color: "#c4a35a", fontWeight: 600, marginBottom: 4 }}>
                {"★".repeat(Math.round(details.rating))}{"☆".repeat(5 - Math.round(details.rating))} {details.rating}
              </div>
            )}
            {details.address && (
              <p style={{ fontSize: "0.8rem", color: "#4a4a6a", margin: "4px 0" }}>
                {details.address}
              </p>
            )}
            {details.openNow !== null && (
              <details style={{ fontSize: "0.8rem", margin: "4px 0" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: details.openNow ? "#27ae60" : "#c8374d", fontWeight: 600 }}>
                    {details.openNow ? "Open now" : "Closed"}
                  </span>
                  {details.hoursText && <span style={{ fontSize: "0.75rem", color: "#8888a0" }}>▾ Hours</span>}
                </summary>
                {details.hoursText && (
                  <div style={{ fontSize: "0.75rem", color: "#8888a0", marginTop: 4, paddingLeft: 4, lineHeight: 1.6 }}>
                    {details.hoursText.split(" | ").map((day, i) => (
                      <div key={i}>{day}</div>
                    ))}
                  </div>
                )}
              </details>
            )}
            <p style={{ fontSize: "0.8rem", color: "#4a4a6a", margin: "4px 0" }}>
              {selectedPlace.notes}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              {details.googleMapsUrl && (
                <a
                  href={details.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.8rem", color: "#1a73e8", textDecoration: "none", fontWeight: 500 }}
                >
                  Google Maps
                </a>
              )}
              {details.website && (
                <a
                  href={details.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.8rem", color: "#1a73e8", textDecoration: "none", fontWeight: 500 }}
                >
                  Website
                </a>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function useLiveClocks() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const fmt = (tz: string) =>
    now.toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true })
      .replace(" AM", "a").replace(" PM", "p");
  return { la: fmt("America/Los_Angeles"), ny: fmt("America/New_York"), paris: fmt("Europe/Paris") };
}


function segmentIcon(segment: string): string {
  switch (segment) {
    case "Flight": return "\u2708";
    case "Travel": return "\u{1F697}";
    case "Provence": return "\u{1F33B}";
    case "LA": return "\u{1F334}";
    default: return "\u{1F5FC}";
  }
}

function ItineraryPage() {
  // Group by week
  const weeks: { label: string; days: typeof itinerary }[] = [];
  let currentWeek: typeof itinerary = [];
  let weekStart = "";

  itinerary.forEach((day, i) => {
    if (i === 0 || day.dayOfWeek === "Mon") {
      if (currentWeek.length > 0) {
        weeks.push({ label: weekStart, days: currentWeek });
      }
      currentWeek = [day];
      const d = new Date(day.date + "T12:00:00");
      weekStart = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    } else {
      currentWeek.push(day);
    }
  });
  if (currentWeek.length > 0) {
    const lastDay = new Date(currentWeek[currentWeek.length - 1].date + "T12:00:00");
    weeks.push({ label: weekStart + " \u2013 " + lastDay.toLocaleDateString("en-US", { month: "long", day: "numeric" }), days: currentWeek });
  }
  // Fix first week label
  if (weeks.length > 0) {
    const firstEnd = new Date(weeks[0].days[weeks[0].days.length - 1].date + "T12:00:00");
    weeks[0].label = weeks[0].label + " \u2013 " + firstEnd.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }

  return (
    <div className="itin-page">
      <div className="itin-page-inner">
        {weeks.map((week) => (
          <div key={week.label} className="itin-week">
            <h2 className="itin-week-label">{week.label}</h2>
            <div className="itin-timeline">
              {week.days.map((day) => {
                const today = isToday(day.date);
                const d = new Date(day.date + "T12:00:00");
                return (
                  <div key={day.date} className={`itin-tl-item${today ? " today" : ""}`}>
                    <div className="itin-tl-date">
                      <span className="itin-tl-dow">{day.dayOfWeek}</span>
                      <span className="itin-tl-day">{d.getDate()}</span>
                    </div>
                    <div className="itin-tl-line">
                      <div className="itin-tl-icon" style={{ backgroundColor: segmentColor(day.segment) }}>
                        {segmentIcon(day.segment)}
                      </div>
                    </div>
                    <div className="itin-tl-content">
                      <div className="itin-tl-title">{day.lodging}</div>
                      <div className="itin-tl-segment" style={{ color: segmentColor(day.segment) }}>
                        {day.segment}
                        {day.jessSchedule && (
                          <span className={day.jessSchedule === "Working" ? "itin-tl-working" : "itin-tl-pto"}>
                            {" \u00B7 "}Jess {day.jessSchedule.toLowerCase()}
                          </span>
                        )}
                      </div>
                      {day.activities && <div className="itin-tl-detail itin-tl-activity">{day.activities}</div>}
                      {day.meals && <div className="itin-tl-detail itin-tl-meal">{day.meals}</div>}
                      {day.notes && <div className="itin-tl-detail itin-tl-note">{day.notes}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface IGPost {
  enriched_place: string;
  enriched_note: string;
  enriched_address: string;
  enriched_lat: number | string;
  enriched_lng: number | string;
  permalink: string;
  username: string;
  full_name: string;
  caption: string;
  thumbnail_url: string;
  all_image_urls: string[];
  is_carousel: boolean;
  image_count: number;
}

function SavedCollectionPage() {
  const [posts, setPosts] = useState<IGPost[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/ig-collection.json")
      .then((r) => r.json())
      .then((data: IGPost[]) => setPosts(data))
      .catch(() => {});
  }, []);

  const filtered = posts.filter((p) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      (p.enriched_place || "").toLowerCase().includes(q) ||
      (p.username || "").toLowerCase().includes(q) ||
      (p.caption || "").toLowerCase().includes(q) ||
      (p.enriched_note || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="saved-page">
      <div className="saved-inner">
        <h2 className="saved-title">Saved from Instagram</h2>
        <p className="saved-subtitle">{posts.length} posts from @jess_heads_west collection</p>
        <input
          className="saved-search"
          type="text"
          placeholder="Search posts..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="saved-grid">
          {filtered.map((post, i) => (
            <div key={i} className="saved-card">
              <div className="saved-card-header">
                <span className="saved-avatar">{post.username.slice(0, 2)}</span>
                <span className="saved-username">@{post.username}</span>
                {post.is_carousel && <span className="saved-carousel-badge">{post.image_count} imgs</span>}
              </div>
              {post.thumbnail_url && (
                <img className="saved-card-img" src={post.thumbnail_url} loading="lazy" alt="" />
              )}
              <div className="saved-card-body">
                {post.enriched_place && <div className="saved-place-name">{post.enriched_place}</div>}
                {post.enriched_note && <div className="saved-note">{post.enriched_note}</div>}
                {post.enriched_address && (
                  <div className="saved-address">{post.enriched_address.split(",").slice(0, 3).join(",")}</div>
                )}
                <div className="saved-caption">{post.caption.slice(0, 150)}{post.caption.length > 150 ? "..." : ""}</div>
              </div>
              <div className="saved-card-footer">
                <a href={post.permalink} target="_blank" rel="noopener noreferrer">View on IG</a>
                {post.enriched_lat && post.enriched_lng && (
                  <a href={`https://www.google.com/maps?q=${post.enriched_lat},${post.enriched_lng}`} target="_blank" rel="noopener noreferrer">Map</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>("all");
  const [segmentFilter, setSegmentFilter] = useState<"all" | "paris" | "provence">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const [showTransit, setShowTransit] = useState(false);
  const [showArrondissements, setShowArrondissements] = useState(false);
  const [view, setView] = useState<"places" | "itinerary" | "saved">("places");
  const [menuOpen, setMenuOpen] = useState(false);

  const daysLeft = getDaysUntilTrip();
  const clocks = useLiveClocks();

  const categories = useMemo(() => {
    const cats = new Set(allPlaces.map((p) => p.category));
    return Array.from(cats).sort();
  }, []);

  const filtered = useMemo(() => {
    return allPlaces.filter((place) => {
      if (categoryFilter !== "all" && place.category !== categoryFilter) return false;
      if (segmentFilter !== "all" && place.segment !== segmentFilter) return false;
      if (distanceFilter !== "all" && classifyDistance(place.distanceFromApt) !== distanceFilter)
        return false;
      return true;
    });
  }, [categoryFilter, distanceFilter, segmentFilter]);

  const defaultCenter = useMemo(() => {
    if (segmentFilter === "provence") return { lat: 43.85, lng: 5.1 };
    return APARTMENT_COORDS;
  }, [segmentFilter]);

  const defaultZoom = segmentFilter === "provence" ? 10 : 13;

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="hamburger-wrap">
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
            {menuOpen && (
              <>
                <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="nav-menu">
                  <button className={view === "places" ? "active" : ""} onClick={() => { setView("places"); setMenuOpen(false); }}>Places</button>
                  <button className={view === "itinerary" ? "active" : ""} onClick={() => { setView("itinerary"); setMenuOpen(false); }}>Itinerary</button>
                  <button className={view === "saved" ? "active" : ""} onClick={() => { setView("saved"); setMenuOpen(false); }}>Saved Posts</button>
                  <div className="nav-menu-extras">
                    <PhraseTray />
                    <NeighborhoodTray />
                    {daysLeft > 0 && (
                      <div className="nav-menu-countdown">
                        <span className="countdown-num">{daysLeft}</span>
                        <span className="countdown-label">days to go</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div>
            <h1>France 2026</h1>
            <span className="subtitle">Trip Hub</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-clocks">
            <div className="clock-item"><span className="clock-time">{clocks.la}</span><span className="clock-city">Los Angeles</span></div>
            <div className="clock-item"><span className="clock-time">{clocks.ny}</span><span className="clock-city">New York</span></div>
            <div className="clock-item"><span className="clock-time">{clocks.paris}</span><span className="clock-city">Paris</span></div>
          </div>
          <div className="header-divider" />
          <div className="header-countdown">
            {daysLeft > 0 && <><span className="countdown-num">{daysLeft}</span><span className="countdown-label">days to go</span></>}
            {daysLeft <= 0 && daysLeft > -42 && <span className="countdown-label">Bon voyage!</span>}
          </div>
        </div>
      </header>

      {view === "itinerary" ? (
        <ItineraryPage />
      ) : view === "saved" ? (
        <SavedCollectionPage />
      ) : (
      <div className="main">
        <aside className={`sidebar${!showList ? " hidden-mobile" : ""}`}>
              <div className="filters">
                <div className="segment-toggle">
                  {(["all", "paris", "provence"] as const).map((seg) => (
                    <button
                      key={seg}
                      className={`segment-btn${segmentFilter === seg ? " active" : ""}`}
                      onClick={() => setSegmentFilter(seg)}
                    >
                      {seg === "all" ? "All" : seg === "paris" ? "Paris" : "Provence"}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="filter-section-label" style={{ marginBottom: 6 }}>Category</div>
                  <div className="filter-row">
                    <button
                      className={`filter-chip${categoryFilter === "all" ? " active" : ""}`}
                      onClick={() => setCategoryFilter("all")}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        className={`filter-chip${categoryFilter === cat ? " active" : ""}`}
                        onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
                        style={
                          categoryFilter === cat
                            ? { background: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] }
                            : {}
                        }
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="filter-section-label" style={{ marginBottom: 6 }}>Distance</div>
                  <div className="distance-filters">
                    {DISTANCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`filter-chip${distanceFilter === opt.value ? " active" : ""}`}
                        onClick={() => setDistanceFilter(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="place-count">
                {filtered.length} place{filtered.length !== 1 ? "s" : ""}
              </div>

              <div className="place-list">
                {filtered.map((place) => (
                  <div
                    key={place.id}
                    className={`place-card${selectedId === place.id ? " selected" : ""}`}
                    onClick={() => setSelectedId(selectedId === place.id ? null : place.id)}
                  >
                    <div
                      className="place-dot"
                      style={{ backgroundColor: CATEGORY_COLORS[place.category] }}
                    />
                    <div className="place-info">
                      <div className="place-name">{place.name}</div>
                      <div className="place-meta">
                        <span
                          className="place-category-badge"
                          style={{ backgroundColor: CATEGORY_COLORS[place.category] }}
                        >
                          {CATEGORY_LABELS[place.category]}
                        </span>
                        <span className="place-distance">{place.distanceFromApt}</span>
                        {place.rating && <span className="place-rating">{place.rating}</span>}
                      </div>
                      <div className="place-notes">{place.notes}</div>
                      {place.pricing && <div className="place-pricing">{place.pricing}</div>}
                    </div>
                    {place.igPostUrl && <span className="ig-icon-list" title="From Instagram">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4a35a" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="#c4a35a" stroke="none" /></svg>
                    </span>}
                  </div>
                ))}
              </div>
        </aside>

        <div className="map-container">
          {API_KEY ? (
            <APIProvider apiKey={API_KEY} libraries={["places"]}>
              <div className="map-controls">
                <button
                  className={`map-layer-btn${showTransit ? " active" : ""}`}
                  onClick={() => setShowTransit(!showTransit)}
                  title="Toggle transit lines"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M12 17v.01" />
                    <path d="M8 21h8" />
                    <path d="M12 21v-4" />
                    <path d="M4 11h16" />
                  </svg>
                  Transit
                </button>
                <button
                  className={`map-layer-btn${showArrondissements ? " active" : ""}`}
                  onClick={() => setShowArrondissements(!showArrondissements)}
                  title="Toggle arrondissement borders"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="12" y1="3" x2="12" y2="21" />
                  </svg>
                  Arrondissements
                </button>
              </div>
              <Map
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                mapId={MAP_ID}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapTypeControl={false}
                zoomControl={true}
                streetViewControl={true}
                fullscreenControl={false}
                scaleControl={false}
                style={{ width: "100%", height: "100%" }}
              >
                <MapPanHandler selectedId={selectedId} places={filtered} />
                <MyLocationButton />
                <TransitLayer visible={showTransit} />
                <ArrondissementLayer visible={showArrondissements} />
                <MapMarkers
                  filtered={filtered}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </Map>
            </APIProvider>
          ) : (
            <div className="no-api-key">
              <h2>Map Setup Required</h2>
              <p>Add your Google Maps API key to get the interactive map:</p>
              <code>VITE_GOOGLE_MAPS_API_KEY=your_key_here</code>
              <p style={{ marginTop: 12, fontSize: "0.8rem", color: "#8888a0" }}>
                Create a <code style={{ display: "inline", padding: "2px 4px", margin: 0 }}>.env.local</code> file in the web/ directory.
              </p>
              <p style={{ marginTop: 4, fontSize: "0.8rem", color: "#8888a0" }}>
                You also need a Map ID for Advanced Markers:
              </p>
              <code>VITE_GOOGLE_MAP_ID=your_map_id</code>
            </div>
          )}
        </div>
      </div>
      )}

      {view === "places" && (
        <button className="mobile-toggle" onClick={() => setShowList(!showList)}>
          {showList ? "Show Map" : "Show List"}
        </button>
      )}
    </div>
  );
}
