export interface Stop {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  /** Optional catalog-wide sequence. Per-route sequence is derived from
   *  BusRoute.stops[] ordering. */
  sequence?: number;
}
