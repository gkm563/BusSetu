import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { useUiStore } from "@/store/useUiStore";

export function ThemeToggle() {
  const darkMode = useUiStore((s) => s.darkMode);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);
  const setDarkMode = useUiStore((s) => s.setDarkMode);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Hydrate <html> class from persisted preference (SSR-safe).
    const raw = window.localStorage.getItem("bussetu.darkMode");
    const desired = raw === "1"; // Default to light mode (false) if not explicitly set to "1"
    if (desired !== darkMode) {
      setDarkMode(desired);
    } else {
      document.documentElement.classList.toggle("dark", desired);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = darkMode ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={label}
      aria-pressed={darkMode}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-card text-foreground transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {darkMode ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
