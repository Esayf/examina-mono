import React, { useState } from "react";
import Step1 from "./Step1";

export default function CreateExamPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    console.log("Next step triggered");
    setCurrentStep((prev) => prev + 1);
  };

  return (
    <div>
      {currentStep === 1 && <Step1 onNext={handleNext} />}
      {/* Diğer stepler... */}
    </div>
  );
}
