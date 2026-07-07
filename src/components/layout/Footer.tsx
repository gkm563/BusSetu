import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            The world's smartest live bus tracking platform. Every bus, every trip, every seat — on
            one live radar.
          </p>
          <div className="flex items-center gap-2">
            <SocialLink label="Twitter" icon={<Twitter className="h-4 w-4" />} />
            <SocialLink label="GitHub" icon={<Github className="h-4 w-4" />} />
            <SocialLink label="LinkedIn" icon={<Linkedin className="h-4 w-4" />} />
          </div>
        </div>
        <FooterCol
          title="Product"
          links={[
            { label: "Live Radar", to: "/radar" },
            { label: "Routes", to: "/routes" },
            { label: "Nearby Buses", to: "/radar" },
            { label: "Smart Filters", to: "/radar" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: "About", to: "/about" },
            { label: "Support", to: "/contact" },
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            { label: "Help center", to: "/contact" },
            { label: "Contact us", to: "/contact" },
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            { label: "Privacy", to: "/about" },
            { label: "Terms", to: "/about" },
          ]}
        />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} BusSetu. All rights reserved.</span>
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            All systems live
          </span>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:border-brand/50 hover:bg-brand/10 hover:text-brand"
    >
      {icon}
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={`${title}-${l.label}`}>
            <Link
              to={l.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
