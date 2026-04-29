import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Send, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type ReferralStatus = "sent" | "in_process" | "hired" | "not_progressed";

interface DbReferral {
  id: string;
  looker_id: string;
  company_name: string | null;
  role_signal: string | null;
  hiring_manager_email: string | null;
  email_body: string | null;
  vouch_text: string | null;
  status: ReferralStatus;
  created_at: string;
  // resolved client-side from users table
  looker_name?: string;
}

const STATUS_STYLES: Record<ReferralStatus, string> = {
  sent: "bg-accent/15 text-accent border-accent/20",
  in_process: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  hired: "bg-success/15 text-success border-success/20",
  not_progressed: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<ReferralStatus, string> = {
  sent: "Sent",
  in_process: "In Process",
  hired: "Hired",
  not_progressed: "Not Progressed",
};

const MONTHLY_LIMIT = 3;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── RemainingBanner ───────────────────────────────────────────────────────

function RemainingBanner({ used }: { used: number }) {
  const remaining = Math.max(0, MONTHLY_LIMIT - used);
  const resetDate = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1)
      .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  })();

  if (remaining === 0) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground border border-border/50">
        Monthly referral limit reached. Resets on {resetDate}.
      </div>
    );
  }
  return (
    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-accent/10 text-xs text-accent border border-accent/20">
      You have {remaining} referral{remaining !== 1 ? "s" : ""} remaining this month.
    </div>
  );
}

// ─── ReferralsTab ──────────────────────────────────────────────────────────

const ReferralsTab = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<DbReferral[]>([]);
  const [monthlyUsed, setMonthlyUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();

      const [{ data: rows }, { count }] = await Promise.all([
        supabase
          .from("referrals")
          .select("id, looker_id, company_name, role_signal, hiring_manager_email, email_body, vouch_text, status, created_at")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("referrals")
          .select("*", { count: "exact", head: true })
          .eq("referrer_id", user.id)
          .gte("created_at", startOfMonth),
      ]);

      const referralRows = (rows ?? []) as DbReferral[];

      // Resolve looker names — policy "users: referrer can read referral lookers" allows this
      const lookerIds = [...new Set(referralRows.map((r) => r.looker_id))];
      if (lookerIds.length > 0) {
        const { data: userRows } = await supabase
          .from("users")
          .select("id, name")
          .in("id", lookerIds);
        const nameMap = new Map((userRows ?? []).map((u) => [u.id, u.name as string]));
        for (const r of referralRows) {
          r.looker_name = nameMap.get(r.looker_id) ?? undefined;
        }
      }

      setReferrals(referralRows);
      setMonthlyUsed(count ?? 0);
      setLoading(false);
    };

    load();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 rounded-full border-2 border-border border-t-foreground animate-spin" />
      </div>
    );
  }

  if (referrals.length === 0) {
    return (
      <div className="space-y-4">
        <RemainingBanner used={monthlyUsed} />
        <div className="glass-card p-12 text-center">
          <Send className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No referrals sent yet.</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Browse the Opportunities tab and click "I know someone for this" to start making
            introductions.
          </p>
          <Button className="rounded-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Download className="w-4 h-4" /> Download the extension
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RemainingBanner used={monthlyUsed} />

      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_40px] gap-4 px-6 py-3 border-b border-border/50 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Looker</span>
          <span>Company</span>
          <span>Role</span>
          <span>Date Sent</span>
          <span>Status</span>
          <span />
        </div>

        {referrals.map((referral) => (
          <div key={referral.id} className="border-b border-border/30 last:border-0">
            <button
              onClick={() => setExpandedId(expandedId === referral.id ? null : referral.id)}
              className="w-full grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_40px] gap-4 px-6 py-4 text-left hover:bg-muted/30 transition-colors items-center"
            >
              <span className="text-sm font-medium text-foreground truncate">
                {referral.looker_name ?? "—"}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {referral.company_name ?? "—"}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {referral.role_signal ?? "—"}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(referral.created_at)}
              </span>
              <Badge className={`text-[11px] font-medium border ${STATUS_STYLES[referral.status]} w-fit`}>
                {STATUS_LABELS[referral.status]}
              </Badge>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === referral.id ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {expandedId === referral.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 pt-1 space-y-3">
                    {referral.vouch_text && (
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          Your vouch
                        </p>
                        <p className="text-sm text-foreground/80 italic">
                          "{referral.vouch_text}"
                        </p>
                      </div>
                    )}
                    {referral.email_body && (
                      <div className="bg-muted/40 rounded-xl p-4 border border-border/30">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          {referral.hiring_manager_email
                            ? `Sent to ${referral.hiring_manager_email}`
                            : "Email draft"}
                        </p>
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {referral.email_body}
                        </p>
                      </div>
                    )}
                    {referral.status === "hired" && (
                      <p className="text-xs text-muted-foreground">
                        Pending earnings confirmation — check the Earnings tab.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralsTab;
