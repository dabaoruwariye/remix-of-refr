import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, Download, Chrome } from "lucide-react";
import ExperienceCard, { type Position, type Education } from "@/components/shared/ExperienceCard";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { INDUSTRIES } from "@/lib/refrConstants";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const ProfileTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [positions, setPositions] = useState<Position[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [editingIndustries, setEditingIndustries] = useState(false);
  const [networkDesc, setNetworkDesc] = useState("");
  const [editingNetwork, setEditingNetwork] = useState(false);

  const extensionInstalled = false;

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const [
        { data: profile },
        { data: workHistory },
        { data: eduRows },
      ] = await Promise.all([
        supabase.from("referrer_profiles").select("industries, network_description").eq("user_id", user.id).single(),
        supabase.from("work_history").select("id, company_name, job_title, start_date, end_date, description").eq("user_id", user.id),
        supabase.from("education").select("id, school_name, degree_type, field_of_study, graduation_year").eq("user_id", user.id),
      ]);

      if (profile) {
        setIndustries(profile.industries ?? []);
        setNetworkDesc(profile.network_description ?? "");
      }
      if (workHistory) {
        setPositions(workHistory.map((r) => ({
          id: r.id,
          company: r.company_name ?? "",
          title: r.job_title ?? "",
          startDate: r.start_date ?? "",
          endDate: r.end_date ?? "Present",
          description: r.description ?? "",
        })));
      }
      if (eduRows) {
        setEducation(eduRows.map((r) => ({
          id: r.id,
          school: r.school_name ?? "",
          degree: r.degree_type ?? "",
          field: r.field_of_study ?? "",
          graduationYear: r.graduation_year ?? "",
        })));
      }

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

  return (
    <div className="space-y-4">
      {/* Experience */}
      <ExperienceCard
        resumeFile={null}
        onResumeChange={() => {}}
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
            {editingIndustries
              ? <Check className="w-4 h-4 text-success" />
              : <Pencil className="w-3.5 h-3.5 text-muted-foreground" />}
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
            {editingNetwork
              ? <Check className="w-4 h-4 text-success" />
              : <Pencil className="w-3.5 h-3.5 text-muted-foreground" />}
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
          <Button
            size="sm"
            variant={extensionInstalled ? "outline" : "default"}
            className={`rounded-full text-xs gap-1.5 ${!extensionInstalled ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
          >
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
