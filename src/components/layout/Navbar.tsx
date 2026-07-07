import { Link, useRouterState } from "@tanstack/react-router";
import { Radar, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch } from "@/components/search/GlobalSearch";

const NAV = [
  { to: "/routes", label: "Routes", section: "features" },
  { to: "/about", label: "About", section: "how" },
  { to: "/contact", label: "Support", section: "support" },
] as const;

const SECTION_IDS = ["features", "how", "support"] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome || typeof window === "undefined") return;
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.6] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
                  {item.label}
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
            to="/radar"
            className="hidden items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-xs font-semibold text-brand-foreground shadow-md shadow-brand/25 transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            <Radar className="h-3.5 w-3.5" aria-hidden />
            Live Radar
          </Link>
          <ThemeToggle />
          <button
            aria-label="Profile"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-card text-foreground transition-colors hover:bg-accent"
          >
            <User className="h-4 w-4" />
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
    </header>
  );
}
