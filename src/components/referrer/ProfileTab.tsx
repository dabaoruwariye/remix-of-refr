import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X } from "lucide-react";

interface ProfileData {
  role: string;
  company: string;
  schools: { name: string; year: string }[];
  industries: string[];
  networkDescription: string;
}

const INITIAL_PROFILE: ProfileData = {
  role: "Senior Engineer",
  company: "Acme Inc.",
  schools: [{ name: "MIT", year: "2019" }, { name: "Stanford", year: "2015" }],
  industries: ["Technology", "Finance", "Healthcare"],
  networkDescription: "Early-stage startup founders, senior engineers at FAANG companies, product leaders in B2B SaaS.",
};

type Section = "experience" | "education" | "industries" | "network";

const ProfileTab = () => {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [editing, setEditing] = useState<Section | null>(null);
  const [draft, setDraft] = useState<ProfileData>(INITIAL_PROFILE);

  const startEdit = (section: Section) => {
    setDraft({ ...profile });
    setEditing(section);
  };

  const save = () => {
    setProfile({ ...draft });
    setEditing(null);
  };

  const cancel = () => setEditing(null);

  const EditButton = ({ section }: { section: Section }) => (
    editing === section ? (
      <div className="flex gap-1.5">
        <button onClick={save} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Check className="w-4 h-4 text-success" /></button>
        <button onClick={cancel} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
    ) : (
      <button onClick={() => startEdit(section)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    )
  );

  return (
    <div className="space-y-4">
      {/* Experience */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience</h3>
          <EditButton section="experience" />
        </div>
        {editing === "experience" ? (
          <div className="space-y-3">
            <Input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Role" />
            <Input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} placeholder="Company" />
          </div>
        ) : (
          <div>
            <p className="text-base font-semibold text-foreground">{profile.role}</p>
            <p className="text-sm text-muted-foreground">{profile.company}</p>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Education</h3>
          <EditButton section="education" />
        </div>
        {editing === "education" ? (
          <div className="space-y-3">
            {draft.schools.map((s, i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <Input className="col-span-2" value={s.name} onChange={(e) => {
                  const schools = [...draft.schools];
                  schools[i] = { ...schools[i], name: e.target.value };
                  setDraft({ ...draft, schools });
                }} placeholder="School" />
                <Input value={s.year} onChange={(e) => {
                  const schools = [...draft.schools];
                  schools[i] = { ...schools[i], year: e.target.value };
                  setDraft({ ...draft, schools });
                }} placeholder="Year" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {profile.schools.map((s, i) => (
              <p key={i} className="text-sm text-foreground">{s.name} <span className="text-muted-foreground">'{s.year.slice(-2)}</span></p>
            ))}
          </div>
        )}
      </div>

      {/* Industries */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Industries</h3>
          <EditButton section="industries" />
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.industries.map((ind) => (
            <Badge key={ind} variant="outline" className="text-xs font-medium text-muted-foreground border-border/60">{ind}</Badge>
          ))}
        </div>
      </div>

      {/* Network Description */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Network</h3>
          <EditButton section="network" />
        </div>
        {editing === "network" ? (
          <Textarea
            value={draft.networkDescription}
            onChange={(e) => setDraft({ ...draft, networkDescription: e.target.value })}
            className="min-h-[80px] resize-none"
          />
        ) : (
          <p className="text-sm text-foreground/80 leading-relaxed">{profile.networkDescription}</p>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
