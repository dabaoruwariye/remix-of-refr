import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const OnboardingProgress = ({ currentStep, totalSteps, labels }: OnboardingProgressProps) => {
  return (
    <div className="w-full max-w-md mx-auto mb-10">
      {/* Step dots with connecting line */}
      <div className="relative flex justify-between items-center mb-4">
        {/* Background line */}
        <div className="absolute left-4 right-4 top-1/2 h-px bg-border" />
        {/* Progress line */}
        <div
          className="absolute left-4 top-1/2 h-px bg-accent transition-all duration-700 ease-out"
          style={{ width: `calc(${((currentStep - 1) / (totalSteps - 1)) * 100}% - 32px)` }}
        />

        {labels.map((label, i) => {
          const step = i + 1;
          const isComplete = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div key={label} className="relative flex flex-col items-center gap-2 z-10">
              <div
                className={`step-indicator ${
                  isComplete
                    ? "step-indicator-complete"
                    : isActive
                    ? "step-indicator-active"
                    : "step-indicator-pending"
                }`}
              >
                {isComplete ? <Check className="w-3.5 h-3.5" /> : step}
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide uppercase hidden sm:block transition-colors duration-300 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
