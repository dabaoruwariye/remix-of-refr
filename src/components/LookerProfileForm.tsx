import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft } from "lucide-react";
import OnboardingProgress from "./OnboardingProgress";
import MultiSelectDropdown from "./MultiSelectDropdown";
import ResumeUpload from "./ResumeUpload";

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Consumer",
  "Media", "Real Estate", "Government", "Nonprofit", "Retail",
  "Energy", "Legal", "Other",
];

const ROLE_TYPES = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Operations", "Data", "HR / People", "Finance", "Legal",
];

const STEPS = ["Account", "Experience", "Preferences", "Visibility"];
const TOTAL = STEPS.length;

const LookerProfileForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    resume: null as File | null,
    industries: [] as string[], targetRole: "", seniority: "",
    visible: true,
  });

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const next = () => {
    if (step === TOTAL) {
      navigate("/looker-dashboard");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const slide = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  };

  return (
    <div className="container max-w-md py-16">
      <OnboardingProgress currentStep={step} totalSteps={TOTAL} labels={STEPS} />

      <div className="glass-card p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Create your account</h2>
                <p className="text-sm text-muted-foreground">Let's start with the basics.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full name</label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
                  <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" {...slide}>
              <ResumeUpload file={form.resume} onChange={(f) => update("resume", f)} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">What you're looking for</h2>
                <p className="text-sm text-muted-foreground">Help referrers match you with the right opportunities.</p>
              </div>
              <div className="space-y-4">
                <MultiSelectDropdown
                  label="Industry"
                  helper="Select one or more that apply."
                  options={INDUSTRIES}
                  selected={form.industries}
                  onChange={(v) => update("industries", v)}
                  placeholder="Select industries"
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target role type</label>
                  <Select value={form.targetRole} onValueChange={(v) => update("targetRole", v)}>
                    <SelectTrigger><SelectValue placeholder="Select role type" /></SelectTrigger>
                    <SelectContent>
                      {ROLE_TYPES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Seniority level</label>
                  <Select value={form.seniority} onValueChange={(v) => update("seniority", v)}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      {["Junior", "Mid", "Senior", "Lead", "Executive"].map((l) => (
                        <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Profile visibility</h2>
                <p className="text-sm text-muted-foreground">Control who can discover you on Refr.</p>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-xl bg-muted/30 border border-border/50">
                <Switch
                  checked={form.visible}
                  onCheckedChange={(v) => update("visible", v)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Allow referrers who know me to see my profile on Refr
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Only people with a confirmed connection to you will see your profile. You control this at any time.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
          <Button variant="ghost" onClick={back} disabled={step === 1} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={next} className="gap-1.5 rounded-full px-6 bg-accent text-accent-foreground hover:bg-accent/90">
            {step === TOTAL ? "Complete" : "Continue"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LookerProfileForm;