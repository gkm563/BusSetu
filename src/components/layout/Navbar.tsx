import { Link, useRouterState } from "@tanstack/react-router";
import { Radar, User, ChevronDown, BusFront } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";
import { useTranslation } from "@/hooks/useTranslation";
import { MyBookingsDrawer } from "@/components/panels/MyBookingsDrawer";

const NAV = [
  { to: "/routes", label: "Routes", section: "features" },
  { to: "/search", label: "Live Map", section: "how" },
  { to: "/about", label: "About", section: "support" },
] as const;

const SECTION_IDS = ["features", "how", "support"] as const;

export function Navbar() {
  const { t, language, setLanguage } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const liveCount = useLiveStore((s) => s.tripIdList.length);
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const bookedTicketsCount = useUiStore((s) => s.bookedTickets.length);

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section spy
      let current: string | null = null;
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, section: string) => {
    if (!isHome) return;
    const el = document.getElementById(section);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${section}`);
  };

  // On the homepage the navbar is transparent at the top and blurs on scroll.
  // Everywhere else it's always solid.
  const surface =
    !isHome || scrolled
      ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
      : "border-b border-transparent bg-transparent";

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${surface}`}>
      {isHome && (
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-[60] -translate-y-[150%] rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Skip to content
        </a>
      )}
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[auto_1fr_auto] sm:gap-6">
        <div className="flex min-w-0 items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = isHome ? activeSection === item.section : pathname === item.to;
              const label = item.section === "features" ? t("liveRadar") : item.section === "how" ? t("about") : t("contact");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={(e) => handleNavClick(e, item.section)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="hidden sm:block">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="hidden items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-xs font-semibold text-brand-foreground shadow-md shadow-brand/25 transition-transform hover:scale-[1.03] sm:inline-flex cursor-pointer"
          >
            <BusFront className="h-3.5 w-3.5" aria-hidden />
            Search Buses
            <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wider">
              🟢 {liveCount} Live
            </span>
          </Link>

          {/* Custom Language Dropdown Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="appearance-none rounded-full border border-border/70 bg-card text-foreground text-xs font-semibold pl-3 pr-8 py-2 focus:outline-none hover:bg-accent cursor-pointer"
              title={t("selectLang")}
              aria-label={t("selectLang")}
            >
              <option value="en">🇺🇸 EN</option>
              <option value="hi">🇮🇳 हिन्दी</option>
              <option value="th">🇹🇭 ไทย</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-muted-foreground">
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>

          <ThemeToggle />
          <button
            onClick={() => setBookingsOpen(true)}
            aria-label="My Bookings"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-card text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <User className="h-4 w-4" />
            {bookedTicketsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-brand-foreground ring-2 ring-background">
                {bookedTicketsCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <div
        className={`px-4 py-2 sm:hidden ${
          !isHome || scrolled ? "border-t border-border/60" : "border-t border-transparent"
        }`}
      >
        <GlobalSearch />
      </div>
      <MyBookingsDrawer isOpen={bookingsOpen} onClose={() => setBookingsOpen(false)} />
    </header>
  );
}
