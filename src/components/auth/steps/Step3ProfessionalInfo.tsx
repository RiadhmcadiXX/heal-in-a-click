
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { RegisterFormData } from "../MultiStepRegisterForm";

interface Step3Props {
  formData: RegisterFormData;
  updateFormData: (data: Partial<RegisterFormData>) => void;
  onBack: () => void;
}

export default function Step3ProfessionalInfo({ formData, updateFormData, onBack }: Step3Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    specialty?: string;
    experience?: string;
    consultationFee?: string;
  }>({});
  
  const specialties = [
    "Cardiology", 
    "Dermatology", 
    "Neurology", 
    "Orthopedics", 
    "Pediatrics", 
    "Psychiatry", 
    "Gynecology", 
    "Ophthalmology", 
    "General Practice"
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    if (!formData.specialty) newErrors.specialty = "Specialty is required";
    if (!formData.experience) newErrors.experience = "Years of experience is required";
    if (!formData.consultationFee) newErrors.consultationFee = "Consultation fee is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Create the user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // 2. Create a doctor record
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert([
            { 
              user_id: authData.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              specialty: formData.specialty,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              experience: formData.experience,
              consultation_fee: formData.consultationFee,
              bio: formData.bio
            }
          ]);
        
        if (doctorError) throw doctorError;
        
        toast({
          title: "Account created successfully!",
          description: "Please verify your email to continue.",
        });
        
        navigate("/login");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create account",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="specialty">Specialty</Label>
        <Select value={formData.specialty} onValueChange={(value) => updateFormData({ specialty: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.specialty && <p className="text-sm text-red-500">{errors.specialty}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <Input
          id="experience"
          type="number"
          min="0"
          value={formData.experience}
          onChange={(e) => updateFormData({ experience: parseInt(e.target.value) })}
        />
        {errors.experience && <p className="text-sm text-red-500">{errors.experience}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
        <Input
          id="consultationFee"
          type="number"
          min="0"
          step="0.01"
          value={formData.consultationFee}
          onChange={(e) => updateFormData({ consultationFee: parseFloat(e.target.value) })}
        />
        {errors.consultationFee && <p className="text-sm text-red-500">{errors.consultationFee}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => updateFormData({ bio: e.target.value })}
          placeholder="Tell us about your professional background..."
          className="h-24"
        />
      </div>
      
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Complete Registration"}
        </Button>
      </div>
    </form>
  );
}
