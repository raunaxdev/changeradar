const STEPS = [
  "Extracting text & page coordinates in RAM...",
  "Running deterministic Myers/difflib comparison...",
  "Analyzing risk consequences via Gemini AI...",
];

export function ProcessingStepper({ currentStep }: { currentStep: number }) {
  return (
    <ol
      className="my-4 grid gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4"
      aria-live="polite"
      aria-label="Comparison progress"
    >
      {STEPS.map((step, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li key={step} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                isComplete
                  ? "bg-emerald-600 text-white"
                  : isActive
                    ? "bg-white text-emerald-700 ring-2 ring-emerald-300"
                    : "bg-white text-[#9ba79e] ring-1 ring-[#dce7de]"
              }`}
            >
              {isComplete ? (
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className={isActive ? "animate-pulse" : ""}>{index + 1}</span>
              )}
            </span>
            <span
              className={`text-left text-[11px] leading-4 ${
                isActive ? "font-semibold text-emerald-900" : isComplete ? "font-medium text-emerald-800" : "text-[#8b978f]"
              }`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
