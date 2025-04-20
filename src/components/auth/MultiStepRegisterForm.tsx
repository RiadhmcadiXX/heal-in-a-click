
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Step1AccountInfo from "./steps/Step1AccountInfo";
import Step2PersonalInfo from "./steps/Step2PersonalInfo";
import Step3ProfessionalInfo from "./steps/Step3ProfessionalInfo";

export type RegisterFormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  specialty: string;
  experience: number;
  consultationFee: number;
  bio: string;
}

export function MultiStepRegisterForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    specialty: "",
    experience: 0,
    consultationFee: 0,
    bio: "",
  });
  
  const updateFormData = (stepData: Partial<RegisterFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };
  
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Doctor Registration</CardTitle>
        <CardDescription className="text-center">
          Step {step} of 3: {step === 1 ? "Account Information" : step === 2 ? "Personal Information" : "Professional Details"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {step === 1 && (
          <Step1AccountInfo 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={nextStep} 
          />
        )}
        {step === 2 && (
          <Step2PersonalInfo 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 3 && (
          <Step3ProfessionalInfo 
            formData={formData}
            updateFormData={updateFormData}
            onBack={prevStep}
          />
        )}
      </CardContent>
    </Card>
  );
}
