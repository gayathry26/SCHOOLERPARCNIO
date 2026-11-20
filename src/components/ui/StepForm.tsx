import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepFormProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export const StepForm: React.FC<StepFormProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              <div
                className={clsx(
                  'flex items-center gap-2 select-none',
                  onStepClick && isCompleted ? 'cursor-pointer' : ''
                )}
                onClick={() => isCompleted && onStepClick?.(step.id)}
              >
                <div
                  className={clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 shrink-0',
                    isCompleted
                      ? 'bg-[#35B84A] text-white'
                      : isCurrent
                      ? 'bg-[#086A92] text-white ring-4 ring-[#086A92]/15 shadow-xs'
                      : 'bg-[#F1F5F7] text-[#6B7C83] border border-[#E4EAEC]'
                  )}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={clsx(
                      'text-xs font-bold leading-tight',
                      isCurrent ? 'text-[#086A92]' : isCompleted ? 'text-[#17313A]' : 'text-[#6B7C83]'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-[#6B7C83] leading-none mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-[2px] mx-2 transition-colors duration-200',
                    step.id < currentStep ? 'bg-[#35B84A]' : 'bg-[#E4EAEC]'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
