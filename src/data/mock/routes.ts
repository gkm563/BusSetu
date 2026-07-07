import type { BusRoute } from "@/types/route";
import { MOCK_STOPS } from "./stops";
import { polylineDistances } from "@/utils/geo";

function stop(id: string) {
  const s = MOCK_STOPS.find((x) => x.id === id);
  if (!s) throw new Error(`Missing stop: ${id}`);
  return s;
}

function buildRoute(id: string, name: string, stopIds: string[]): BusRoute {
  const stops = stopIds.map(stop);
  // For mock, polyline follows the stops directly.
  const polyline: [number, number][] = stops.map((s) => [s.lat, s.lng]);
  const { total } = polylineDistances(polyline);
  // Assume 40 km/h average intercity for the ETA in the mock.
  const estimatedDurationMin = Math.round((total / 40) * 60);
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
  buildRoute("r-lko-alld", "Lucknow → Prayagraj", [
    "s-lucknow-alambagh",
    "s-rae-bareli",
    "s-pratapgarh",
    "s-allahabad-civil",
  ]),
];
