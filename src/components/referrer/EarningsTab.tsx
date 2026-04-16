import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Landmark, Clock } from "lucide-react";

interface PotentialEarning {
  lookerName: string;
  company: string;
  amount: string;
}

const POTENTIAL_EARNINGS: PotentialEarning[] = [
  { lookerName: "Sarah Chen", company: "Anthropic", amount: "$2,400" },
  { lookerName: "Marcus Johnson", company: "Linear", amount: "$2,400" },
];

const EarningsTab = () => {
  return (
    <div className="space-y-6">
      {/* Total Earned */}
      <div className="glass-card p-8 text-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Earned</p>
        <h2 className="text-5xl font-bold text-foreground tracking-tight">$0</h2>
        <p className="text-sm text-muted-foreground mt-2">Earnings are paid when a referred candidate is hired.</p>
      </div>

      {/* Potential Earnings */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Potential Earnings</h3>
        </div>
        {POTENTIAL_EARNINGS.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No active referrals with potential earnings.</div>
        ) : (
          POTENTIAL_EARNINGS.map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between border-b border-border/20 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.lookerName}</p>
                <p className="text-xs text-muted-foreground">{item.company}</p>
              </div>
              <span className="text-sm text-muted-foreground font-medium">Potential: {item.amount}</span>
            </div>
          ))
        )}
      </div>

      {/* Pending Payouts */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Pending Payouts</h3>
        </div>
        <div className="p-8 text-center text-sm text-muted-foreground">No pending payouts at this time.</div>
      </div>

      {/* Connect Bank */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Landmark className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Connect your bank</h3>
            <p className="text-xs text-muted-foreground">Payment infrastructure coming soon — your earnings will be waiting.</p>
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
