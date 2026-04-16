import { ArrowRight } from "lucide-react";

interface RoleSelectionProps {
  onSelect: (view: "looker" | "referrer") => void;
}

const RoleSelection = ({ onSelect }: RoleSelectionProps) => {
  return (
    <main className="container max-w-4xl py-24 md:py-32">
      <div className="text-center mb-16 md:mb-20">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-5">
          Your network is more powerful
          <br className="hidden md:block" /> than you know.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Refr turns warm introductions into a system — and rewards the people who make them.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
        <button
          onClick={() => onSelect("looker")}
          className="group relative text-left p-8 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-4">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Looker
            </span>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              I'm looking for my next role
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Build your profile and let the people who know you best open doors.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => onSelect("referrer")}
          className="group relative text-left p-8 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-4">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Referrer
            </span>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              I know great people and want to refer them
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Spot opportunities for people in your network — and get rewarded when they land.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </main>
  );
};

export default RoleSelection;
