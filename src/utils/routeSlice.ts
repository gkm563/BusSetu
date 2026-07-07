import type { BusRoute } from "@/types/route";
import type { TripDirection } from "@/types/trip";
import { interpolateAlongPolyline } from "./geo";

function directionalPolyline(route: BusRoute, dir: TripDirection): [number, number][] {
  return dir === "forward" ? route.polyline : [...route.polyline].reverse();
}

/**
 * Split a directional route polyline at the given progress ∈ [0, 1].
 * Returns the traveled ("past") portion and the remaining ("upcoming")
 * portion, both ending / beginning exactly at the interpolated point so
 * the two segments meet with no visual gap.
 */
export function splitRouteAtProgress(
  route: BusRoute,
  direction: TripDirection,
  progress: number,
): { past: [number, number][]; upcoming: [number, number][] } {
  const poly = directionalPolyline(route, direction);
  const p = Math.min(1, Math.max(0, progress));
  const cur = interpolateAlongPolyline(poly, p);

  // Find the segment containing the current point.
  const total = poly.reduce((acc, _, i) => {
    if (i === 0) return acc;
    const a = poly[i - 1];
    const b = poly[i];
    return acc + Math.hypot(a[0] - b[0], a[1] - b[1]);
  }, 0);
  const target = p * total;

  const past: [number, number][] = [poly[0]];
  const upcoming: [number, number][] = [];
  let acc = 0;
  let splitIndex = 0;
  for (let i = 1; i < poly.length; i++) {
    const seg = Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]);
    if (acc + seg < target) {
      past.push(poly[i]);
      acc += seg;
      splitIndex = i;
    } else {
      splitIndex = i;
      break;
    }
  }
  past.push([cur.lat, cur.lng]);
  upcoming.push([cur.lat, cur.lng]);
  for (let j = splitIndex; j < poly.length; j++) upcoming.push(poly[j]);

  return { past, upcoming };
}
