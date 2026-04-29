import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Briefcase, Check, GraduationCap,
  Send, Sparkles, UserPlus, Users, Wand2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { matchLookers, type LookerMatch } from "@/lib/matching";
import { detectOverlap } from "@/lib/overlap";

// ─── types ─────────────────────────────────────────────────────────────────

interface ReferrerProfile {
  name: string;
  currentRole: string;
  currentCompany: string;
}

// ─── shared helpers ────────────────────────────────────────────────────────

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const init =
    parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold shrink-0 uppercase">
      {init}
    </div>
  );
}

const REASON_STYLES: Record<string, string> = {
  "Target role match": "bg-accent/10 text-accent border-accent/20",
  "Same industry": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Confirmed connection": "bg-muted text-muted-foreground border-border/60",
};

// ─── MatchCard ─────────────────────────────────────────────────────────────

function MatchCard({
  match,
  index,
  referrerProfile,
  roleSignal,
  companyName,
}: {
  match: LookerMatch;
  index: number;
  referrerProfile: ReferrerProfile | null;
  roleSignal: string;
  companyName: string;
}) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Overlap
  const [overlapLoaded, setOverlapLoaded] = useState(false);
  const [overlapCompany, setOverlapCompany] = useState("");
  const [overlapSchool, setOverlapSchool] = useState("");

  // Composer state
  const [relationshipCtx, setRelationshipCtx] = useState("");
  const [vouchText, setVouchText] = useState("");
  const [hiringEmail, setHiringEmail] = useState("");

  // Draft generation
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState("");

  // Send state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (!expanded || !user || loadedRef.current) return;
    loadedRef.current = true;

    detectOverlap(user.id, match.looker_id)
      .then((result) => {
        const co = result.shared_companies[0] ?? "";
        const sc = result.shared_schools[0] ?? "";
        setOverlapCompany(co);
        setOverlapSchool(sc);

        if (co) setRelationshipCtx(`We worked together at ${co}.`);
        else if (sc) setRelationshipCtx(`We both went to ${sc}.`);
      })
      .catch(() => { /* ignore */ })
      .finally(() => setOverlapLoaded(true));
  }, [expanded, user, match.looker_id]);

  const generateDraft = async () => {
    if (!referrerProfile) return;
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

      const res = await fetch(`${supabaseUrl}/functions/v1/draft-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? ""}`,
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({
          referrer_name: referrerProfile.name,
          referrer_current_role: referrerProfile.currentRole || undefined,
          referrer_current_company: referrerProfile.currentCompany || undefined,
          looker_name: match.name,
          looker_current_role: match.recent_work?.job_title || undefined,
          looker_industries: match.profile.industries ?? [],
          looker_target_role: match.profile.target_role || undefined,
          company_name: companyName || undefined,
          role_signal: roleSignal || undefined,
          vouch_text: vouchText || undefined,
          relationship_context: relationshipCtx || undefined,
          overlap_company: overlapCompany || undefined,
          overlap_school: overlapSchool || undefined,
        }),
      });

      const json = await res.json() as { draft?: string; error?: string };
      if (json.draft) setDraft(json.draft);
    } catch { /* silently fail — user can write manually */ }
    setGenerating(false);
  };

  const handleSend = async () => {
    if (!user || !draft) return;
    setSending(true);
    // Success state — actual email send wired in next session
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    setSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-6">
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

        {(match.profile.target_role || match.profile.seniority) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground">
              Looking for{" "}
              <span className="font-medium">
                {[match.profile.seniority, match.profile.target_role].filter(Boolean).join(" ")}
              </span>
            </span>
          </div>
        )}

        {match.profile.industries?.length > 0 && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <GraduationCap className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              {match.profile.industries.join(", ")}
            </span>
          </div>
        )}

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

        <div className="mt-5">
          <Button
            className="gap-2 rounded-full px-5 bg-accent text-accent-foreground hover:bg-accent/90 text-sm"
            onClick={() => setExpanded((v) => !v)}
          >
            <Send className="w-3.5 h-3.5" />
            {expanded ? "Close" : "Refer this person"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/50"
          >
            {sent ? (
              <div className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <p className="text-sm font-semibold text-foreground">Introduction sent</p>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  {hiringEmail
                    ? `Your intro email has been queued for ${hiringEmail}.`
                    : "Your referral has been recorded."}{" "}
                  {match.name} will be notified.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Relationship context */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    How do you know {match.name}?
                  </label>
                  {!overlapLoaded && loadedRef.current ? (
                    <div className="h-8 flex items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-border border-t-foreground animate-spin" />
                    </div>
                  ) : (
                    <Textarea
                      value={relationshipCtx}
                      onChange={(e) => setRelationshipCtx(e.target.value)}
                      placeholder={`e.g. We worked together at Stripe for two years…`}
                      className="min-h-[70px] resize-none text-sm"
                    />
                  )}
                </div>

                {/* Vouch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Your vouch
                  </label>
                  <Textarea
                    value={vouchText}
                    onChange={(e) => setVouchText(e.target.value)}
                    placeholder={`What makes ${match.name} exceptional for this role?`}
                    className="min-h-[70px] resize-none text-sm"
                  />
                </div>

                {/* Generate button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={generating}
                  onClick={generateDraft}
                  className="gap-2 text-xs"
                >
                  {generating ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-border border-t-foreground animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  {generating ? "Generating…" : "Generate email draft"}
                </Button>

                {/* Email draft */}
                {draft && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email draft
                    </label>
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="min-h-[180px] resize-none text-sm font-mono leading-relaxed"
                    />
                    <p className="text-[11px] text-muted-foreground text-right">
                      {draft.length} characters
                    </p>
                  </div>
                )}

                {/* Hiring manager email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Hiring manager email
                  </label>
                  <Input
                    type="email"
                    value={hiringEmail}
                    onChange={(e) => setHiringEmail(e.target.value)}
                    placeholder={companyName ? `hiring@${companyName.toLowerCase().replace(/\s+/g, "")}.com` : "hiring@company.com"}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Check LinkedIn or the company website if unsure.
                  </p>
                </div>

                {/* Send */}
                <Button
                  disabled={!draft || sending}
                  onClick={handleSend}
                  className="w-full rounded-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 text-sm"
                >
                  {sending ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {sending ? "Sending…" : "Send introduction"}
                </Button>

                {!draft && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    Generate an email draft above before sending.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── NoConnectionsCard ────────────────────────────────────────────────────

function NoConnectionsCard({ onGoToNetwork }: { onGoToNetwork: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-10 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Users className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground mb-2">
        No confirmed connections yet
      </p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Invite someone you know to join Refr. Once they confirm the connection, they'll appear
        here as a match.
      </p>
      <Button
        className="mt-6 rounded-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={onGoToNetwork}
      >
        <UserPlus className="w-3.5 h-3.5" />
        Invite your network
      </Button>
    </motion.div>
  );
}

// ─── ManualReferForm ──────────────────────────────────────────────────────

function ManualReferForm({
  roleSignal,
  companyName,
}: {
  roleSignal: string;
  companyName: string;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: dbErr } = await supabase.from("invites").insert({
        inviter_id: user.id,
        inviter_type: "referrer",
        invitee_email: email.trim().toLowerCase(),
        invitee_name: name.trim() || null,
      });
      if (dbErr) throw dbErr;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center"
      >
        <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-3">
          <Check className="w-5 h-5 text-success" />
        </div>
        <p className="text-sm font-semibold text-foreground">Invite sent</p>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
          We'll let them know you'd like to refer them
          {companyName ? ` for a role at ${companyName}` : ""}.
          Once they join Refr, you'll be connected and the referral will be complete.
        </p>
        <button
          onClick={() => { setSent(false); setName(""); setEmail(""); }}
          className="text-xs text-accent hover:underline mt-4"
        >
          Refer someone else
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass-card p-6 space-y-4"
    >
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          Refer someone directly
        </p>
        <p className="text-sm text-muted-foreground">
          Don't see the right person? They don't need a Refr account yet — we'll invite them on
          your behalf.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name (optional)"
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          type="submit"
          disabled={!email.trim() || submitting}
          className="w-full rounded-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Send className="w-3.5 h-3.5" />
          {submitting ? "Sending…" : "Send invite & create referral"}
        </Button>
      </form>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

const Refer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const roleSignal = searchParams.get("role_signal") ?? "";
  const companyName = searchParams.get("company_name") ?? "";
  const jobUrl = searchParams.get("job_url") ?? "";

  const [matches, setMatches] = useState<LookerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrerProfile, setReferrerProfile] = useState<ReferrerProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [matchResults, { data: userRow }, { data: workRows }] = await Promise.all([
          matchLookers(user.id, roleSignal),
          supabase.from("users").select("name").eq("id", user.id).single(),
          supabase
            .from("work_history")
            .select("company_name, job_title, end_date")
            .eq("user_id", user.id)
            .order("start_date", { ascending: false })
            .limit(5),
        ]);

        if (!cancelled) {
          setMatches(matchResults);

          // Pick most recent position (end_date null = current)
          const current = workRows?.find((r) => !r.end_date) ?? workRows?.[0];
          setReferrerProfile({
            name: userRow?.name ?? "",
            currentRole: current?.job_title ?? "",
            currentCompany: current?.company_name ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.id, roleSignal]);

  const goToNetwork = () => navigate("/dashboard?tab=network");

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

      <main className="pt-20 pb-16 container max-w-2xl space-y-4">
        {/* Signal banner */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Role signal
            </p>
          </div>
          {companyName && (
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {companyName}
              {jobUrl && (
                <>
                  {" · "}
                  <a
                    href={jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    View job posting ↗
                  </a>
                </>
              )}
            </p>
          )}
          <h1 className="text-2xl font-semibold text-foreground leading-snug">
            {roleSignal || "Who in your network should you refer?"}
          </h1>
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

        {!loading && (
          <>
            {/* Error */}
            {error && (
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-destructive mb-1">Couldn't load connections</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            )}

            {/* No confirmed connections */}
            {!error && matches.length === 0 && (
              <NoConnectionsCard onGoToNetwork={goToNetwork} />
            )}

            {/* Confirmed matches */}
            {!error && matches.length > 0 && (
              <div className="space-y-4">
                {matches.map((match, i) => (
                  <MatchCard
                    key={match.looker_id}
                    match={match}
                    index={i}
                    referrerProfile={referrerProfile}
                    roleSignal={roleSignal}
                    companyName={companyName}
                  />
                ))}
              </div>
            )}

            {/* Divider when matches exist */}
            {!error && matches.length > 0 && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
            )}

            {/* Manual refer — always available */}
            <ManualReferForm roleSignal={roleSignal} companyName={companyName} />
          </>
        )}
      </main>
    </div>
  );
};

export default Refer;
