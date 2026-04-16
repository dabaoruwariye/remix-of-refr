import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, ArrowRight, ArrowLeft } from "lucide-react";
import OnboardingProgress from "./OnboardingProgress";
import MultiSelectTags from "./MultiSelectTags";
import { useToast } from "@/hooks/use-toast";

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Media", "Real Estate", "Energy", "Consulting", "Legal",
  "Manufacturing", "Transportation", "Hospitality", "Nonprofit", "Government",
];

const ROLE_TYPES = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Operations", "Data", "HR / People", "Finance", "Legal",
];

const STEPS = ["Account", "Experience", "Preferences", "Pitch", "Visibility"];

const LookerProfileForm = () => {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    role: "", company: "",
    industries: [] as string[], targetRole: "", seniority: "", location: "",
    pitch: "",
    visible: true,
  });

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const copyLink = () => {
    navigator.clipboard.writeText("https://refr.app/u/your-profile");
    setCopied(true);
    toast({ title: "Link copied!", description: "Share it with people who can vouch for you." });
    setTimeout(() => setCopied(false), 2000);
  };

  const slide = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  };

  if (step === 6) {
    return (
      <div className="container max-w-md py-32 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-7 h-7 text-success" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground mb-3">Your profile is live.</h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Share Refr with people in your network who can vouch for you.
          </p>
          <Button
            onClick={copyLink}
            variant="outline"
            className="gap-2 rounded-full px-6 h-11 border-border/50 hover:bg-card"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy your profile link"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16">
      <OnboardingProgress currentStep={step} totalSteps={5} labels={STEPS} />

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
            <motion.div key="s2" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Your experience</h2>
                <p className="text-sm text-muted-foreground">Current or most recent position.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
                  <Input value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="Product Designer" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</label>
                  <Input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Inc." />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">What you're looking for</h2>
                <p className="text-sm text-muted-foreground">Help referrers match you with the right opportunities.</p>
              </div>
              <div className="space-y-4">
                <MultiSelectTags
                  label="Industries you've worked in"
                  options={INDUSTRIES}
                  selected={form.industries}
                  onChange={(v) => update("industries", v)}
                  placeholder="Search industries..."
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred location</label>
                  <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="San Francisco, Remote, etc." />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Your pitch</h2>
                <p className="text-sm text-muted-foreground">
                  What makes you a strong candidate? This is what referrers will see.
                </p>
              </div>
              <div>
                <Textarea
                  value={form.pitch}
                  onChange={(e) => update("pitch", e.target.value)}
                  placeholder="Two sentences about what makes you great at what you do..."
                  className="min-h-[120px] resize-none"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right mt-2">{form.pitch.length}/300</p>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" {...slide} className="space-y-6">
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
            {step === 5 ? "Complete" : "Continue"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LookerProfileForm;
