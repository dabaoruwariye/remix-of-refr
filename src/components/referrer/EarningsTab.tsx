import { Button } from "@/components/ui/button";
import { DollarSign, Landmark, Check } from "lucide-react";

interface Earning { lookerName: string; company: string; amount: string; date?: string }

const POTENTIAL: Earning[] = [
  { lookerName: "Sarah Chen", company: "Anthropic", amount: "$2,400" },
  { lookerName: "Marcus Johnson", company: "Linear", amount: "$2,400" },
];
const CONFIRMED: Earning[] = [
  { lookerName: "David Park", company: "Notion", amount: "$2,400", date: "Apr 15, 2026" },
];

const TOTAL = CONFIRMED.reduce((s, e) => s + parseFloat(e.amount.replace(/[$,]/g, "")), 0);

const EarningsTab = () => {
  return (
    <div className="space-y-6">
      {/* Total Earned */}
      <div className="glass-card p-8 text-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total earned through Refr</p>
        <h2 className="text-5xl font-bold text-foreground tracking-tight">${TOTAL.toLocaleString()}</h2>
      </div>

      {/* Pending outcomes */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Pending outcomes</h3>
        </div>
        {POTENTIAL.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No active referrals in process.</div>
        ) : (
          POTENTIAL.map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between border-b border-border/20 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.lookerName}</p>
                <p className="text-xs text-muted-foreground">{item.company}</p>
              </div>
              <span className="text-sm text-muted-foreground font-medium">{item.amount}</span>
            </div>
          ))
        )}
      </div>

      {/* Confirmed payouts */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
          <Check className="w-4 h-4 text-success" />
          <h3 className="text-sm font-semibold text-foreground">Ready to pay out</h3>
        </div>
        {CONFIRMED.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No confirmed payouts yet.</div>
        ) : (
          CONFIRMED.map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between border-b border-border/20 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.lookerName}</p>
                <p className="text-xs text-muted-foreground">{item.company} · {item.date}</p>
              </div>
              <span className="text-sm text-success font-semibold">{item.amount}</span>
            </div>
          ))
        )}
      </div>

      {/* Connect Bank */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Landmark className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Connect your bank</h3>
            <p className="text-xs text-muted-foreground">Payment infrastructure is on its way. Your earnings will be waiting.</p>
          </div>
        </div>
        <Button variant="outline" disabled className="rounded-full text-xs">
          Coming Soon
        </Button>
      </div>
    </div>
  );
};

export default EarningsTab;
