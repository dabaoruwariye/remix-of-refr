import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Check } from "lucide-react";
import ExperienceCard, { Position, Education } from "@/components/shared/ExperienceCard";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { INDUSTRIES, SENIORITY } from "@/lib/refrConstants";

const INITIAL_POSITIONS: Position[] = [
  { id: "p1", company: "Stripe", title: "Senior Product Manager", startDate: "May 2021", endDate: "Present", description: "Led the Billing v3 platform from concept to GA, scaling to $2B in processed payments." },
  { id: "p2", company: "Square", title: "Product Manager", startDate: "Jun 2018", endDate: "Apr 2021", description: "Owned merchant onboarding flows that lifted activation by 22%." },
];
const INITIAL_EDU: Education[] = [
  { id: "e1", school: "MIT", degree: "B.S.", field: "Computer Science", graduationYear: "2018" },
];

const LookerProfileTab = () => {
  const [visible, setVisible] = useState(true);
  const [resume, setResume] = useState<File | null>(null);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [education, setEducation] = useState<Education[]>(INITIAL_EDU);

  const [editingPrefs, setEditingPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    targetRole: "VP of Product",
    seniority: "lead",
    industries: ["Technology", "Finance"],
  });

  const completion = (() => {
    let total = 3, done = 0;
    if (resume) done++;
    if (prefs.industries.length > 0) done++;
    if (prefs.targetRole.trim()) done++;
    return Math.round((done / total) * 100);
  })();

  return (
    <div className="space-y-4">
      {/* Visibility */}
      <div className="glass-card p-5 flex items-start gap-4">
        <Switch checked={visible} onCheckedChange={setVisible} className="mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Visible to referrers who know me</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            When on, referrers with a confirmed connection to you will see you as a suggested match for open roles.
          </p>
        </div>
      </div>

      {/* Account */}
      <div className="glass-card p-6">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Account</h3>
        <p className="text-base font-semibold text-foreground">Jane Smith</p>
        <p className="text-sm text-muted-foreground">jane@example.com</p>
        <button className="text-xs text-accent hover:underline mt-2">Update in settings</button>
      </div>

      {/* Experience */}
      <ExperienceCard
        resumeFile={resume}
        onResumeChange={setResume}
        positions={positions}
        setPositions={setPositions}
        education={education}
        setEducation={setEducation}
      />

      {/* Preferences */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferences</h3>
          {editingPrefs ? (
            <button onClick={() => setEditingPrefs(false)} className="p-1.5 rounded-lg hover:bg-muted">
              <Check className="w-4 h-4 text-success" />
            </button>
          ) : (
            <button onClick={() => setEditingPrefs(true)} className="p-1.5 rounded-lg hover:bg-muted">
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        {editingPrefs ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target role</label>
              <Input value={prefs.targetRole} onChange={(e) => setPrefs({ ...prefs, targetRole: e.target.value })} placeholder="e.g. VP of Product" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Seniority</label>
              <Select value={prefs.seniority} onValueChange={(v) => setPrefs({ ...prefs, seniority: v })}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  {SENIORITY.map((l) => <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <MultiSelectDropdown
              label="Industries"
              options={INDUSTRIES}
              selected={prefs.industries}
              onChange={(v) => setPrefs({ ...prefs, industries: v })}
              placeholder="Select industries"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Target role</p>
              <p className="text-sm text-foreground">{prefs.targetRole || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Seniority</p>
              <p className="text-sm text-foreground capitalize">{prefs.seniority || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Industries</p>
              <div className="flex flex-wrap gap-1.5">
                {prefs.industries.length === 0 ? (
                  <span className="text-sm text-muted-foreground">—</span>
                ) : (
                  prefs.industries.map((i) => (
                    <Badge key={i} variant="outline" className="text-[11px] text-muted-foreground border-border/60">{i}</Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Completeness */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">A complete profile gets better matches.</p>
          <span className="text-xs font-medium text-foreground">{completion}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
      </div>
    </div>
  );
};

export default LookerProfileTab;