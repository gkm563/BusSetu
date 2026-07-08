import { motion } from "framer-motion";
import { RouteSearchPanel } from "@/components/panels/RouteSearchPanel";

export function Hero() {
  return (
    <section className="relative w-full pt-20 pb-32 md:pt-32 md:pb-40 flex flex-col items-center justify-start text-center min-h-[500px]">
      {/* Scenic Background (RedBus style) */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-b from-sky-100 to-background dark:from-sky-950 dark:to-background">
        {/* Abstract hills using border-radius */}
        <div className="absolute bottom-0 w-[150%] h-[300px] left-[-25%] rounded-[100%] bg-brand/5" />
        <div className="absolute bottom-0 w-[120%] h-[200px] right-[-10%] rounded-[100%] bg-brand/10" />
        <div className="absolute bottom-0 w-full h-[100px] bg-border/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full px-4"
      >
        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          India's No. 1 online <br className="hidden md:block" />
          bus ticket booking site
        </h1>
        <p className="mt-4 text-slate-500 font-semibold text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          India's only bus tracking freely and booking anytime anywhere anyone
        </p>

        <div className="mt-12 w-full">
          <RouteSearchPanel variant="horizontal" />
        </div>
      </motion.div>
    </section>
  );
}
