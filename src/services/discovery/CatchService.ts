import type { LiveBusView } from "@/types/view";
import type { UserLocation } from "@/hooks/useGeolocation";
import { haversineKm } from "@/utils/geo";

export interface CatchInput {
  view: LiveBusView;
  user: UserLocation;
  walkingSpeedKmh?: number;
  /** Buffer in seconds — user needs to arrive this early. */
  bufferSec?: number;
  targetStopId?: string;
}

export interface CatchAssessment {
  tripId: string;
  targetStopId: string;
  targetStopName: string;
  /** Km between user and target stop (straight-line ≈ walking). */
  walkingKm: number;
  walkingSec: number;
  /** ETA of bus to target stop, in seconds from now. */
  busEtaSec: number;
  /** Positive = user arrives before bus; negative = bus arrives first. */
  slackSec: number;
  catchable: boolean;
  confidence: "high" | "medium" | "low";
}

/**
 * The Catch-This-Bus intelligence engine. Encapsulates all timing math so
 * it can later be swapped for a routed walking-time API without touching
 * the UI.
 */
export const CatchService = {
  assess({
    view,
    user,
    walkingSpeedKmh = 4.8,
    bufferSec = 30,
    targetStopId,
  }: CatchInput): CatchAssessment | null {
    const { trip, route } = view;
    const stops = trip.direction === "forward" ? route.stops : [...route.stops].reverse();
    // Default target: next stop the bus will visit.
    const stopId = targetStopId ?? trip.nextStopId ?? stops[0]?.id;
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return null;

    const walkingKm = haversineKm(user, { lat: stop.lat, lng: stop.lng });
    const walkingSec = Math.round((walkingKm / walkingSpeedKmh) * 3600);

    const etaIso = trip.eta[stop.id];
    let busEtaSec: number;
    if (etaIso) {
      busEtaSec = Math.max(0, Math.round((new Date(etaIso).getTime() - Date.now()) / 1000));
    } else {
      // Fallback: assume 30 km/h average until we reach that stop.
      busEtaSec = Math.round((walkingKm / 30) * 3600);
    }

    const slackSec = busEtaSec - walkingSec - bufferSec;
    const catchable = slackSec >= 0;
    const confidence: CatchAssessment["confidence"] =
      Math.abs(slackSec) < 45 ? "low" : Math.abs(slackSec) < 120 ? "medium" : "high";

    return {
      tripId: trip.tripId,
      targetStopId: stop.id,
      targetStopName: stop.name,
      walkingKm,
      walkingSec,
      busEtaSec,
      slackSec,
      catchable,
      confidence,
    };
  },

  /** Given a list of nearby buses, return the next best catchable option. */
  recommendAlternative(
    candidates: LiveBusView[],
    user: UserLocation,
    exclude: string,
  ): { view: LiveBusView; assessment: CatchAssessment } | null {
    const scored = candidates
      .filter((c) => c.trip.tripId !== exclude)
      .map((c) => ({ view: c, assessment: CatchService.assess({ view: c, user }) }))
      .filter(
        (r): r is { view: LiveBusView; assessment: CatchAssessment } =>
          r.assessment != null && r.assessment.catchable,
      )
      .sort(
        (a, b) =>
          a.assessment.busEtaSec - b.assessment.busEtaSec ||
          b.view.trip.passenger.vacantSeats - a.view.trip.passenger.vacantSeats,
      );
    return scored[0] ?? null;
  },
};
