export interface ItineraryDay {
  date: string; // ISO format YYYY-MM-DD
  dayOfWeek: string;
  segment: "LA" | "Flight" | "Paris" | "Provence" | "Travel";
  lodging: string;
  lodgingLat: number;
  lodgingLng: number;
  jessSchedule?: string;
  activities?: string;
  meals?: string;
  notes?: string;
}

export const itinerary: ItineraryDay[] = [
  { date: "2026-07-17", dayOfWeek: "Fri", segment: "LA", lodging: "Westdrift Manhattan Beach", lodgingLat: 33.8950, lodgingLng: -118.3960, jessSchedule: "PTO", notes: "Car rental: National, PSP to LAX, Conf# KCDCRN" },
  { date: "2026-07-18", dayOfWeek: "Sat", segment: "Flight", lodging: "Air France AF 0023", lodgingLat: 33.9425, lodgingLng: -118.4081, jessSchedule: "PTO", notes: "LAX 3:15 PM PDT → CDG 11:10 AM CEST. Pack snacks, tablet, comfort items" },
  { date: "2026-07-19", dayOfWeek: "Sun", segment: "Paris", lodging: "Pepper & Paper Apartments", lodgingLat: 48.8418, lodgingLng: 2.3508, jessSchedule: "PTO", activities: "Recover from flight; light walk", meals: "Easy dinner near hotel" },
  { date: "2026-07-20", dayOfWeek: "Mon", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO" },
  { date: "2026-07-21", dayOfWeek: "Tue", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO" },
  { date: "2026-07-22", dayOfWeek: "Wed", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO" },
  { date: "2026-07-23", dayOfWeek: "Thu", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO" },
  { date: "2026-07-24", dayOfWeek: "Fri", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO" },
  { date: "2026-07-25", dayOfWeek: "Sat", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Weekend", notes: "Anna, Ant, Roman arrive" },
  { date: "2026-07-26", dayOfWeek: "Sun", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Weekend", meals: "Le Bons George @ 7pm w/ Anna", notes: "Anna, Ant, Roman" },
  { date: "2026-07-27", dayOfWeek: "Mon", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO", notes: "Anna, Ant, Roman. Nanny in evenings?" },
  { date: "2026-07-28", dayOfWeek: "Tue", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO", activities: "Philharmonie des Enfants", notes: "Anna, Ant, Roman" },
  { date: "2026-07-29", dayOfWeek: "Wed", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO", activities: "Luxembourg Gardens — Playground & Boat Pond", notes: "Anna, Ant, Roman" },
  { date: "2026-07-30", dayOfWeek: "Thu", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO", activities: "Outlets?", notes: "Anna, Ant, Roman" },
  { date: "2026-07-31", dayOfWeek: "Fri", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "PTO", notes: "Anna, Ant, Roman. EJ will be here" },
  { date: "2026-08-01", dayOfWeek: "Sat", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Weekend", notes: "Anna, Ant, Roman. EJ will be here" },
  { date: "2026-08-02", dayOfWeek: "Sun", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Weekend", notes: "Anna, Ant, Roman. EJ will be here" },
  { date: "2026-08-03", dayOfWeek: "Mon", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "EJ will be here. French daycare TBD (MWF)" },
  { date: "2026-08-04", dayOfWeek: "Tue", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "EJ will be here" },
  { date: "2026-08-05", dayOfWeek: "Wed", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "EJ will be here. French daycare TBD (MWF)" },
  { date: "2026-08-06", dayOfWeek: "Thu", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "EJ will be here" },
  { date: "2026-08-07", dayOfWeek: "Fri", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "EJ will be here. French daycare TBD (MWF)" },
  { date: "2026-08-08", dayOfWeek: "Sat", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Weekend", notes: "EJ will be here" },
  { date: "2026-08-09", dayOfWeek: "Sun", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Weekend" },
  { date: "2026-08-10", dayOfWeek: "Mon", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "French daycare TBD (MWF)" },
  { date: "2026-08-11", dayOfWeek: "Tue", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working" },
  { date: "2026-08-12", dayOfWeek: "Wed", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "French daycare TBD (MWF)" },
  { date: "2026-08-13", dayOfWeek: "Thu", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working" },
  { date: "2026-08-14", dayOfWeek: "Fri", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "French daycare TBD (MWF)" },
  { date: "2026-08-15", dayOfWeek: "Sat", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Weekend", notes: "HOLIDAY: Assumption Day. Most shops/offices closed." },
  { date: "2026-08-16", dayOfWeek: "Sun", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Weekend" },
  { date: "2026-08-17", dayOfWeek: "Mon", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "French daycare TBD (MWF)" },
  { date: "2026-08-18", dayOfWeek: "Tue", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working" },
  { date: "2026-08-19", dayOfWeek: "Wed", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working", notes: "French daycare TBD (MWF)" },
  { date: "2026-08-20", dayOfWeek: "Thu", segment: "Paris", lodging: "Ukio Tular 1979", lodgingLat: 48.8534, lodgingLng: 2.2867, jessSchedule: "Working" },
  { date: "2026-08-21", dayOfWeek: "Fri", segment: "Travel", lodging: "Bastide du Mourre", lodgingLat: 43.8314, lodgingLng: 5.1692, jessSchedule: "Working", activities: "Travel day. TGV 11:38 AM → Avignon 2:17 PM. Pick up rental car.", notes: "Checkout Paris by 10am. TGV Ref: LWJS2V" },
  { date: "2026-08-22", dayOfWeek: "Sat", segment: "Provence", lodging: "Bastide du Mourre", lodgingLat: 43.8314, lodgingLng: 5.1692, jessSchedule: "PTO" },
  { date: "2026-08-23", dayOfWeek: "Sun", segment: "Provence", lodging: "Bastide du Mourre", lodgingLat: 43.8314, lodgingLng: 5.1692, jessSchedule: "PTO" },
  { date: "2026-08-24", dayOfWeek: "Mon", segment: "Provence", lodging: "Domaine de Chalamon", lodgingLat: 43.7892, lodgingLng: 4.8581, jessSchedule: "PTO" },
  { date: "2026-08-25", dayOfWeek: "Tue", segment: "Provence", lodging: "Domaine de Chalamon", lodgingLat: 43.7892, lodgingLng: 4.8581, jessSchedule: "PTO" },
  { date: "2026-08-26", dayOfWeek: "Wed", segment: "Travel", lodging: "Hotel Elysee Montmartre", lodgingLat: 48.8826, lodgingLng: 2.3494, jessSchedule: "PTO", activities: "Travel day. Drive to Avignon, TGV to Paris.", notes: "Checkout Chalamon by 11am" },
  { date: "2026-08-27", dayOfWeek: "Thu", segment: "Flight", lodging: "CDG Airport", lodgingLat: 49.0097, lodgingLng: 2.5479, jessSchedule: "PTO", notes: "AF24 CDG 1:25 PM → LAX 4:05 PM" },
];

export function isToday(date: string): boolean {
  return new Date().toISOString().slice(0, 10) === date;
}

export function segmentColor(segment: ItineraryDay["segment"]): string {
  switch (segment) {
    case "Paris": return "#1e3a5f";
    case "Provence": return "#27ae60";
    case "Travel": return "#e67e22";
    case "Flight": return "#9b59b6";
    case "LA": return "#e74c3c";
  }
}
