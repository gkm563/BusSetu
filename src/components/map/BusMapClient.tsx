import { useEffect, useState } from "react";
import { useLiveInit } from "@/hooks/useLiveInit";

/**
 * Client-only wrapper around BusMap. React-Leaflet touches `window` and
 * Leaflet needs a real DOM, so we mount it only after the client hydrates.
 */
export function BusMapClient() {
  useLiveInit();
  const [mounted, setMounted] = useState(false);
  const [Cmp, setCmp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    setMounted(true);
    import("./BusMap").then((m) => setCmp(() => m.BusMap));
  }, []);

  if (!mounted || !Cmp) {
    return (
      <div className="grid h-full w-full place-items-center bg-muted/30">
        <div className="flex items-center gap-3 rounded-full bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
          Loading live map…
        </div>
      </div>
    );
  }

  return <Cmp />;
}
