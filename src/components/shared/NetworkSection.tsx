import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import LinkedInUpload from "./LinkedInUpload";

interface NetworkPerson {
  id: string;
  name: string;
  detail: string; // role for referrers, "looking for" for lookers
}

interface SentInvite {
  id: string;
  name: string;
  email: string;
  date: string;
  status: "Invited" | "Joined";
}

interface NetworkSectionProps {
  uploadHeadline: string;
  uploadSubheadline: string;
  emptyText: string;
  alreadyOnRefr: NetworkPerson[];
  notOnRefr: NetworkPerson[];
  connectButtonLabel: string;
  sentInvites: SentInvite[];
}

const NetworkSection = ({
  uploadHeadline, uploadSubheadline, emptyText,
  alreadyOnRefr, notOnRefr, connectButtonLabel, sentInvites: initialInvites,
}: NetworkSectionProps) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sentInvites, setSentInvites] = useState<SentInvite[]>(initialInvites);

  const formatToday = () =>
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const addInvite = (name: string, email: string) => {
    if (!name.trim() || !email.trim()) return;
    setSentInvites((prev) => [
      { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), date: formatToday(), status: "Invited" },
      ...prev,
    ]);
  };

  const handleInvitePerson = (person: NetworkPerson) => {
    if (sentInvites.some((i) => i.name === person.name)) return;
    setSentInvites((prev) => [
      { id: crypto.randomUUID(), name: person.name, email: person.detail || "—", date: formatToday(), status: "Invited" },
      ...prev,
    ]);
  };

  const handleManualInvite = () => {
    addInvite(inviteName, inviteEmail);
    setInviteName("");
    setInviteEmail("");
  };

  const hasUpload = csvFile !== null;

  return (
    <div className="space-y-6">
      <LinkedInUpload
        headline={uploadHeadline}
        subheadline={uploadSubheadline}
        file={csvFile}
        onChange={setCsvFile}
      />

      {!hasUpload ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Already on Refr */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Already on Refr</h4>
              <span className="text-[11px] text-muted-foreground">{alreadyOnRefr.length}</span>
            </div>
            <div className="space-y-3">
              {alreadyOnRefr.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-foreground shrink-0">
                      {p.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{p.detail}</p>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                    {connectButtonLabel}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Not on Refr */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Not on Refr yet</h4>
              <span className="text-[11px] text-muted-foreground">{notOnRefr.length}</span>
            </div>
            <div className="space-y-3">
              {notOnRefr.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-foreground shrink-0">
                      {p.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInvitePerson(p)}
                    disabled={sentInvites.some((i) => i.name === p.name)}
                    className="rounded-full text-xs shrink-0"
                  >
                    {sentInvites.some((i) => i.name === p.name) ? "Invited" : "Send Invite"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sent invites */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-3 border-b border-border/50">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent invites</h4>
        </div>
        {sentInvites.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No invites sent yet.</div>
        ) : (
          sentInvites.map((inv) => (
            <div
              key={inv.id}
              className={`px-6 py-3 grid grid-cols-[1.2fr_1.4fr_0.9fr_auto] gap-4 items-center border-b border-border/20 last:border-0 ${
                inv.status === "Joined" ? "bg-success/5" : ""
              }`}
            >
              <span className="text-sm text-foreground truncate">{inv.name}</span>
              <span className="text-xs text-muted-foreground truncate">{inv.email}</span>
              <span className="text-xs text-muted-foreground">{inv.date}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full border ${
                  inv.status === "Joined"
                    ? "bg-success/15 text-success border-success/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {inv.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Manual invite */}
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Or invite someone directly</p>
        <div className="flex gap-2">
          <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Their name" className="flex-1" />
          <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Their email" className="flex-1" />
          <Button
            onClick={handleManualInvite}
            disabled={!inviteName.trim() || !inviteEmail.trim()}
            className="gap-2 rounded-full px-5 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
          >
            <Send className="w-4 h-4" /> Send Invite
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NetworkSection;