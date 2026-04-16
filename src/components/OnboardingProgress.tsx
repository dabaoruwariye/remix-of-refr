import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const OnboardingProgress = ({ currentStep, totalSteps, labels }: OnboardingProgressProps) => {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full max-w-lg mx-auto mb-10">
      <div className="flex justify-between mb-3">
        {labels.map((label, i) => {
          const step = i + 1;
          const isComplete = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className={`step-indicator ${
                  isComplete
                    ? "step-indicator-complete"
                    : isActive
                    ? "step-indicator-active"
                    : "step-indicator-pending"
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : step}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground hidden sm:block">
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
};

export default OnboardingProgress;
