import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Globe } from "lucide-react";
import { Logo } from "./Logo";
import { useUiStore } from "@/store/useUiStore";

export function Footer() {
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);

  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div className="space-y-6">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            The world's smartest live bus tracking platform. Every bus, every trip, every seat — on
            one live radar.
          </p>
          
          {/* Download App badges */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Download the App</span>
            <div className="flex flex-wrap gap-2">
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-white hover:bg-slate-850 transition-colors shadow-md w-fit"
              >
                <span className="text-xl leading-none">🤖</span>
                <div className="text-left leading-tight">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Get it on</div>
                  <div className="text-xs font-black">Google Play</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-white hover:bg-slate-850 transition-colors shadow-md w-fit"
              >
                <span className="text-xl leading-none">🍎</span>
                <div className="text-left leading-tight">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Download on the</div>
                  <div className="text-xs font-black">App Store</div>
                </div>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SocialLink label="Twitter" href="https://twitter.com/gkm563" icon={<Twitter className="h-4 w-4" />} />
            <SocialLink label="GitHub" href="https://github.com/gkm563" icon={<Github className="h-4 w-4" />} />
            <SocialLink label="LinkedIn" href="https://linkedin.com/in/gkm563" icon={<Linkedin className="h-4 w-4" />} />
          </div>
        </div>

        <FooterCol
          title="Product"
          links={[
            { label: "Pricing", to: "/pricing" },
            { label: "BusSetuDesktop", to: "/desktop" },
            { label: "BusSetuMobile", to: "/mobile" },
            { label: "Developers", to: "/developers" },
            { label: "Features", to: "/features" },
          ]}
        />
        <FooterCol
          title="Solutions"
          links={[
            { label: "Business", to: "/business" },
            { label: "Education", to: "/education" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: "About Us", to: "/about" },
            { label: "Story", to: "/story" },
            { label: "Blog", to: "/blog" },
            { label: "Press", to: "/press" },
            { label: "Legal & Privacy", to: "/legal" },
            { label: "Contact", to: "/contact" },
          ]}
        />
        
        {/* Quick settings/language column */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">
            Settings
          </h4>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 w-fit shadow-sm">
            <Globe className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0"
              aria-label="Select language"
            >
              <option value="en">English (US)</option>
              <option value="hi">हिंदी (IN)</option>
              <option value="th">ไทย (TH)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© BusSetu 2026 ® - Your bus. All rights reserved.</span>
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/60 px-3.5 py-1.5 rounded-full shadow-sm">
            <div className="h-5 w-5 rounded-full overflow-hidden shrink-0 border border-white">
              <img src="/developer-gkm.jpg" alt="GKM" className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-slate-600">
              Developer by <a href="https://gkm563.github.io/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-black">GKM</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ label, href, icon }: { label: string; href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
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
