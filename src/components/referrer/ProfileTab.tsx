import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Check, Download, Chrome } from "lucide-react";
import ExperienceCard, { Position, Education } from "@/components/shared/ExperienceCard";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { Badge } from "@/components/ui/badge";
import { INDUSTRIES } from "@/lib/refrConstants";

const INITIAL_POS: Position[] = [
  { id: "p1", company: "Datadog", title: "Director of Engineering", startDate: "Aug 2022", endDate: "Present", description: "Leading the platform infrastructure org of 60 engineers." },
  { id: "p2", company: "Stripe", title: "Engineering Manager", startDate: "Mar 2018", endDate: "Jul 2022", description: "Built and ran the Billing platform team." },
];
const INITIAL_EDU: Education[] = [
  { id: "e1", school: "Stanford", degree: "M.S.", field: "Computer Science", graduationYear: "2014" },
];

const ProfileTab = () => {
  const [resume, setResume] = useState<File | null>(null);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POS);
  const [education, setEducation] = useState<Education[]>(INITIAL_EDU);

  const [industries, setIndustries] = useState<string[]>(["Technology", "Finance"]);
  const [editingIndustries, setEditingIndustries] = useState(false);

  const [networkDesc, setNetworkDesc] = useState(
    "Mostly operators and PMs from early stage startups, plus engineers I worked with at Stripe and Datadog.",
  );
  const [editingNetwork, setEditingNetwork] = useState(false);

  const extensionInstalled = false;

  return (
    <div className="space-y-4">
      {/* Experience */}
      <ExperienceCard
        resumeFile={resume}
        onResumeChange={setResume}
        positions={positions}
        setPositions={setPositions}
        education={education}
        setEducation={setEducation}
        resumeNote="Your resume is used to find meaningful overlaps with lookers — shared employers, shared schools."
      />

      {/* Industries */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Industries</h3>
            <p className="text-xs text-muted-foreground mt-1">Used to surface relevant opportunities through the extension.</p>
          </div>
          <button onClick={() => setEditingIndustries((v) => !v)} className="p-1.5 rounded-lg hover:bg-muted">
            {editingIndustries ? <Check className="w-4 h-4 text-success" /> : <Pencil className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        </div>
        {editingIndustries ? (
          <MultiSelectDropdown label="" options={INDUSTRIES} selected={industries} onChange={setIndustries} placeholder="Select industries" />
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {industries.length === 0 ? (
              <span className="text-sm text-muted-foreground">None selected</span>
            ) : (
              industries.map((i) => (
                <Badge key={i} variant="outline" className="text-[11px] text-muted-foreground border-border/60">{i}</Badge>
              ))
            )}
          </div>
        )}
      </div>

      {/* Network Description */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Network description</h3>
            <p className="text-xs text-muted-foreground mt-1">How would you describe the people in your network?</p>
          </div>
          <button onClick={() => setEditingNetwork((v) => !v)} className="p-1.5 rounded-lg hover:bg-muted">
            {editingNetwork ? <Check className="w-4 h-4 text-success" /> : <Pencil className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        </div>
        {editingNetwork ? (
          <Textarea
            value={networkDesc}
            onChange={(e) => setNetworkDesc(e.target.value)}
            placeholder="e.g. mostly operators and PMs from early stage startups."
            className="min-h-[90px] resize-none"
          />
        ) : (
          <p className="text-sm text-foreground/80 leading-relaxed">
            {networkDesc || "Add a short description to help us calibrate what kinds of roles the extension prioritizes."}
          </p>
        )}
      </div>

      {/* Chrome Extension */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Chrome className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Refr Chrome extension</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${extensionInstalled ? "bg-success" : "bg-muted-foreground/40"}`} />
                <span className="text-[11px] text-muted-foreground">
                  {extensionInstalled ? "Active" : "Not installed"}
                </span>
              </div>
            </div>
          </div>
          <Button size="sm" variant={extensionInstalled ? "outline" : "default"} className={`rounded-full text-xs gap-1.5 ${!extensionInstalled ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}>
            <Download className="w-3.5 h-3.5" /> {extensionInstalled ? "Reinstall" : "Download"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The extension is how you spot opportunities on LinkedIn. Keep it active for the best experience.
        </p>
      </div>
    </div>
  );
};

export default ProfileTab;
