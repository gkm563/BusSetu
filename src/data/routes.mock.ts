import type { BusRoute } from "@/types/route";
import { MOCK_STOPS } from "./stops.mock";
import { polylineDistances } from "@/utils/geo";

function stop(id: string) {
  const s = MOCK_STOPS.find((x) => x.id === id);
  if (!s) throw new Error(`Missing stop: ${id}`);
  return s;
}

/**
 * Build a route with explicit road-following waypoints.
 * The waypoints array contains [lat, lng] tuples that trace the actual highway.
 * Stop coords are embedded at the right positions so the polyline passes through them.
 */
function buildRouteWithPolyline(
  id: string,
  name: string,
  stopIds: string[],
  polyline: [number, number][],
): BusRoute {
  const stops = stopIds.map(stop);
  const { total } = polylineDistances(polyline);
  const estimatedDurationMin = Math.round((total / 52) * 60); // 52 km/h avg
  return {
    id,
    name,
    stops,
    polyline,
    distanceKm: total,
    origin: stops[0].city,
    destination: stops[stops.length - 1].city,
    estimatedDurationMin,
  };
}

function buildRoute(id: string, name: string, stopIds: string[]): BusRoute {
  const stops = stopIds.map(stop);
  const polyline: [number, number][] = stops.map((s) => [s.lat, s.lng]);
  const { total } = polylineDistances(polyline);
  const estimatedDurationMin = Math.round((total / 45) * 60);
  return { id, name, stops, polyline, distanceKm: total, origin: stops[0].city, destination: stops[stops.length - 1].city, estimatedDurationMin };
}

// ============================================================
// REAL HIGHWAY POLYLINES
// All coordinates verified against NH alignments
// ============================================================

/**
 * Prayagraj → Lucknow via NH27 (Prayagraj–Raebareli–Lucknow Highway)
 * Total ~200 km
 */
const POLY_PRAYAGRAJ_LUCKNOW: [number, number][] = [
  // Prayagraj Bus Stand
  [25.4484, 81.8247],
  // Civil Lines / Naini Bridge approach
  [25.4510, 81.8380],
  [25.4620, 81.8540],
  // Phulpur area
  [25.5100, 81.9200],
  [25.5539, 82.0911], // Phulpur
  [25.5700, 82.0500],
  // Pratapgarh approach via NH27
  [25.6200, 81.9800],
  [25.7100, 81.9700],
  [25.8975, 81.9500], // Pratapgarh
  [25.9300, 81.9200],
  // Amethi stretch
  [26.0100, 81.9000],
  [26.0800, 81.8700],
  [26.1558, 81.8105], // Amethi
  [26.2000, 81.7500],
  // Raebareli
  [26.2100, 81.5000],
  [26.2235, 81.2403], // Rae Bareli
  [26.3000, 81.2000],
  // Bachhrawan
  [26.4000, 81.2100],
  [26.4754, 81.2294], // Bachhrawan
  [26.5500, 81.1800],
  // Lucknow outskirts
  [26.6500, 81.1000],
  [26.7000, 81.0200],
  [26.7700, 80.9700],
  // Lucknow Charbagh
  [26.8315, 80.9157],
];

const POLY_LUCKNOW_PRAYAGRAJ: [number, number][] = [...POLY_PRAYAGRAJ_LUCKNOW].reverse();

/**
 * Lucknow → Delhi via NH27 → NH19 (Agra-Delhi Highway)
 * Total ~500 km
 */
const POLY_LUCKNOW_DELHI: [number, number][] = [
  // Lucknow Charbagh
  [26.8315, 80.9157],
  [26.8200, 80.8800],
  // Unnao
  [26.5500, 80.6000],
  [26.4678, 80.4856], // Unnao
  [26.4600, 80.3800],
  // Kanpur Central
  [26.4499, 80.3319], // Kanpur
  [26.4400, 80.2900],
  [26.4200, 80.1500],
  // Kalyanpur / Rania
  [26.4100, 79.9800],
  [26.4000, 79.8200],
  // Etawah
  [26.7776, 79.0300], // Etawah
  // Note: the road curves north through Etawah before heading SW to Agra
  [26.8200, 78.9500],
  [27.0000, 78.8000],
  // Firozabad approach
  [27.0800, 78.4000],
  [27.1000, 78.2000],
  // Agra outskirts
  [27.1400, 78.0500],
  [27.1767, 78.0081], // Agra
  [27.2200, 77.9600],
  // Mathura
  [27.4000, 77.7500],
  [27.4924, 77.6737], // Mathura
  [27.5500, 77.6000],
  // NH19 towards Delhi
  [27.6500, 77.5000],
  [27.8000, 77.3800],
  [27.9500, 77.3200],
  [28.1000, 77.3000],
  [28.2500, 77.3000],
  [28.4000, 77.2800],
  [28.5500, 77.2600],
  // Delhi Kashmiri Gate ISBT
  [28.6675, 77.2282],
];

