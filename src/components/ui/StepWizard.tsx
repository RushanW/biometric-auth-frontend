export function StepWizard({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-3 text-xs text-neutral-400">Step {step} of {total}</div>
  );
}