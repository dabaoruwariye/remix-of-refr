import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ArrowRight, ArrowLeft, Download, Linkedin } from "lucide-react";
import OnboardingProgress from "./OnboardingProgress";
import MultiSelectTags from "./MultiSelectTags";

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Media", "Real Estate", "Energy", "Consulting", "Legal",
  "Manufacturing", "Transportation", "Hospitality", "Nonprofit", "Government",
];

const STEPS = ["Account", "Experience", "Education", "Network", "Extension"];

const ReferrerDashboard = () => {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    role: "", company: "",
    schools: [{ name: "", year: "" }],
    industries: [] as string[],
    networkDescription: "",
  });

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateSchool = (index: number, field: "name" | "year", value: string) => {
    const schools = [...form.schools];
    schools[index] = { ...schools[index], [field]: value };
    setForm((prev) => ({ ...prev, schools }));
  };

  const addSchool = () =>
    setForm((prev) => ({ ...prev, schools: [...prev.schools, { name: "", year: "" }] }));

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));

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
          <h2 className="text-3xl font-semibold text-foreground mb-3">You're all set.</h2>
          <p className="text-muted-foreground mb-10 leading-relaxed max-w-sm mx-auto">
            Browse LinkedIn like you normally would and Refr will do the rest.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 border border-border/50 rounded-full px-4 py-2">
            <Linkedin className="w-4 h-4 text-accent" />
            <span>Extension active</span>
          </div>
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
            <motion.div key="r1" {...slide} className="space-y-6">
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
            <motion.div key="r2" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Your experience</h2>
                <p className="text-sm text-muted-foreground">Current or most recent position.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
                  <Input value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="Senior Engineer" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</label>
                  <Input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Inc." />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="r3" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Education</h2>
                <p className="text-sm text-muted-foreground">Schools you've attended — this helps us match your network.</p>
              </div>
              <div className="space-y-4">
                {form.schools.map((school, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">School</label>
                      <Input value={school.name} onChange={(e) => updateSchool(i, "name", e.target.value)} placeholder="MIT" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Year</label>
                      <Input value={school.year} onChange={(e) => updateSchool(i, "year", e.target.value)} placeholder="2019" />
                    </div>
                  </div>
                ))}
                <button onClick={addSchool} className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                  + Add another school
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="r4" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Your network</h2>
                <p className="text-sm text-muted-foreground">Tell us about the people you know.</p>
              </div>
              <div className="space-y-4">
                <MultiSelectTags
                  label="Industries you know well"
                  options={INDUSTRIES}
                  selected={form.industries}
                  onChange={(v) => update("industries", v)}
                  placeholder="Search industries..."
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Describe the kinds of people in your network
                  </label>
                  <Textarea
                    value={form.networkDescription}
                    onChange={(e) => update("networkDescription", e.target.value)}
                    placeholder="e.g. Early-stage startup founders, senior engineers at FAANG companies..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="r5" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">
                  One last step.
                </h2>
                <p className="text-lg text-muted-foreground font-light mb-2">
                  This is where the magic happens.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Refr extension runs in the background while you browse LinkedIn. When it detects
                  a hiring signal from your network, it surfaces people on Refr you could refer — right
                  in the moment.
                </p>
              </div>
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl border-2 border-dashed border-border/70 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium text-sm">Download the Refr Chrome Extension</span>
              </button>
              <p className="text-[11px] text-muted-foreground text-center tracking-wide">
                Works with Chrome, Edge, Brave, and Arc.
              </p>
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

export default ReferrerDashboard;
