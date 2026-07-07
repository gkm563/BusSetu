import { useCallback, useEffect, useState } from "react";

export interface RecentSearch {
  from: string;
  to: string;
  via?: string;
  ts: number;
}

const KEY = "bussetu.recentSearches";
const MAX = 5;

function read(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearch[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [items, setItems] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const push = useCallback((entry: Omit<RecentSearch, "ts">) => {
    if (!entry.from && !entry.to) return;
    setItems((prev) => {
      const next: RecentSearch[] = [
        { ...entry, ts: Date.now() },
        ...prev.filter(
          (r) =>
            r.from.trim().toLowerCase() !== entry.from.trim().toLowerCase() ||
            r.to.trim().toLowerCase() !== entry.to.trim().toLowerCase(),
        ),
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
