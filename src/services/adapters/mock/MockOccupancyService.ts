import type { OccupancyService } from "@/services/contracts/OccupancyService";
import type { Occupancy } from "@/types/occupancy";
import type { Unsubscribe } from "@/types/events";
import { MockTripAdapter } from "./MockTripAdapter";
import { MockBusService } from "./MockBusService";

async function compose(tripId: string): Promise<Occupancy | null> {
  const trip = await MockTripAdapter.getTrip(tripId);
  if (!trip) return null;
  const bus = await MockBusService.getBus(trip.busId);
  if (!bus) return null;
  const total = bus.totalSeats;
  const onboard = trip.passenger.occupiedSeats + trip.passenger.standingPassengers;
  return {
    tripId,
    totalSeats: total,
    occupiedSeats: trip.passenger.occupiedSeats,
    vacantSeats: trip.passenger.vacantSeats,
    standingPassengers: trip.passenger.standingPassengers,
    occupancyPercentage: total === 0 ? 0 : Math.round((onboard / total) * 100),
  };
}

export const MockOccupancyService: OccupancyService = {
  async getOccupancy(tripId) {
    return compose(tripId);
  },
  subscribeToOccupancy(tripId, cb): Unsubscribe {
    let lastSig = "";
    const push = () => {
      compose(tripId).then((o) => {
        if (!o) return;
        const sig = `${o.occupiedSeats}/${o.standingPassengers}`;
        if (sig === lastSig) return;
        lastSig = sig;
        cb(o);
      });
    };
    return MockTripAdapter.subscribeToTripUpdates(tripId, (event) => {
      if (event.type === "seats" || event.type === "snapshot") push();
    });
  },
};
