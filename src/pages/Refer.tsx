import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, GraduationCap, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { matchLookers, type LookerMatch } from "@/lib/matching";

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const init = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold shrink-0 uppercase">
      {init}
    </div>
  );
}

const REASON_STYLES: Record<string, string> = {
  "Target role match": "bg-accent/10 text-accent border-accent/20",
  "Same industry":     "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Confirmed connection": "bg-muted text-muted-foreground border-border/60",
};

function MatchCard({ match, index }: { match: LookerMatch; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-6">
        {/* Top row */}
        <div className="flex items-start gap-4">
          <Initials name={match.name} />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">{match.name}</p>
            {match.recent_work && (
              <p className="text-sm text-muted-foreground truncate">
                {match.recent_work.job_title}
                {match.recent_work.company_name ? ` · ${match.recent_work.company_name}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Target role + seniority */}
        {(match.profile.target_role || match.profile.seniority) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground">
              Looking for{" "}
              <span className="font-medium">
                {[match.profile.seniority, match.profile.target_role]
                  .filter(Boolean)
                  .join(" ")}
              </span>
            </span>
          </div>
        )}

        {/* Industries */}
        {match.profile.industries?.length > 0 && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <GraduationCap className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              {match.profile.industries.join(", ")}
            </span>
          </div>
        )}

        {/* Match reasons */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {match.match_reasons.map((reason) => (
            <Badge
              key={reason}
              variant="outline"
              className={`text-[11px] font-medium border ${REASON_STYLES[reason] ?? "bg-muted text-muted-foreground border-border/60"}`}
            >
              {reason}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">
          <Button
            className="gap-2 rounded-full px-5 bg-accent text-accent-foreground hover:bg-accent/90 text-sm"
            onClick={() => setExpanded((v) => !v)}
          >
            <Send className="w-3.5 h-3.5" />
            {expanded ? "Close" : "Refer this person"}
          </Button>
        </div>
      </div>

      {/* Expanded referral composer (placeholder for now) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="p-6 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Referral details
              </p>
              <p className="text-sm text-muted-foreground">
                Referral composer coming soon. You'll be able to write your vouch, add the hiring
                manager's email, and send directly from here.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const Refer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const roleSignal = searchParams.get("role_signal") ?? "";

  const [matches, setMatches] = useState<LookerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await matchLookers(user.id, roleSignal);
        setMatches(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id, roleSignal]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex h-12 items-center justify-between">
          <Link to="/dashboard" className="text-lg font-semibold tracking-tight text-foreground">
            Refr
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </header>

      <main className="pt-20 pb-16 container max-w-2xl">
        {/* Signal banner */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Role signal
            </p>
          </div>
          {roleSignal ? (
            <h1 className="text-2xl font-semibold text-foreground leading-snug">
              {roleSignal}
            </h1>
          ) : (
            <h1 className="text-2xl font-semibold text-foreground">
              Who in your network should you refer?
            </h1>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            People from your confirmed network ranked by fit.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-5 h-5 rounded-full border-2 border-border border-t-accent animate-spin" />
            <p className="text-sm text-muted-foreground">Finding your best matches…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* No matches */}
        {!loading && !error && matches.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-base font-medium text-foreground mb-2">No matches yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You don't have any confirmed connections on Refr yet. Once lookers confirm their
              connection to you, they'll appear here when a role matches their profile.
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-full"
              onClick={() => navigate("/dashboard")}
            >
              Go to network
            </Button>
          </div>
        )}

        {/* Match cards */}
        {!loading && !error && matches.length > 0 && (
          <div className="space-y-4">
            {matches.map((match, i) => (
              <MatchCard key={match.looker_id} match={match} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Refer;
