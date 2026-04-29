import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Download } from "lucide-react";
import OnboardingProgress from "./OnboardingProgress";
import ResumeUpload from "./ResumeUpload";

const STEPS = ["Account", "Experience", "Extension"];
const TOTAL = STEPS.length;

const ReferrerDashboard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    resume: null as File | null,
  });

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const next = () => {
    if (step === TOTAL) {
      navigate("/dashboard");
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
            <motion.div key="r2" {...slide}>
              <ResumeUpload file={form.resume} onChange={(f) => update("resume", f)} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="r3" {...slide} className="space-y-6">
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
            {step === TOTAL ? "Complete" : "Continue"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReferrerDashboard;