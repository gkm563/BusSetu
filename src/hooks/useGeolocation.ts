import { useEffect, useState, useMemo } from "react";
import { useUiStore } from "@/store/useUiStore";

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type GeoStatus = "idle" | "prompt" | "granted" | "denied" | "error" | "demo";

// Prayagraj Civil Lines — default
const DEFAULT_DEMO: UserLocation = { lat: 25.4589, lng: 81.8462 };
// Pratapgarh — midpoint of Prayagraj ↔ Lucknow
const DEMO_LKO_ALLD: UserLocation = { lat: 25.8975, lng: 81.9500 };
// Kanpur — midpoint of Lucknow ↔ Delhi
const DEMO_LKO_DEL: UserLocation = { lat: 26.4499, lng: 80.3319 };
// Agra — midpoint of Delhi ↔ Prayagraj
const DEMO_DEL_ALLD: UserLocation = { lat: 27.1767, lng: 78.0081 };

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const routeQuery = useUiStore((s) => s.routeQuery);

  const activeDemoLocation = useMemo(() => {
    const from = (routeQuery.from || "").toLowerCase();
    const to = (routeQuery.to || "").toLowerCase();

    if (
      (from.includes("prayagraj") && to.includes("lucknow")) ||
      (from.includes("lucknow") && to.includes("prayagraj"))
    ) {
      return DEMO_LKO_ALLD;
    }
    if (
      (from.includes("lucknow") && to.includes("delhi")) ||
      (from.includes("delhi") && to.includes("lucknow"))
    ) {
      return DEMO_LKO_DEL;
    }
    if (
      (from.includes("delhi") && to.includes("prayagraj")) ||
      (from.includes("prayagraj") && to.includes("delhi"))
    ) {
      return DEMO_DEL_ALLD;
    }
    return DEFAULT_DEMO;
  }, [routeQuery.from, routeQuery.to]);

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
  // access after a short delay.
  useEffect(() => {
    if (status === "granted") return;
    setLocation(activeDemoLocation);
    setStatus("demo");
  }, [activeDemoLocation, status]);

  const usingDemo = status === "demo" || status === "denied" || status === "error";
  return { location, status, request, usingDemo };
}
