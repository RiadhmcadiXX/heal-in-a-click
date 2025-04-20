
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { RegisterFormData } from "../MultiStepRegisterForm";

interface Step1Props {
  formData: RegisterFormData;
  updateFormData: (data: Partial<RegisterFormData>) => void;
  onNext: () => void;
}

export default function Step1AccountInfo({ formData, updateFormData, onNext }: Step1Props) {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onNext();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="doctor@example.com"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => updateFormData({ password: e.target.value })}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        <p className="text-xs text-gray-500">
          Password must be at least 8 characters long
        </p>
      </div>
      
      <Button type="submit" className="w-full">Next</Button>
    </form>
  );
}
