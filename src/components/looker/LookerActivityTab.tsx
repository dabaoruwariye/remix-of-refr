import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check, X, PartyPopper } from "lucide-react";

type Status = "sent" | "in_process" | "hired" | "not_progressed";

interface PendingConfirmation {
  type: "pending";
  id: string;
  referrerName: string;
  referrerRole: string;
  overlap: string;
}

interface ReferralSent {
  type: "sent";
  id: string;
  referrerName: string;
  company: string;
  role: string;
  date: string;
  status: Status;
  emailBody: string;
}

interface StatusUpdate {
  type: "status";
  id: string;
  referrerName: string;
  company: string;
  role: string;
  status: "in_process" | "hired" | "not_progressed";
  date: string;
}

type FeedItem = PendingConfirmation | ReferralSent | StatusUpdate;

const STATUS_STYLES: Record<Status, string> = {
  sent: "bg-accent/15 text-accent border-accent/20",
  in_process: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  hired: "bg-success/15 text-success border-success/20",
  not_progressed: "bg-muted text-muted-foreground border-border",
};
const STATUS_LABELS: Record<Status, string> = {
  sent: "Sent", in_process: "In Process", hired: "Hired", not_progressed: "Not Progressed",
};

const INITIAL_FEED: FeedItem[] = [
  {
    type: "pending", id: "pc1",
    referrerName: "Alex Morgan",
    referrerRole: "Director of Engineering at Datadog",
    overlap: "Stripe",
  },
  {
    type: "status", id: "su1",
    referrerName: "Priya Shah", company: "Notion", role: "Head of Product",
    status: "hired", date: "Apr 18, 2026",
  },
  {
    type: "sent", id: "rs1",
    referrerName: "Priya Shah", company: "Notion", role: "Head of Product",
    date: "Apr 5, 2026", status: "in_process",
    emailBody: "Hi team — I want to introduce you to Jane Smith, who I worked closely with at Stripe. Jane led our Billing v3 platform end-to-end and is one of the sharpest PMs I've collaborated with. She's exploring head-of-product roles and Notion was top of her list.",
  },
  {
    type: "sent", id: "rs2",
    referrerName: "Liam Chen", company: "Linear", role: "Senior PM",
    date: "Mar 22, 2026", status: "not_progressed",
    emailBody: "Hi — Jane Smith is someone I'd strongly recommend for the Senior PM opening at Linear. She has shipped category-defining payments products at Stripe and is now looking for a focused, high-craft team.",
  },
];

interface Props {
  onGoToNetwork: () => void;
}

const LookerActivityTab = ({ onGoToNetwork }: Props) => {
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const confirmPending = (id: string, _accepted: boolean) =>
    setFeed(feed.filter((f) => f.id !== id));

  const visible = feed.filter((f) => f.type !== "pending");
  const pending = feed.filter((f): f is PendingConfirmation => f.type === "pending");

  if (feed.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Your profile is live.</h3>
        <p className="text-sm text-muted-foreground mb-5">Head to the Network tab to find people who can vouch for you.</p>
        <Button onClick={onGoToNetwork} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
          Go to Network
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((p) => (
        <div key={p.id} className="glass-card p-5 border-l-4 border-l-yellow-500/70">
          <p className="text-sm font-semibold text-foreground">
            {p.referrerName} wants to connect with you on Refr.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{p.referrerRole}</p>
          <p className="text-sm text-foreground/80 mt-3 leading-relaxed">
            It looks like you both worked at <span className="font-medium text-foreground">{p.overlap}</span> around the same time. Is that how you know them?
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => confirmPending(p.id, true)} size="sm" className="rounded-full gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
              <Check className="w-3.5 h-3.5" /> Yes I know them
            </Button>
            <Button onClick={() => confirmPending(p.id, false)} size="sm" variant="outline" className="rounded-full gap-1.5">
              <X className="w-3.5 h-3.5" /> I don't recognize this person
            </Button>
          </div>
        </div>
      ))}

      {visible.map((item) => {
        if (item.type === "status" && item.status === "hired") {
          return (
            <div key={item.id} className="glass-card p-5 bg-success/10 border-success/30">
              <div className="flex items-center gap-2 mb-1">
                <PartyPopper className="w-4 h-4 text-success" />
                <p className="text-sm font-semibold text-success">You got the referral. Now go get the job.</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.referrerName} → {item.role} at {item.company} · {item.date}
              </p>
            </div>
          );
        }
        if (item.type === "status") {
          return (
            <div key={item.id} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">
                  {item.referrerName}'s referral to <span className="font-medium">{item.company}</span> is now {STATUS_LABELS[item.status]}.
                </p>
                <Badge className={`text-[11px] border ${STATUS_STYLES[item.status]}`}>{STATUS_LABELS[item.status]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.role} · {item.date}</p>
            </div>
          );
        }
        // sent
        const open = expandedId === item.id;
        return (
          <div key={item.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.referrerName} referred you for {item.role} at {item.company}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Sent {item.date}</p>
              </div>
              <Badge className={`text-[11px] border ${STATUS_STYLES[item.status]} shrink-0`}>{STATUS_LABELS[item.status]}</Badge>
            </div>
            <button
              onClick={() => setExpandedId(open ? null : item.id)}
              className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              {open ? "Hide email" : "See what was said about you"}
              <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {open && (
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
                    <p className="text-sm text-foreground/80 leading-relaxed">{item.emailBody}</p>
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