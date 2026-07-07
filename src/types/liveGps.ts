/**
 * Live GPS ping for a trip. This is the wire shape a Driver App or a
 * WebSocket adapter would publish; the store composes it into `Trip` for
 * the UI.
 */
export interface LiveGps {
  tripId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  gpsAccuracy: number;
  timestamp: string;
}
