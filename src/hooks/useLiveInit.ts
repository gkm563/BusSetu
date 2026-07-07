import { useEffect } from "react";
import { useLiveStore } from "@/store/useLiveStore";

/**
 * Subscribes to the trip service on mount. Idempotent — safe to call in
 * multiple components.
 */
export function useLiveInit() {
  const init = useLiveStore((s) => s.init);
  useEffect(() => {
    const unsub = init();
    return unsub;
  }, [init]);
}
