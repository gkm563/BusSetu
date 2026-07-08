import type { Trip } from "@/types/trip";
import type { BusRoute } from "@/types/route";
import { MOCK_ROUTES } from "./routes.mock";
import { MOCK_BUSES } from "./buses.mock";
import { interpolateAlongPolyline } from "@/utils/geo";

/**
 * Bus Lifecycle Phases for each route direction:
 *
 *  Phase 1 — "JUST DEPARTED"   progress: 0.03 – 0.10  (just left origin station)
 *  Phase 2 — "EN ROUTE EARLY"  progress: 0.18 – 0.28  (approaching midpoint from origin)
 *  Phase 3 — "AT MIDSTOP"      progress: 0.33 – 0.38  (stopped at a mid-route station)
 *  Phase 4 — "CROSSING USER"   progress: 0.48 – 0.55  (near Prayagraj / user's city)
 *  Phase 5 — "PAST USER"       progress: 0.65 – 0.72  (already crossed user's city)
 *  Phase 6 — "APPROACHING END" progress: 0.84 – 0.90  (nearing destination)
 *  Phase 7 — "ARRIVING"        progress: 0.93 – 0.98  (about to reach destination)
 *
 * For each of the 6 route-directions we seed buses across these phases
 * so the map always feels alive with buses at every stage of the journey.
 */

interface Seed {
  tripId: string;
  busId: string;
  routeId: string;
  direction: "forward" | "reverse";
  progress: number;
  speed: number;
  fillRatio: number;
  status: Trip["status"];
  phase: string; // for readability
}

