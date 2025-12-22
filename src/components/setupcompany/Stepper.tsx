interface Props {
  currentStep: number;
}

const steps = ["Company", "Locations", "Depts & Roles"];

export default function Stepper({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < currentStep;
        const active = step === currentStep;

        return (
          <div key={label} className="flex items-center w-full">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
              ${
                done
                  ? "bg-green-500 text-white"
                  : active
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {done ? "✓" : step}
            </div>

            <span className="ml-2 text-sm font-medium">{label}</span>

            {step !== steps.length && (
              <div className="flex-1 h-px bg-gray-300 mx-3" />
            )}
          </div>
        );
      })}
    </div>
  );
}
