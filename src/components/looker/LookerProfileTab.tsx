import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Check } from "lucide-react";
import ExperienceCard, { type Position, type Education } from "@/components/shared/ExperienceCard";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { INDUSTRIES, SENIORITY } from "@/lib/refrConstants";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const LookerProfileTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [visible, setVisible] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [education, setEducation] = useState<Education[]>([]);

  const [prefs, setPrefs] = useState({ targetRole: "", seniority: "", industries: [] as string[] });
  const [editingPrefs, setEditingPrefs] = useState(false);

  const [account, setAccount] = useState({ name: "", email: "" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftAccount, setDraftAccount] = useState(account);
  const [draftPassword, setDraftPassword] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const [
        { data: userRow },
        { data: profile },
        { data: workHistory },
        { data: eduRows },
      ] = await Promise.all([
        supabase.from("users").select("name, email").eq("id", user.id).single(),
        supabase.from("looker_profiles").select("target_role, seniority, industries, visible").eq("user_id", user.id).single(),
        supabase.from("work_history").select("id, company_name, job_title, start_date, end_date, description").eq("user_id", user.id),
        supabase.from("education").select("id, school_name, degree_type, field_of_study, graduation_year").eq("user_id", user.id),
      ]);

      if (userRow) {
        setAccount({ name: userRow.name ?? "", email: userRow.email ?? "" });
      }
      if (profile) {
        setPrefs({
          targetRole: profile.target_role ?? "",
          seniority: profile.seniority ?? "",
          industries: profile.industries ?? [],
        });
        setVisible(profile.visible ?? true);
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

  const savePrefs = async () => {
    setEditingPrefs(false);
    if (!user) return;
    await supabase.from("looker_profiles")
      .update({
        target_role: prefs.targetRole || null,
        seniority: prefs.seniority || null,
        industries: prefs.industries,
      })
      .eq("user_id", user.id);
  };

  const saveVisible = async (v: boolean) => {
    setVisible(v);
    if (!user) return;
    await supabase.from("looker_profiles")
      .update({ visible: v })
      .eq("user_id", user.id);
  };

  const openSettings = () => {
    setDraftAccount(account);
    setDraftPassword({ current: "", next: "", confirm: "" });
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    setAccount(draftAccount);
    setSettingsOpen(false);
  };

  const completion = (() => {
    let done = 0;
    if (positions.length > 0) done++;
    if (prefs.industries.length > 0) done++;
    if (prefs.targetRole.trim()) done++;
    return Math.round((done / 3) * 100);
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 rounded-full border-2 border-border border-t-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visibility */}
      <div className="glass-card p-5 flex items-start gap-4">
        <Switch checked={visible} onCheckedChange={saveVisible} className="mt-0.5" />
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
        <p className="text-base font-semibold text-foreground">{account.name || "—"}</p>
        <p className="text-sm text-muted-foreground">{account.email || "—"}</p>
        <button onClick={openSettings} className="text-xs text-accent hover:underline mt-2">Update in settings</button>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account settings</DialogTitle>
            <DialogDescription>Update your name, email, or password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</label>
              <Input value={draftAccount.name} onChange={(e) => setDraftAccount({ ...draftAccount, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <Input type="email" value={draftAccount.email} onChange={(e) => setDraftAccount({ ...draftAccount, email: e.target.value })} />
            </div>
            <div className="pt-2 border-t border-border/40 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Change password</p>
              <Input type="password" placeholder="Current password" value={draftPassword.current} onChange={(e) => setDraftPassword({ ...draftPassword, current: e.target.value })} />
              <Input type="password" placeholder="New password" value={draftPassword.next} onChange={(e) => setDraftPassword({ ...draftPassword, next: e.target.value })} />
              <Input type="password" placeholder="Confirm new password" value={draftPassword.confirm} onChange={(e) => setDraftPassword({ ...draftPassword, confirm: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={saveSettings} className="bg-accent text-accent-foreground hover:bg-accent/90">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Experience */}
      <ExperienceCard
        resumeFile={null}
        onResumeChange={() => {}}
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
            <button onClick={savePrefs} className="p-1.5 rounded-lg hover:bg-muted">
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