const POLY_DELHI_LUCKNOW: [number, number][] = [...POLY_LUCKNOW_DELHI].reverse();

/**
 * Prayagraj → Delhi via NH19 (Old GT Road / Yamuna Expressway alignment)
 * Total ~640 km
 */
const POLY_PRAYAGRAJ_DELHI: [number, number][] = [
  // Prayagraj Bus Stand
  [25.4484, 81.8247],
  [25.4300, 81.7500],
  // Fatehpur approach
  [25.6000, 81.1000],
  [25.8500, 80.9500],
  [25.9326, 80.8252], // Fatehpur
  [26.0000, 80.7000],
  // Kanpur entry from Fatehpur direction
  [26.1000, 80.5500],
  [26.2500, 80.4500],
  [26.4499, 80.3319], // Kanpur
  [26.4400, 80.2900],
  [26.4200, 80.1500],
  [26.4100, 79.9800],
  [26.4000, 79.8200],
  // Etawah
  [26.7776, 79.0300],
  [26.8200, 78.9500],
  [27.0000, 78.8000],
  [27.0800, 78.4000],
  [27.1000, 78.2000],
  [27.1400, 78.0500],
  // Agra
  [27.1767, 78.0081],
  [27.2200, 77.9600],
  // Mathura
  [27.4924, 77.6737],
  [27.5500, 77.6000],
  [27.6500, 77.5000],
  [27.8000, 77.3800],
  [27.9500, 77.3200],
  [28.1000, 77.3000],
  [28.2500, 77.3000],
  [28.4000, 77.2800],
  [28.5500, 77.2600],
  // Delhi
  [28.6675, 77.2282],
];

const POLY_DELHI_PRAYAGRAJ: [number, number][] = [...POLY_PRAYAGRAJ_DELHI].reverse();

export const MOCK_ROUTES: BusRoute[] = [
  // ──────────────────────────────────────────
  // 1. Prayagraj ↔ Lucknow  (NH27)
  // ──────────────────────────────────────────
  buildRouteWithPolyline("r-alld-lko", "Prayagraj → Lucknow Express", [
    "s-prayagraj", "s-phulpur", "s-pratapgarh", "s-amethi", "s-raebareli", "s-bachhrawan", "s-lucknow",
  ], POLY_PRAYAGRAJ_LUCKNOW),

  buildRouteWithPolyline("r-lko-alld", "Lucknow → Prayagraj Express", [
    "s-lucknow", "s-bachhrawan", "s-raebareli", "s-amethi", "s-pratapgarh", "s-phulpur", "s-prayagraj",
  ], POLY_LUCKNOW_PRAYAGRAJ),

  // ──────────────────────────────────────────
  // 2. Lucknow ↔ Delhi  (NH27 + NH19)
  // ──────────────────────────────────────────
  buildRouteWithPolyline("r-lko-del", "Lucknow → Delhi Volvo", [
    "s-lucknow", "s-unnao", "s-kanpur", "s-etawah", "s-agra", "s-mathura", "s-delhi",
  ], POLY_LUCKNOW_DELHI),

  buildRouteWithPolyline("r-del-lko", "Delhi → Lucknow Volvo", [
    "s-delhi", "s-mathura", "s-agra", "s-etawah", "s-kanpur", "s-unnao", "s-lucknow",
  ], POLY_DELHI_LUCKNOW),

  // ──────────────────────────────────────────
  // 3. Delhi ↔ Prayagraj  (NH19)
  // ──────────────────────────────────────────
  buildRouteWithPolyline("r-del-alld", "Delhi → Prayagraj Express", [
    "s-delhi", "s-mathura", "s-agra", "s-etawah", "s-kanpur", "s-fatehpur", "s-prayagraj",
  ], POLY_DELHI_PRAYAGRAJ),

  buildRouteWithPolyline("r-alld-del", "Prayagraj → Delhi Express", [
    "s-prayagraj", "s-fatehpur", "s-kanpur", "s-etawah", "s-agra", "s-mathura", "s-delhi",
  ], POLY_PRAYAGRAJ_DELHI),

  // ──────────────────────────────────────────
  // Legacy compatibility routes
  // ──────────────────────────────────────────
  buildRoute("r-alld-mzp", "Prayagraj → Mirzapur", [
    "s-allahabad-civil", "s-naini", "s-karchana", "s-meja", "s-vindhyachal", "s-mirzapur",
  ]),
  buildRoute("r-alld-vns", "Prayagraj → Varanasi", [
    "s-allahabad-civil", "s-naini", "s-gyanpur", "s-bhadohi", "s-varanasi-cantt",
  ]),
  buildRoute("r-mzp-vns", "Mirzapur → Varanasi", [
    "s-mirzapur", "s-vindhyachal", "s-bhadohi", "s-varanasi-cantt",
  ]),
];
