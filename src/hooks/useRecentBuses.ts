import { useCallback, useEffect, useState } from "react";

export interface RecentBus {
  tripId: string;
  busNumber: string;
  ts: number;
}

const KEY = "bussetu.recentBuses";
const MAX = 5;

function read(): RecentBus[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentBus[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentBuses() {
  const [items, setItems] = useState<RecentBus[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const push = useCallback((tripId: string, busNumber: string) => {
    if (!tripId || !busNumber) return;
    setItems((prev) => {
      const next: RecentBus[] = [
        { tripId, busNumber, ts: Date.now() },
        ...prev.filter((r) => r.tripId !== tripId),
      ].slice(0, MAX);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { items, push, clear };
}
