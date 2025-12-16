"use client";

import { useState } from "react";
import Stepper from "./Stepper";
import CompanyDetailsStep from "./steps/CompanyDetailsStep";
import LocationStep from "./steps/LocationsStep";
import DeptRolesStep from "./steps/DeptRolesStep";

interface CompanySetupModalProps {
  onComplete: () => void;   // ✅ ADD THIS
}

export default function CompanySetupModal({ onComplete }: CompanySetupModalProps) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
    {/* <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"> */}
      <div className="bg-white w-full max-w-3xl rounded-xl p-6 relative">

        <Stepper currentStep={step} />

        {step === 1 && <CompanyDetailsStep onNext={() => setStep(2)} />}
        {step === 2 && (
          <LocationStep
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <DeptRolesStep
            onBack={() => setStep(2)}
            onComplete={onComplete}
          />
        )}
      </div>
    </div>
  );
}
