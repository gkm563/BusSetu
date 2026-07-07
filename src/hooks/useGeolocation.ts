import { useEffect, useState } from "react";

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type GeoStatus = "idle" | "prompt" | "granted" | "denied" | "error" | "demo";

// Prayagraj Civil Lines — a sensible default so the discovery engine can
// run even before the user grants location.
const DEMO_LOCATION: UserLocation = { lat: 25.4589, lng: 81.8462 };

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");

  function request() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("prompt");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  // Fallback demo location if the user hasn't granted (or has denied)
  // access after a short delay. The engine always has a coordinate to
  // work with.
  useEffect(() => {
    if (location) return;
    const t = window.setTimeout(() => {
      setLocation((prev) => prev ?? DEMO_LOCATION);
      setStatus((prev) => (prev === "granted" || prev === "prompt" ? prev : "demo"));
    }, 1200);
    return () => window.clearTimeout(t);
  }, [location]);

  const usingDemo = status === "demo" || status === "denied" || status === "error";
  return { location, status, request, usingDemo };
}
