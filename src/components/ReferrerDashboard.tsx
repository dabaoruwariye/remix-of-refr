import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
    name: "",
    email: "",
    password: "",
    role: "",
    company: "",
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

  const slideVariant = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Confirmation screen
  if (step === 6) {
    return (
      <div className="container max-w-lg py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">You're all set.</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
            Browse LinkedIn like you normally would and Refr will do the rest.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Linkedin className="w-4 h-4" />
            <span>Extension active</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-12">
      <OnboardingProgress currentStep={step} totalSteps={5} labels={STEPS} />

      <Card className="border-border shadow-sm">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="r1" {...slideVariant} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Create your account</h2>
                  <p className="text-sm text-muted-foreground">Let's start with the basics.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Full name</label>
                    <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="r2" {...slideVariant} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Your experience</h2>
                  <p className="text-sm text-muted-foreground">Current or most recent position.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Role</label>
                    <Input value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="Senior Engineer" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Company</label>
                    <Input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Inc." />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="r3" {...slideVariant} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Education</h2>
                  <p className="text-sm text-muted-foreground">Schools you've attended — this helps us match your network.</p>
                </div>
                <div className="space-y-4">
                  {form.schools.map((school, i) => (
                    <div key={i} className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-foreground">School</label>
                        <Input value={school.name} onChange={(e) => updateSchool(i, "name", e.target.value)} placeholder="MIT" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Year</label>
                        <Input value={school.year} onChange={(e) => updateSchool(i, "year", e.target.value)} placeholder="2019" />
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addSchool} className="text-accent">
                    + Add another school
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="r4" {...slideVariant} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Your network</h2>
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
                  <div>
                    <label className="text-sm font-medium text-foreground">
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
              <motion.div key="r5" {...slideVariant} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    One last step — this is where the magic happens.
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The Refr extension runs in the background while you browse LinkedIn. When it detects
                    a hiring signal from your network, it surfaces people on Refr you could refer — right
                    in the moment.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 h-12 border-dashed border-2"
                  onClick={() => {}}
                >
                  <Download className="w-5 h-5" />
                  Download the Refr Chrome Extension
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Works with Chrome, Edge, Brave, and Arc.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={back} disabled={step === 1} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={next} className="gap-1.5">
              {step === 5 ? "Complete" : "Continue"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferrerDashboard;
