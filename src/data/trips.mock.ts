import type { Trip } from "@/types/trip";
import type { BusRoute } from "@/types/route";
import { MOCK_ROUTES } from "./routes.mock";
import { MOCK_BUSES } from "./buses.mock";
import { interpolateAlongPolyline } from "@/utils/geo";

interface Seed {
  tripId: string;
  busId: string;
  routeId: string;
  direction: "forward" | "reverse";
  progress: number;
  speed: number;
  fillRatio: number;
  status: Trip["status"];
}

const SEEDS: Seed[] = [
  // ==========================================
  // 1. Prayagraj → Lucknow (r-alld-lko)
  // Midpoint is Pratapgarh (progress ~0.35)
  // ==========================================
  {
    tripId: "t-alld-lko-01",
    busId: "b-001",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.12,
    speed: 55,
    fillRatio: 0.42,
    status: "running",
  },
  {
    tripId: "t-alld-lko-02",
    busId: "b-002",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.28,
    speed: 48,
    fillRatio: 0.91,
    status: "running",
  },
  {
    tripId: "t-alld-lko-03",
    busId: "b-003",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.35,
    speed: 0,
    fillRatio: 0.68,
    status: "boarding",
  },
  {
    tripId: "t-alld-lko-04",
    busId: "b-004",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.55,
    speed: 62,
    fillRatio: 0.15,
    status: "running",
  },
  {
    tripId: "t-alld-lko-05",
    busId: "b-005",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.78,
    speed: 40,
    fillRatio: 1.15,
    status: "delayed",
  },
  {
    tripId: "t-alld-lko-06",
    busId: "b-006",
    routeId: "r-alld-lko",
    direction: "forward",
    progress: 0.94,
    speed: 50,
    fillRatio: 0.68,
    status: "running",
  },

  // ==========================================
  // Lucknow → Prayagraj (r-lko-alld)
  // Midpoint is Pratapgarh (progress ~0.65)
  // ==========================================
  {
    tripId: "t-lko-alld-01",
    busId: "b-007",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.18,
    speed: 52,
    fillRatio: 0.68,
    status: "running",
  },
  {
    tripId: "t-lko-alld-02",
    busId: "b-008",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.45,
    speed: 0,
    fillRatio: 0.42,
    status: "boarding",
  },
  {
    tripId: "t-lko-alld-03",
    busId: "b-009",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.63,
    speed: 58,
    fillRatio: 0.91,
    status: "running",
  },
  {
    tripId: "t-lko-alld-04",
    busId: "b-010",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.76,
    speed: 60,
    fillRatio: 0.15,
    status: "running",
  },
  {
    tripId: "t-lko-alld-05",
    busId: "b-011",
    routeId: "r-lko-alld",
    direction: "forward",
    progress: 0.92,
    speed: 35,
    fillRatio: 1.15,
    status: "delayed",
  },

  // ==========================================
  // 2. Lucknow → Delhi (r-lko-del)
  // Midpoint is Kanpur (progress ~0.35)
  // ==========================================
  {
    tripId: "t-lko-del-01",
    busId: "b-012",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.15,
    speed: 64,
    fillRatio: 0.55,
    status: "running",
  },
  {
    tripId: "t-lko-del-02",
    busId: "b-013",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.33,
    speed: 0,
    fillRatio: 0.88,
    status: "boarding",
  },
  {
    tripId: "t-lko-del-03",
    busId: "b-014",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.52,
    speed: 68,
    fillRatio: 0.42,
    status: "running",
  },
  {
    tripId: "t-lko-del-04",
    busId: "b-015",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.74,
    speed: 45,
    fillRatio: 1.12,
    status: "delayed",
  },
  {
    tripId: "t-lko-del-05",
    busId: "b-016",
    routeId: "r-lko-del",
    direction: "forward",
    progress: 0.91,
    speed: 55,
    fillRatio: 0.62,
    status: "running",
  },

  // ==========================================
  // Delhi → Lucknow (r-del-lko)
  // Midpoint is Kanpur (progress ~0.65)
  // ==========================================
  {
    tripId: "t-del-lko-01",
    busId: "b-017",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.22,
    speed: 54,
    fillRatio: 0.65,
    status: "running",
  },
  {
    tripId: "t-del-lko-02",
    busId: "b-018",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.48,
    speed: 60,
    fillRatio: 0.34,
    status: "running",
  },
  {
    tripId: "t-del-lko-03",
    busId: "b-019",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.63,
    speed: 0,
    fillRatio: 0.92,
    status: "boarding",
  },
  {
    tripId: "t-del-lko-04",
    busId: "b-020",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.78,
    speed: 52,
    fillRatio: 0.48,
    status: "running",
  },
  {
    tripId: "t-del-lko-05",
    busId: "b-021",
    routeId: "r-del-lko",
    direction: "forward",
    progress: 0.93,
    speed: 38,
    fillRatio: 1.05,
    status: "delayed",
  },

  // ==========================================
  // 3. Delhi → Prayagraj (r-del-alld)
  // Midpoint is Agra (progress ~0.35)
  // ==========================================
  {
    tripId: "t-del-alld-01",
    busId: "b-022",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.11,
    speed: 50,
    fillRatio: 0.48,
    status: "running",
  },
  {
    tripId: "t-del-alld-02",
    busId: "b-023",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.32,
    speed: 0,
    fillRatio: 0.95,
    status: "boarding",
  },
  {
    tripId: "t-del-alld-03",
    busId: "b-024",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.58,
    speed: 64,
    fillRatio: 0.38,
    status: "running",
  },
  {
    tripId: "t-del-alld-04",
    busId: "b-025",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.81,
    speed: 42,
    fillRatio: 1.18,
    status: "delayed",
  },
  {
    tripId: "t-del-alld-05",
    busId: "b-026",
    routeId: "r-del-alld",
    direction: "forward",
    progress: 0.95,
    speed: 58,
    fillRatio: 0.72,
    status: "running",
  },

  // ==========================================
  // Prayagraj → Delhi (r-alld-del)
  // Midpoint is Agra (progress ~0.65)
  // ==========================================
  {
    tripId: "t-alld-del-01",
    busId: "b-027",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.18,
    speed: 62,
    fillRatio: 0.54,
    status: "running",
  },
  {
    tripId: "t-alld-del-02",
    busId: "b-028",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.42,
    speed: 58,
    fillRatio: 0.88,
    status: "running",
  },
  {
    tripId: "t-alld-del-03",
    busId: "b-029",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.63,
    speed: 0,
    fillRatio: 0.41,
    status: "boarding",
  },
  {
    tripId: "t-alld-del-04",
    busId: "b-030",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.79,
    speed: 55,
    fillRatio: 0.66,
    status: "running",
  },
  {
    tripId: "t-alld-del-05",
    busId: "b-031",
    routeId: "r-alld-del",
    direction: "forward",
    progress: 0.92,
    speed: 36,
    fillRatio: 1.12,
    status: "delayed",
  },

  // Legacy compatibility seeds
  {
    tripId: "t-legacy-01",
    busId: "b-032",
    routeId: "r-alld-mzp",
    direction: "forward",
    progress: 0.42,
    speed: 48,
    fillRatio: 0.64,
    status: "running",
  },
  {
    tripId: "t-legacy-02",
    busId: "b-033",
    routeId: "r-alld-vns",
    direction: "forward",
    progress: 0.35,
    speed: 0,
    fillRatio: 0.82,
    status: "boarding",
  },
  {
    tripId: "t-legacy-03",
    busId: "b-034",
    routeId: "r-mzp-vns",
    direction: "forward",
    progress: 0.58,
    speed: 52,
    fillRatio: 0.45,
    status: "running",
  }
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

    const occupied = Math.min(
      bus.totalSeats,
      Math.round(bus.totalSeats * Math.min(1, s.fillRatio)),
    );
    const standing = s.fillRatio > 1 ? Math.round(bus.totalSeats * (s.fillRatio - 1)) : 0;
    const vacant = bus.totalSeats - occupied;

    const eta: Record<string, string> = {};
    for (let i = segIndex + 1; i < stops.length; i++) {
      const minutesAhead = (i - segIndex) * 15 + (s.status === "delayed" ? 12 : 0);
      eta[stops[i].id] = new Date(now + minutesAhead * 60_000).toISOString();
    }

    return {
      tripId: s.tripId,
      busId: s.busId,
      operatorId: bus.operatorId,
      routeId: route.id,
      direction: s.direction,
      scheduledStart: new Date(now - 45 * 60_000).toISOString(),
      scheduledEnd: new Date(now + 90 * 60_000).toISOString(),
      status: s.status,
      gps: {
        latitude: lat,
        longitude: lng,
        heading,
        speed: s.speed,
        gpsAccuracy: 5 + Math.random() * 6,
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
      punctualityScore: 70 + Math.round(Math.random() * 25),
      averageDelayMin: s.status === "delayed" ? 15 : 2 + Math.round(Math.random() * 3),
    };
  });
}
