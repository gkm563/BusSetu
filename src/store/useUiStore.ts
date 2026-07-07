import { create } from "zustand";

const DARK_KEY = "bussetu.darkMode";

function readInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DARK_KEY);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyDark(v: boolean) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", v);
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(DARK_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }
}

export interface RadarFilters {
  operatorKinds: Set<"government" | "private">;
  amenities: Set<"ac" | "electric" | "luxury" | "mini" | "women_friendly">;
  seatsAvailable: boolean;
  lowCrowd: boolean;
  nearbyOnly: boolean;
}

export interface RouteQuery {
  from: string;
  to: string;
  via: string;
  /** ISO string, optional. Future-ready: engine treats as informational. */
  departAt?: string;
  active: boolean;
}

interface UiStoreState {
  selectedTripId: string | null;
  hoveredTripId: string | null;
  focusedRouteId: string | null;
  routeQuery: RouteQuery;
  filters: RadarFilters;
  discoveryRadiusKm: number;
  timelineOpen: boolean;
  darkMode: boolean;

  selectTrip: (id: string | null) => void;
  hoverTrip: (id: string | null) => void;
  focusRoute: (id: string | null) => void;
  setRouteQuery: (q: Partial<RouteQuery>) => void;
  clearRouteQuery: () => void;
  toggleOperatorKind: (k: "government" | "private") => void;
  toggleAmenity: (a: RadarFilters["amenities"] extends Set<infer T> ? T : never) => void;
  toggleSeats: () => void;
  toggleLowCrowd: () => void;
  toggleNearby: () => void;
  clearFilters: () => void;
  setDiscoveryRadius: (km: number) => void;
  openTimeline: () => void;
  closeTimeline: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;
}

function emptyFilters(): RadarFilters {
  return {
    operatorKinds: new Set(),
    amenities: new Set(),
    seatsAvailable: false,
    lowCrowd: false,
    nearbyOnly: false,
  };
}

export const useUiStore = create<UiStoreState>((set, get) => ({
  selectedTripId: null,
  hoveredTripId: null,
  focusedRouteId: null,
  routeQuery: { from: "", to: "", via: "", departAt: undefined, active: false },
  filters: emptyFilters(),
  discoveryRadiusKm: 5,
  timelineOpen: false,
  darkMode: readInitialDarkMode(),

  selectTrip: (id) => set({ selectedTripId: id }),
  hoverTrip: (id) => set({ hoveredTripId: id }),
  focusRoute: (id) => set({ focusedRouteId: id }),
  setRouteQuery: (q) => set({ routeQuery: { ...get().routeQuery, ...q, active: true } }),
  clearRouteQuery: () =>
    set({
      routeQuery: {
        from: "",
        to: "",
        via: "",
        departAt: undefined,
        active: false,
      },
    }),

  toggleOperatorKind: (k) => {
    const s = new Set(get().filters.operatorKinds);
    if (s.has(k)) {
      s.delete(k);
    } else {
      s.add(k);
    }
    set({ filters: { ...get().filters, operatorKinds: s } });
  },
  toggleAmenity: (a) => {
    const s = new Set(get().filters.amenities);
    if (s.has(a)) {
      s.delete(a);
    } else {
      s.add(a);
    }
    set({ filters: { ...get().filters, amenities: s } });
  },
  toggleSeats: () =>
    set({
      filters: { ...get().filters, seatsAvailable: !get().filters.seatsAvailable },
    }),
  toggleLowCrowd: () => set({ filters: { ...get().filters, lowCrowd: !get().filters.lowCrowd } }),
  toggleNearby: () => set({ filters: { ...get().filters, nearbyOnly: !get().filters.nearbyOnly } }),
  clearFilters: () => set({ filters: emptyFilters() }),
  setDiscoveryRadius: (km) => set({ discoveryRadiusKm: km }),

  openTimeline: () => set({ timelineOpen: true }),
  closeTimeline: () => set({ timelineOpen: false }),

  toggleDarkMode: () => {
    const v = !get().darkMode;
    set({ darkMode: v });
    applyDark(v);
  },
  setDarkMode: (v) => {
    set({ darkMode: v });
    applyDark(v);
  },
}));
