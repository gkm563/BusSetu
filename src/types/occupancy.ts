/**
 * Denormalized occupancy snapshot for a single trip. Derived by
 * OccupancyService from the underlying Trip + Bus.
 */
export interface Occupancy {
  tripId: string;
  totalSeats: number;
  occupiedSeats: number;
  vacantSeats: number;
  standingPassengers: number;
  /** 0..100+ (values above 100 indicate standing over seat capacity). */
  occupancyPercentage: number;
}
