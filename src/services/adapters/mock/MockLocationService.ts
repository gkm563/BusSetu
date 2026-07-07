import type { LocationService } from "@/services/contracts/LocationService";
import type { LiveGps } from "@/types/liveGps";
import type { LiveBusView } from "@/types/view";
import type { Unsubscribe } from "@/types/events";
import { MockTripAdapter } from "./MockTripAdapter";
import { MockBusService } from "./MockBusService";
import { MockOperatorService } from "./MockOperatorService";
import { MockRouteService } from "./MockRouteService";
import { haversineKm } from "@/utils/geo";

function tripToGps(t: {
  tripId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  gpsAccuracy: number;
  lastUpdated: string;
}): LiveGps {
  return {
    tripId: t.tripId,
    latitude: t.latitude,
    longitude: t.longitude,
    speed: t.speed,
    heading: t.heading,
    gpsAccuracy: t.gpsAccuracy,
    timestamp: t.lastUpdated,
  };
}

export const MockLocationService: LocationService = {
  async getLiveGps(tripId) {
    const t = await MockTripAdapter.getTrip(tripId);
    return t ? tripToGps(t) : null;
  },
  async getNearbyBuses(lat, lng, radiusKm) {
    const [trips, buses, operators, routes] = await Promise.all([
      MockTripAdapter.listActiveTrips(),
      MockBusService.listBuses(),
      MockOperatorService.listOperators(),
      MockRouteService.listRoutes(),
    ]);
    const bMap = new Map(buses.map((b) => [b.id, b]));
    const oMap = new Map(operators.map((o) => [o.id, o]));
    const rMap = new Map(routes.map((r) => [r.id, r]));
    const out: LiveBusView[] = [];
    for (const trip of trips) {
      const d = haversineKm({ lat, lng }, { lat: trip.latitude, lng: trip.longitude });
      if (d > radiusKm) continue;
      const bus = bMap.get(trip.busId);
      const operator = oMap.get(trip.operatorId);
      const route = rMap.get(trip.routeId);
      if (!bus || !operator || !route) continue;
      out.push({ trip, bus, operator, route });
    }
    return out.sort(
      (a, b) =>
        haversineKm({ lat, lng }, { lat: a.trip.latitude, lng: a.trip.longitude }) -
        haversineKm({ lat, lng }, { lat: b.trip.latitude, lng: b.trip.longitude }),
    );
  },
  subscribeToTripLocation(tripId, cb): Unsubscribe {
    return MockTripAdapter.subscribeToTripUpdates(tripId, (event) => {
      if (event.type === "position") {
        cb({
          tripId,
          latitude: event.patch.latitude,
          longitude: event.patch.longitude,
          speed: event.patch.speed,
          heading: event.patch.heading,
          gpsAccuracy: event.patch.gpsAccuracy,
          timestamp: event.patch.lastUpdated,
        });
      } else if (event.type === "snapshot" && event.trips[0]) {
        cb(tripToGps(event.trips[0]));
      }
    });
  },
};
