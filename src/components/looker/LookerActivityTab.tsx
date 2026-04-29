import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type ReferralStatus = "sent" | "in_process" | "hired" | "not_progressed";

interface DbReferral {
  id: string;
  referrer_id: string;
  company_name: string | null;
  role_signal: string | null;
  email_body: string | null;
  status: ReferralStatus;
  created_at: string;
  // resolved client-side from users table
  referrer_name?: string;
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

interface Props {
  onGoToNetwork: () => void;
}

const LookerActivityTab = ({ onGoToNetwork }: Props) => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<DbReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data: rows } = await supabase
        .from("referrals")
        .select("id, referrer_id, company_name, role_signal, email_body, status, created_at")
        .eq("looker_id", user.id)
        .order("created_at", { ascending: false });

      const referralRows = (rows ?? []) as DbReferral[];

      // Resolve referrer names — policy "users: looker can read own referrers" allows this
      const referrerIds = [...new Set(referralRows.map((r) => r.referrer_id))];
      if (referrerIds.length > 0) {
        const { data: userRows } = await supabase
          .from("users")
          .select("id, name")
          .in("id", referrerIds);
        const nameMap = new Map((userRows ?? []).map((u) => [u.id, u.name as string]));
        for (const r of referralRows) {
          r.referrer_name = nameMap.get(r.referrer_id) ?? undefined;
        }
      }

      setReferrals(referralRows);
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
      <div className="glass-card p-12 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Your profile is live.</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto leading-relaxed">
          When someone from your network refers you, it will appear here. Head to Network to
          connect with people who can vouch for you.
        </p>
        <Button
          onClick={onGoToNetwork}
          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Go to Network
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {referrals.map((referral) => {
        const open = expandedId === referral.id;
        const referrerName = referral.referrer_name ?? "Someone";
        const company = referral.company_name ?? "a company";
        const role = referral.role_signal ?? "a role";

        return (
          <div key={referral.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {referrerName} referred you for {role} at {company}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sent {formatDate(referral.created_at)}
                </p>
              </div>
              <Badge
                className={`text-[11px] border ${STATUS_STYLES[referral.status]} shrink-0`}
              >
                {STATUS_LABELS[referral.status]}
              </Badge>
            </div>

            {referral.email_body && (
              <button
                onClick={() => setExpandedId(open ? null : referral.id)}
                className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                {open ? "Hide email" : "See what was said about you"}
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
            )}

            <AnimatePresence>
              {open && referral.email_body && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 bg-muted/40 rounded-xl p-4 border border-border/30">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Here's exactly what was said about you
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {referral.email_body}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default LookerActivityTab;
