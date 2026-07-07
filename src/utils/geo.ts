// Haversine + polyline utilities for map & interpolation.

const R = 6371; // km

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearingDeg(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const λ1 = toRad(a.lng);
  const λ2 = toRad(b.lng);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Compute cumulative segment distances for a polyline.
 */
export function polylineDistances(polyline: [number, number][]): {
  segments: number[];
  total: number;
} {
  const segments: number[] = [];
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = haversineKm(
      { lat: polyline[i][0], lng: polyline[i][1] },
      { lat: polyline[i + 1][0], lng: polyline[i + 1][1] },
    );
    segments.push(d);
    total += d;
  }
  return { segments, total };
}

/**
 * Interpolate a point along a polyline based on progress ∈ [0, 1].
 * Returns { lat, lng, heading }.
 */
export function interpolateAlongPolyline(
  polyline: [number, number][],
  progress: number,
): { lat: number; lng: number; heading: number } {
  if (polyline.length === 0) return { lat: 0, lng: 0, heading: 0 };
  if (polyline.length === 1) return { lat: polyline[0][0], lng: polyline[0][1], heading: 0 };

  const p = Math.min(1, Math.max(0, progress));
  const { segments, total } = polylineDistances(polyline);
  const target = p * total;

  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    if (acc + segments[i] >= target) {
      const local = segments[i] === 0 ? 0 : (target - acc) / segments[i];
      const a = { lat: polyline[i][0], lng: polyline[i][1] };
      const b = { lat: polyline[i + 1][0], lng: polyline[i + 1][1] };
      return {
        lat: a.lat + (b.lat - a.lat) * local,
        lng: a.lng + (b.lng - a.lng) * local,
        heading: bearingDeg(a, b),
      };
    }
    acc += segments[i];
  }
  const last = polyline[polyline.length - 1];
  const prev = polyline[polyline.length - 2];
  return {
    lat: last[0],
    lng: last[1],
    heading: bearingDeg({ lat: prev[0], lng: prev[1] }, { lat: last[0], lng: last[1] }),
  };
}
