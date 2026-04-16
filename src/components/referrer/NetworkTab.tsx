import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, UserPlus, Users } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  role: string;
  lookingFor: string;
  status: "active" | "paused";
  context: string;
}

const MOCK_CONNECTIONS: Connection[] = [
  { id: "1", name: "Sarah Chen", role: "Senior Product Manager at Stripe", lookingFor: "VP Product at a Series B+", status: "active", context: "Worked together" },
  { id: "2", name: "Marcus Johnson", role: "Staff Engineer at Meta", lookingFor: "Engineering Director, remote-first", status: "active", context: "Same school" },
  { id: "3", name: "Emily Rivera", role: "Head of Design at Figma", lookingFor: "CDO / VP Design at a startup", status: "paused", context: "Same company" },
  { id: "4", name: "David Park", role: "Growth Lead at Notion", lookingFor: "Head of Marketing, B2B SaaS", status: "active", context: "Professional community" },
  { id: "5", name: "Aisha Patel", role: "Data Scientist at Airbnb", lookingFor: "ML Engineering Lead", status: "active", context: "Worked together" },
  { id: "6", name: "James Wu", role: "Account Executive at Salesforce", lookingFor: "Sales Director, enterprise", status: "paused", context: "Same company" },
];

const NetworkTab = () => {
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [connections] = useState<Connection[]>(MOCK_CONNECTIONS);

  return (
    <div className="space-y-8">
      {/* Invite Section */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Know someone looking for work? Invite them to Refr.</h3>
            <p className="text-sm text-muted-foreground mt-1">When they join and confirm your connection, they'll appear here and you can start referring them.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Input
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Their name"
            className="flex-1"
          />
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Their email"
            className="flex-1"
          />
          <Button className="gap-2 rounded-full px-5 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
            <Send className="w-4 h-4" /> Send Invite
          </Button>
        </div>
      </div>

      {/* Connections Grid */}
      {connections.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Your Refr network is empty.</h3>
          <p className="text-sm text-muted-foreground">Invite people you know who are looking for their next role.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="glass-card p-5 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                    {person.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{person.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${person.status === "active" ? "bg-success" : "bg-muted-foreground/40"}`} />
                      <span className="text-[11px] text-muted-foreground capitalize">{person.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{person.role}</p>
              <p className="text-sm text-foreground/80 mb-3">Looking for: {person.lookingFor}</p>
              <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground border-border/60">
                {person.context}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkTab;
