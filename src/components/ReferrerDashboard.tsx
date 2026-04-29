import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Download } from "lucide-react";
import OnboardingProgress from "./OnboardingProgress";
import MultiSelectDropdown from "./MultiSelectDropdown";
import ResumeUpload from "./ResumeUpload";
import ExperienceCard, { type Position, type Education } from "./shared/ExperienceCard";
import { useAuth } from "@/context/AuthContext";
import { uploadResume, parsedToPositions, parsedToEducation } from "@/lib/resume";
import { supabase } from "@/lib/supabase";
import { INDUSTRIES } from "@/lib/refrConstants";

const STEPS = ["Account", "Experience", "Preferences", "Extension"];
const TOTAL = STEPS.length;

const ReferrerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, user } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resume parsing state
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    resume: null as File | null,
    positions: [] as Position[],
    education: [] as Education[],
    industries: [] as string[],
    networkDescription: "",
  });

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileSelect = async (file: File | null) => {
    update("resume", file);
    if (!file) return;
    setParsing(true);
    setParseError(null);
    try {
      const data = await uploadResume(file);
      update("positions", parsedToPositions(data.work_history));
      update("education", parsedToEducation(data.education));
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse resume. You can fill in your experience manually.");
    } finally {
      setParsing(false);
    }
  };

  const next = async () => {
    setError(null);

    // Step 1 → create account so user is authenticated for step 2+
    if (step === 1) {
      setSubmitting(true);
      try {
        const inviteId = searchParams.get("invite_id") ?? undefined;
        await signup(form.name, form.email, form.password, "referrer", inviteId);
        setStep(2);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Step 3 → save preferences before advancing to extension step
    if (step === 3) {
      setSubmitting(true);
      try {
        const { error: prefErr } = await supabase.from("referrer_profiles")
          .update({
            industries: form.industries,
            network_description: form.networkDescription || null,
          })
          .eq("user_id", user?.id);
        if (prefErr) throw prefErr;
        setStep(4);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save preferences. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Last step → navigate to dashboard
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

          {/* Step 1 — Account */}
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
              {error && <p className="text-sm text-destructive">{error}</p>}
            </motion.div>
          )}

          {/* Step 2 — Experience */}
          {step === 2 && (
            <motion.div key="r2" {...slide} className="space-y-4">
              {parsing && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-border border-t-accent animate-spin" />
                  <p className="text-sm text-muted-foreground">Parsing your resume with AI…</p>
                </div>
              )}

              {!parsing && form.positions.length === 0 && (
                <>
                  <ResumeUpload file={form.resume} onChange={handleFileSelect} />
                  {parseError && (
                    <p className="text-sm text-destructive">{parseError}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline w-full text-center"
                  >
                    Skip for now
                  </button>
                </>
              )}

              {!parsing && form.positions.length > 0 && (
                <ExperienceCard
                  resumeFile={form.resume}
                  onResumeChange={handleFileSelect}
                  positions={form.positions}
                  setPositions={(p) => update("positions", p)}
                  education={form.education}
                  setEducation={(e) => update("education", e)}
                />
              )}
            </motion.div>
          )}

          {/* Step 3 — Preferences */}
          {step === 3 && (
            <motion.div key="r3" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Your network</h2>
                <p className="text-sm text-muted-foreground">Help us understand who you know and where you work.</p>
              </div>
              <div className="space-y-4">
                <MultiSelectDropdown
                  label="Industries"
                  helper="Industries where you have a strong network."
                  options={INDUSTRIES}
                  selected={form.industries}
                  onChange={(v) => update("industries", v)}
                  placeholder="Select industries"
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Network description</label>
                  <Textarea
                    value={form.networkDescription}
                    onChange={(e) => update("networkDescription", e.target.value)}
                    placeholder="e.g. mostly operators and PMs from early stage startups."
                    className="min-h-[90px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Optional. Helps calibrate which roles the extension surfaces.</p>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </motion.div>
          )}

          {/* Step 4 — Extension */}
          {step === 4 && (
            <motion.div key="r4" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">One last step.</h2>
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
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 1 || submitting || parsing}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            onClick={next}
            disabled={submitting || parsing}
            className="gap-1.5 rounded-full px-6 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {submitting
              ? step === 1 ? "Creating account…" : "Saving…"
              : step === TOTAL
              ? "Go to dashboard"
              : "Continue"}
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReferrerDashboard;