const SEEDS: Seed[] = [
  // ════════════════════════════════════════════════════════════
  // ROUTE 1: Prayagraj → Lucknow  (r-alld-lko)
  // User city = Prayagraj (origin). "Crossing user" = just departed.
  // ════════════════════════════════════════════════════════════

  // Phase 1 – Just departed Prayagraj bus stand
  {
    tripId: "t-alld-lko-01",
    busId: "b-001",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.04,
    speed: 38,
    fillRatio: 0.88, // full bus, just boarded
    status: "running",
    phase: "just_departed",
  },
  {
    tripId: "t-alld-lko-02",
    busId: "b-002",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.09,
    speed: 45,
    fillRatio: 0.72,
    status: "running",
    phase: "just_departed",
  },

  // Phase 2 – En route early (approaching Phulpur)
  {
    tripId: "t-alld-lko-03",
    busId: "b-003",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.20,
    speed: 54,
    fillRatio: 0.65,
    status: "running",
    phase: "en_route_early",
  },

  // Phase 3 – Stopped at Pratapgarh (boarding)
  {
    tripId: "t-alld-lko-04",
    busId: "b-004",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.35,
    speed: 0,
    fillRatio: 0.80,
    status: "boarding",
    phase: "at_midstop",
  },

  // Phase 4 – Mid-route running (between Pratapgarh and Amethi)
  {
    tripId: "t-alld-lko-05",
    busId: "b-005",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.50,
    speed: 60,
    fillRatio: 0.55,
    status: "running",
    phase: "mid_route",
  },

  // Phase 5 – Approaching Raebareli (delayed)
  {
    tripId: "t-alld-lko-06",
    busId: "b-006",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.68,
    speed: 35,
    fillRatio: 1.10, // overcrowded
    status: "delayed",
    phase: "past_midpoint",
  },

  // Phase 6 – Approaching Lucknow outskirts
  {
    tripId: "t-alld-lko-07",
    busId: "b-007",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.85,
    speed: 48,
    fillRatio: 0.45,
    status: "running",
    phase: "approaching_end",
  },

  // Phase 7 – Arriving at Lucknow Charbagh
  {
    tripId: "t-alld-lko-08",
    busId: "b-008",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.95,
    speed: 22,
    fillRatio: 0.40,
    status: "running",
    phase: "arriving",
  },

  // ════════════════════════════════════════════════════════════
  // ROUTE 2: Lucknow → Prayagraj  (r-lko-alld)
  // User city = Prayagraj (destination). Buses getting closer to user.
  // ════════════════════════════════════════════════════════════

  // Phase 1 – Just left Lucknow Charbagh
  {
    tripId: "t-lko-alld-01",
    busId: "b-009",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.05,
    speed: 42,
    fillRatio: 0.92,
    status: "running",
    phase: "just_departed",
  },

  // Phase 2 – Crossing Bachhrawan
  {
    tripId: "t-lko-alld-02",
    busId: "b-010",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.22,
    speed: 56,
    fillRatio: 0.70,
    status: "running",
    phase: "en_route_early",
  },

  // Phase 3 – Stopped at Raebareli
  {
    tripId: "t-lko-alld-03",
    busId: "b-011",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.36,
    speed: 0,
    fillRatio: 0.58,
    status: "boarding",
    phase: "at_midstop",
  },

  // Phase 4 – Between Amethi and Pratapgarh
  {
    tripId: "t-lko-alld-04",
    busId: "b-012",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.53,
    speed: 62,
    fillRatio: 0.42,
    status: "running",
    phase: "mid_route",
  },

  // Phase 5 – Crossing Phulpur (will reach Prayagraj soon!)
  {
    tripId: "t-lko-alld-05",
    busId: "b-013",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.72,
    speed: 50,
    fillRatio: 0.35,
    status: "running",
    phase: "past_midpoint",
  },

  // Phase 6 – Approaching Prayagraj outskirts
  {
    tripId: "t-lko-alld-06",
    busId: "b-014",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.86,
    speed: 38,
    fillRatio: 0.28,
    status: "delayed",
    phase: "approaching_end",
  },

  // Phase 7 – Arriving at Prayagraj Bus Stand (5 min away!)
  {
    tripId: "t-lko-alld-07",
    busId: "b-015",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.96,
    speed: 18,
    fillRatio: 0.22,
    status: "running",
    phase: "arriving",
  },

  // ════════════════════════════════════════════════════════════
  // ROUTE 3: Lucknow → Delhi  (r-lko-del)
  // User mid-route = Kanpur area
  // ════════════════════════════════════════════════════════════

  // Phase 1 – Just departed Lucknow Alambagh
  {
    tripId: "t-lko-del-01",
    busId: "b-016",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.04,
    speed: 50,
    fillRatio: 0.95,
    status: "running",
    phase: "just_departed",
  },

  // Phase 2 – Crossing Unnao
  {
    tripId: "t-lko-del-02",
    busId: "b-017",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.19,
    speed: 65,
    fillRatio: 0.82,
    status: "running",
    phase: "en_route_early",
  },

  // Phase 3 – Stopped at Kanpur Central (boarding stop)
  {
    tripId: "t-lko-del-03",
    busId: "b-018",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.33,
    speed: 0,
    fillRatio: 1.05, // slightly over capacity
    status: "boarding",
    phase: "at_midstop",
  },

  // Phase 4 – Between Kanpur and Etawah
  {
    tripId: "t-lko-del-04",
    busId: "b-019",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.50,
    speed: 72,
    fillRatio: 0.65,
    status: "running",
    phase: "mid_route",
  },

  // Phase 5 – Crossing Etawah / heading to Agra
  {
    tripId: "t-lko-del-05",
    busId: "b-020",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.66,
    speed: 58,
    fillRatio: 0.55,
    status: "running",
    phase: "past_midpoint",
  },

  // Phase 6 – Crossing Mathura (heading to Delhi)
  {
    tripId: "t-lko-del-06",
    busId: "b-021",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.83,
    speed: 68,
    fillRatio: 0.48,
    status: "running",
    phase: "approaching_end",
  },

  // Phase 7 – Arriving Delhi Kashmiri Gate ISBT
  {
    tripId: "t-lko-del-07",
    busId: "b-022",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.94,
    speed: 30,
    fillRatio: 0.38,
    status: "delayed",
    phase: "arriving",
  },

  // ════════════════════════════════════════════════════════════
  // ROUTE 4: Delhi → Lucknow  (r-del-lko)
  // ════════════════════════════════════════════════════════════

  // Phase 1 – Just left Delhi Kashmiri Gate
  {
    tripId: "t-del-lko-01",
    busId: "b-023",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.04,
    speed: 45,
    fillRatio: 0.90,
    status: "running",
    phase: "just_departed",
  },

  // Phase 2 – Crossing Mathura
  {
    tripId: "t-del-lko-02",
    busId: "b-024",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.21,
    speed: 70,
    fillRatio: 0.75,
    status: "running",
    phase: "en_route_early",
  },

  // Phase 3 – Stopped at Agra ISBT
  {
    tripId: "t-del-lko-03",
    busId: "b-025",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.35,
    speed: 0,
    fillRatio: 0.88,
    status: "boarding",
    phase: "at_midstop",
  },

  // Phase 4 – Between Agra and Etawah
  {
    tripId: "t-del-lko-04",
    busId: "b-026",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.49,
    speed: 65,
    fillRatio: 0.60,
    status: "running",
    phase: "mid_route",
  },

  // Phase 5 – Crossing Kanpur
  {
    tripId: "t-del-lko-05",
    busId: "b-027",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.67,
    speed: 55,
    fillRatio: 0.40,
    status: "running",
    phase: "past_midpoint",
  },

  // Phase 6 – Crossing Unnao (almost at Lucknow!)
  {
    tripId: "t-del-lko-06",
    busId: "b-028",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.85,
    speed: 50,
    fillRatio: 0.32,
    status: "delayed",
    phase: "approaching_end",
  },

  // Phase 7 – Arriving at Lucknow Charbagh
  {
    tripId: "t-del-lko-07",
    busId: "b-029",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.96,
    speed: 15,
    fillRatio: 0.25,
    status: "running",
    phase: "arriving",
  },

  // ════════════════════════════════════════════════════════════
  // ROUTE 5: Delhi → Prayagraj  (r-del-alld)
  // User city = Prayagraj (destination). Buses approaching user.
  // ════════════════════════════════════════════════════════════

  // Phase 1 – Just departed Delhi Kashmiri Gate
  {
    tripId: "t-del-alld-01",
    busId: "b-030",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.04,
    speed: 52,
    fillRatio: 0.94,
    status: "running",
    phase: "just_departed",
  },

  // Phase 2 – Crossing Mathura / Agra
  {
    tripId: "t-del-alld-02",
    busId: "b-031",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.23,
    speed: 68,
    fillRatio: 0.80,
    status: "running",
    phase: "en_route_early",
  },

  // Phase 3 – Stopped at Agra ISBT
  {
    tripId: "t-del-alld-03",
    busId: "b-032",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.32,
    speed: 0,
    fillRatio: 0.95,
    status: "boarding",
    phase: "at_midstop",
  },

  // Phase 4 – Between Etawah and Kanpur
  {
    tripId: "t-del-alld-04",
    busId: "b-033",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.52,
    speed: 66,
    fillRatio: 0.68,
    status: "running",
    phase: "mid_route",
  },

  // Phase 5 – Crossing Fatehpur (getting close to Prayagraj!)
  {
    tripId: "t-del-alld-05",
    busId: "b-034",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.70,
    speed: 55,
    fillRatio: 1.12,
    status: "delayed",
    phase: "past_midpoint",
  },

  // Phase 6 – Approaching Prayagraj (40 km away)
  {
    tripId: "t-del-alld-06",
    busId: "b-035",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.85,
    speed: 48,
    fillRatio: 0.52,
    status: "running",
    phase: "approaching_end",
  },

  // Phase 7 – Arriving Prayagraj Bus Stand!
  {
    tripId: "t-del-alld-07",
    busId: "b-036",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.95,
    speed: 20,
    fillRatio: 0.42,
    status: "running",
    phase: "arriving",
  },

  // ════════════════════════════════════════════════════════════
  // ROUTE 6: Prayagraj → Delhi  (r-alld-del)
  // User city = Prayagraj (origin). Buses leaving user's city.
  // ════════════════════════════════════════════════════════════

  // Phase 1 – Just left Prayagraj Bus Stand
  {
    tripId: "t-alld-del-01",
    busId: "b-037",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.03,
    speed: 35,
    fillRatio: 0.98, // packed bus
    status: "running",
    phase: "just_departed",
  },
  {
    tripId: "t-alld-del-02",
    busId: "b-038",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.08,
    speed: 48,
    fillRatio: 0.78,
    status: "running",
    phase: "just_departed",
  },

  // Phase 2 – Approaching Fatehpur
  {
    tripId: "t-alld-del-03",
    busId: "b-039",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.22,
    speed: 60,
    fillRatio: 0.62,
    status: "running",
    phase: "en_route_early",
  },

  // Phase 3 – Stopped at Kanpur Central
  {
    tripId: "t-alld-del-04",
    busId: "b-040",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.35,
    speed: 0,
    fillRatio: 0.88,
    status: "boarding",
    phase: "at_midstop",
  },

  // Phase 4 – Between Kanpur and Etawah
  {
    tripId: "t-alld-del-05",
    busId: "b-001", // reuse buses (different trip)
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.50,
    speed: 70,
    fillRatio: 0.55,
    status: "running",
    phase: "mid_route",
  },

  // Phase 5 – Crossing Agra (approaching Mathura)
  {
    tripId: "t-alld-del-06",
    busId: "b-002",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.68,
    speed: 65,
    fillRatio: 0.45,
    status: "running",
    phase: "past_midpoint",
  },

  // Phase 6 – Crossing Mathura heading to Delhi
  {
    tripId: "t-alld-del-07",
    busId: "b-003",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.82,
    speed: 72,
    fillRatio: 0.38,
    status: "running",
    phase: "approaching_end",
  },

  // Phase 7 – Arriving at Delhi Kashmiri Gate ISBT
  {
    tripId: "t-alld-del-08",
    busId: "b-004",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.94,
    speed: 25,
    fillRatio: 0.30,
    status: "delayed",
    phase: "arriving",
  },

  // ────────────────────────────────────────────────────────────
  // Legacy compatibility seeds
  // ────────────────────────────────────────────────────────────
  {
    tripId: "t-legacy-01",
    busId: "b-005",
    routeId: "r-alld-mzp",
    direction: "forward",
    progress: 0.42,
    speed: 48,
    fillRatio: 0.64,
    status: "running",
    phase: "mid_route",
  },
  {
    tripId: "t-legacy-02",
    busId: "b-006",
    routeId: "r-alld-vns",
    direction: "forward",
    progress: 0.35,
    speed: 0,
    fillRatio: 0.82,
    status: "boarding",
    phase: "at_midstop",
  },
  {
    tripId: "t-legacy-03",
    busId: "b-007",
    routeId: "r-mzp-vns",
    direction: "forward",
    progress: 0.58,
    speed: 52,
    fillRatio: 0.45,
    status: "running",
    phase: "mid_route",
  },
];

function directionalPolyline(route: BusRoute, dir: "forward" | "reverse") {
  return dir === "forward" ? route.polyline : [...route.polyline].reverse();
}

function directionalStops(route: BusRoute, dir: "forward" | "reverse") {
  return dir === "forward" ? route.stops : [...route.stops].reverse();
}

export function seedTrips(): Trip[] {
  const now = Date.now();
  return SEEDS.map((s) => {
    const route = MOCK_ROUTES.find((r) => r.id === s.routeId)!;
    const bus = MOCK_BUSES.find((b) => b.id === s.busId)!;
    const poly = directionalPolyline(route, s.direction);
    const stops = directionalStops(route, s.direction);
    const { lat, lng, heading } = interpolateAlongPolyline(poly, s.progress);

    const segIndex = Math.min(stops.length - 2, Math.floor(s.progress * (stops.length - 1)));
    const currentStopId = stops[segIndex].id;
    const nextStopId = stops[Math.min(stops.length - 1, segIndex + 1)].id;

    const occupied = Math.min(bus.totalSeats, Math.round(bus.totalSeats * Math.min(1, s.fillRatio)));
    const standing = s.fillRatio > 1 ? Math.round(bus.totalSeats * (s.fillRatio - 1)) : 0;
    const vacant = bus.totalSeats - occupied;

    // ETA: compute realistic per-stop ETAs based on remaining distance
    const eta: Record<string, string> = {};
    const remainingStops = stops.slice(segIndex + 1);
    for (let i = 0; i < remainingStops.length; i++) {
      // Each stop approx 25-35 min apart for intercity routes
      const baseMinutes = (i + 1) * 28;
      const delayPenalty = s.status === "delayed" ? 15 + Math.round(Math.random() * 10) : 0;
      const boardingPenalty = s.status === "boarding" ? 8 : 0;
      eta[remainingStops[i].id] = new Date(
        now + (baseMinutes + delayPenalty + boardingPenalty) * 60_000,
      ).toISOString();
    }

    // Scheduled times based on progress
    const totalTripMinutes = route.estimatedDurationMin ?? 240;
    const elapsedMinutes = Math.round(s.progress * totalTripMinutes);
    const scheduledStart = new Date(now - elapsedMinutes * 60_000).toISOString();
    const scheduledEnd = new Date(now + (totalTripMinutes - elapsedMinutes) * 60_000).toISOString();

    return {
      tripId: s.tripId,
      busId: s.busId,
      operatorId: bus.operatorId,
      routeId: route.id,
      direction: s.direction,
      scheduledStart,
      scheduledEnd,
      status: s.status,
      gps: {
        latitude: lat,
        longitude: lng,
        heading,
        speed: s.speed,
        gpsAccuracy: 4 + Math.random() * 5,
        timestamp: new Date(now).toISOString(),
      },
      passenger: {
        occupiedSeats: occupied,
        standingPassengers: standing,
        vacantSeats: vacant,
      },
      currentStopId,
      nextStopId,
      routeProgress: s.progress,
      eta,
      lastUpdated: new Date(now).toISOString(),
      punctualityScore: s.status === "delayed" ? 55 + Math.round(Math.random() * 20) : 75 + Math.round(Math.random() * 20),
      averageDelayMin: s.status === "delayed" ? 12 + Math.round(Math.random() * 8) : 1 + Math.round(Math.random() * 3),
    };
  });
}
