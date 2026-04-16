import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface RoleSelectionProps {
  onSelect: (view: "looker" | "referrer") => void;
}

const RoleSelection = ({ onSelect }: RoleSelectionProps) => {
  return (
    <main className="relative overflow-hidden">
      {/* Subtle gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[120px] animate-glow pointer-events-none" />

      <div className="container max-w-4xl py-32 md:py-44 relative">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-semibold tracking-tight text-foreground leading-[1.05] mb-6">
            Your network is more
            <br />
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
              powerful than you know.
            </span>
          </h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Refr turns warm introductions into a system — and rewards the people who make them.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            onClick={() => onSelect("looker")}
            className="group text-left p-7 rounded-2xl bg-card/40 border border-border/50 hover:bg-card/70 hover:border-border transition-all duration-500"
          >
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-4">
              Looker
            </span>
            <h2 className="text-xl font-semibold text-foreground mb-2 leading-snug">
              I'm looking for my next role
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Build your profile and let the people who know you best open doors.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-accent transition-colors duration-300">
              <span className="font-medium">Get started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>

          <button
            onClick={() => onSelect("referrer")}
            className="group text-left p-7 rounded-2xl bg-card/40 border border-border/50 hover:bg-card/70 hover:border-border transition-all duration-500"
          >
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-4">
              Referrer
            </span>
            <h2 className="text-xl font-semibold text-foreground mb-2 leading-snug">
              I know great people and want to refer them
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Spot opportunities for people in your network — and get rewarded when they land.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-accent transition-colors duration-300">
              <span className="font-medium">Get started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>
        </motion.div>
      </div>
    </main>
  );
};

export default RoleSelection;
