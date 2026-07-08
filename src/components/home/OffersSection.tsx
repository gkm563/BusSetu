import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy } from "lucide-react";

export function OffersSection() {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Bus", "Train", "HOTEL"];

  const offers = [
    {
      type: "Bus",
      title: "Save up to Rs 250 on bus tickets",
      validity: "Valid till 31 Jul",
      code: "FIRST",
      bg: "bg-gradient-to-r from-blue-600 to-blue-800",
    },
    {
      type: "Bus",
      title: "Save up to Rs 300 on AP, TS routes",
      validity: "Valid till 31 Jul",
      code: "SUPERHIT",
      bg: "bg-gradient-to-r from-red-500 to-red-700",
    },
    {
      type: "Train",
      title: "Flat Rs 60 off on train tickets",
      validity: "Valid till 31 Jul",
      code: "RAIL60",
      bg: "bg-gradient-to-r from-purple-500 to-purple-700",
    },
    {
      type: "HOTEL",
      title: "Save up to Rs 500 on hotels",
      validity: "Valid till 31 Jul",
      code: "STAY500",
      bg: "bg-gradient-to-r from-orange-500 to-orange-700",
    }
  ];

  const filteredOffers = activeTab === "All" ? offers : offers.filter(o => o.type === activeTab);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 bg-card rounded-[32px] mt-[-30px] relative z-10 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Offers for you</h2>
        <Link to="/" className="text-brand font-semibold hover:underline">View All</Link>
      </div>

      <div className="flex items-center gap-6 border-b border-border/60 mb-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === tab ? "text-brand" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x flex-nowrap scrollbar-hide">
        {filteredOffers.map((offer, idx) => (
          <div key={idx} className={`snap-start shrink-0 w-[320px] h-[160px] rounded-2xl p-4 text-white flex gap-4 ${offer.bg} hover:-translate-y-1 transition-transform cursor-pointer shadow-lg shadow-black/10`}>
            <div className="w-[88px] h-[88px] shrink-0 bg-white/20 rounded-xl overflow-hidden flex items-center justify-center border border-white/20">
              {/* Fallback pattern */}
              <div className="w-full h-full opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" style={{ backgroundImage: "radial-gradient(circle, white 2px, transparent 2px)", backgroundSize: "12px 12px" }} />
            </div>
            <div className="flex flex-col flex-1 h-full">
              <span className="text-[10px] font-bold bg-white/20 w-fit px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                {offer.type}
              </span>
              <h3 className="font-bold text-sm leading-tight mb-1">{offer.title}</h3>
              <p className="text-[11px] text-white/80 mb-3">{offer.validity}</p>
              
              <div className="mt-auto flex items-center gap-2">
                <div className="border border-dashed border-white/50 bg-white/10 px-2 py-1 rounded font-mono text-xs font-bold uppercase tracking-wider">
                  {offer.code}
                </div>
                <button className="p-1 hover:bg-white/20 rounded-full transition-colors" title="Copy code">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
