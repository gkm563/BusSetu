import type { TripStatus } from "./trip";

export interface TripPositionUpdate {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  routeProgress: number;
  gpsAccuracy: number;
  lastUpdated: string;
  currentStopId: string | null;
  nextStopId: string | null;
  eta: Record<string, string>;
}

export interface SeatUpdate {
  occupiedSeats: number;
  standingPassengers: number;
  vacantSeats: number;
  lastUpdated: string;
}

export interface TripStatusUpdate {
  status: TripStatus;
  lastUpdated: string;
}

export type TripEvent =
  | { type: "position"; tripId: string; patch: TripPositionUpdate }
  | {
      type: "positions";
      updates: { tripId: string; patch: TripPositionUpdate }[];
    }
  | { type: "seats"; tripId: string; patch: SeatUpdate }
  | {
      type: "seats-bulk";
      updates: { tripId: string; patch: SeatUpdate }[];
    }
  | { type: "status"; tripId: string; patch: TripStatusUpdate }
  | { type: "snapshot"; trips: import("./trip").Trip[] };

export type Unsubscribe = () => void;
