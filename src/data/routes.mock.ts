import type { BusRoute } from "@/types/route";
import { MOCK_STOPS } from "./stops.mock";
import { polylineDistances } from "@/utils/geo";

function stop(id: string) {
  const s = MOCK_STOPS.find((x) => x.id === id);
  if (!s) throw new Error(`Missing stop: ${id}`);
  return s;
}

function buildRoute(id: string, name: string, stopIds: string[]): BusRoute {
  const stops = stopIds.map(stop);
  const polyline: [number, number][] = stops.map((s) => [s.lat, s.lng]);
  const { total } = polylineDistances(polyline);
  // Assume 45 km/h average intercity speed.
  const estimatedDurationMin = Math.round((total / 45) * 60);
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

export const MOCK_ROUTES: BusRoute[] = [
  // 1. Prayagraj ↔ Lucknow
  buildRoute("r-alld-lko", "Prayagraj → Lucknow", [
    "s-prayagraj",
    "s-phulpur",
    "s-pratapgarh",
    "s-amethi",
    "s-raebareli",
    "s-bachhrawan",
    "s-lucknow",
  ]),
  buildRoute("r-lko-alld", "Lucknow → Prayagraj", [
    "s-lucknow",
    "s-bachhrawan",
    "s-raebareli",
    "s-amethi",
    "s-pratapgarh",
    "s-phulpur",
    "s-prayagraj",
  ]),

  // 2. Lucknow ↔ Delhi
  buildRoute("r-lko-del", "Lucknow → Delhi", [
    "s-lucknow",
    "s-unnao",
    "s-kanpur",
    "s-etawah",
    "s-agra",
    "s-mathura",
    "s-delhi",
  ]),
  buildRoute("r-del-lko", "Delhi → Lucknow", [
    "s-delhi",
    "s-mathura",
    "s-agra",
    "s-etawah",
    "s-kanpur",
    "s-unnao",
    "s-lucknow",
  ]),

  // 3. Delhi ↔ Prayagraj
  buildRoute("r-del-alld", "Delhi → Prayagraj", [
    "s-delhi",
    "s-mathura",
    "s-agra",
    "s-etawah",
    "s-kanpur",
    "s-fatehpur",
    "s-prayagraj",
  ]),
  buildRoute("r-alld-del", "Prayagraj → Delhi", [
    "s-prayagraj",
    "s-fatehpur",
    "s-kanpur",
    "s-etawah",
    "s-agra",
    "s-mathura",
    "s-delhi",
  ]),

  // Legacy compatibility routes
  buildRoute("r-alld-mzp", "Prayagraj → Mirzapur", [
    "s-allahabad-civil",
    "s-naini",
    "s-karchana",
    "s-meja",
    "s-vindhyachal",
    "s-mirzapur",
  ]),
  buildRoute("r-alld-vns", "Prayagraj → Varanasi", [
    "s-allahabad-civil",
    "s-naini",
    "s-gyanpur",
    "s-bhadohi",
    "s-varanasi-cantt",
  ]),
  buildRoute("r-mzp-vns", "Mirzapur → Varanasi", [
    "s-mirzapur",
    "s-vindhyachal",
    "s-bhadohi",
    "s-varanasi-cantt",
  ]),
];
