export type BusAmenity = "ac" | "electric" | "luxury" | "mini" | "women_friendly";

export type BusType = "standard" | "ac" | "sleeper" | "luxury" | "mini" | "electric";

export interface Bus {
  id: string;
  busNumber: string;
  operatorId: string;
  totalSeats: number;
  amenities: BusAmenity[];
  /** Government-issued vehicle registration plate. */
  registrationNumber?: string;
  busType?: BusType;
  /** Number of seats reserved for women. */
  womenSeats?: number;
  /** Max standing passengers allowed in addition to seats. */
  standingCapacity?: number;
  /** Human-readable feature list, e.g. "USB", "GPS", "CCTV". */
  features?: string[];
}
