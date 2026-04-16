import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Send } from "lucide-react";

interface Referral {
  id: string;
  lookerName: string;
  company: string;
  roleTitle: string;
  dateSent: string;
  status: "sent" | "in_process" | "hired" | "not_progressed";
  emailBody: string;
}

const STATUS_STYLES: Record<Referral["status"], string> = {
  sent: "bg-accent/15 text-accent border-accent/20",
  in_process: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  hired: "bg-success/15 text-success border-success/20",
  not_progressed: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<Referral["status"], string> = {
  sent: "Sent",
  in_process: "In Process",
  hired: "Hired",
  not_progressed: "Not Progressed",
};

const MOCK_REFERRALS: Referral[] = [
  { id: "1", lookerName: "Sarah Chen", company: "Anthropic", roleTitle: "VP of Product", dateSent: "Apr 10, 2026", status: "in_process", emailBody: "Hi Jordan — I wanted to introduce you to Sarah Chen. Sarah was my PM lead at Stripe where she shipped the Billing v3 platform. She's deeply technical, incredibly organized, and has a rare ability to align engineering and business goals. I think she'd be a phenomenal fit for the VP Product role. Happy to share more context anytime." },
  { id: "2", lookerName: "Marcus Johnson", company: "Linear", roleTitle: "Engineering Director", dateSent: "Apr 7, 2026", status: "sent", emailBody: "Hi team — Marcus Johnson is one of the strongest engineering leaders I've worked with. He led a 40-person org at Meta focused on developer tools and consistently shipped ahead of schedule. He's looking for a director-level role at a product-led company and I immediately thought of Linear. Would love to connect you two." },
  { id: "3", lookerName: "David Park", company: "Notion", roleTitle: "Head of Growth", dateSent: "Mar 28, 2026", status: "hired", emailBody: "Hi Alex — David Park is someone I've admired in the growth community for years. He scaled Notion's PLG motion from Series A to C and has deep expertise in B2B SaaS acquisition. He's exploring his next chapter and I think he'd be a great addition to your leadership team." },
  { id: "4", lookerName: "Aisha Patel", company: "OpenAI", roleTitle: "ML Engineering Lead", dateSent: "Mar 15, 2026", status: "not_progressed", emailBody: "Hi hiring team — I'd like to recommend Aisha Patel for the ML Engineering Lead position. Aisha built the personalization ML pipeline at Airbnb that improved conversion by 12%. She's deeply skilled in recommendation systems and production ML infrastructure." },
];

const ReferralsTab = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (MOCK_REFERRALS.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Send className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No referrals sent yet.</h3>
        <p className="text-sm text-muted-foreground">Browse LinkedIn with the Refr extension to spot opportunities.</p>
      </div>
    );
  }

  return (
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

      {/* Rows */}
      {MOCK_REFERRALS.map((referral) => (
        <div key={referral.id} className="border-b border-border/30 last:border-0">
          <button
            onClick={() => setExpandedId(expandedId === referral.id ? null : referral.id)}
            className="w-full grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_40px] gap-4 px-6 py-4 text-left hover:bg-muted/30 transition-colors items-center"
          >
            <span className="text-sm font-medium text-foreground">{referral.lookerName}</span>
            <span className="text-sm text-muted-foreground">{referral.company}</span>
            <span className="text-sm text-muted-foreground">{referral.roleTitle}</span>
            <span className="text-xs text-muted-foreground">{referral.dateSent}</span>
            <Badge className={`text-[11px] font-medium border ${STATUS_STYLES[referral.status]} w-fit`}>
              {STATUS_LABELS[referral.status]}
            </Badge>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === referral.id ? "rotate-180" : ""}`} />
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
                <div className="px-6 pb-5 pt-1">
                  <div className="bg-muted/40 rounded-xl p-4 border border-border/30">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Email sent</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{referral.emailBody}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default ReferralsTab;
