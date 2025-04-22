
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileFormFieldsProps {
  form: {
    first_name: string;
    last_name: string;
    email?: string;
    phone: string | null;
    languages: string[] | null;
    education: string[] | null;
    city: string | null;
    specialty: string;
    consultation_fee: number | null;
    bio: string | null;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleLanguagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEducationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileFormFields({
  form,
  handleInputChange,
  handleLanguagesChange,
  handleEducationChange,
}: ProfileFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500">
            Email cannot be changed.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={form.phone || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="languages">Languages</Label>
          <Input
            id="languages"
            name="languages"
            value={form.languages?.join(", ") || ""}
            onChange={handleLanguagesChange}
            placeholder="English, French, Arabic"
          />
          <p className="text-xs text-gray-500">Comma-separated (e.g., English, French)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="education">Education</Label>
          <Input
            id="education"
            name="education"
            value={form.education?.join(", ") || ""}
            onChange={handleEducationChange}
            placeholder="MD, PhD, MSc"
          />
          <p className="text-xs text-gray-500">Comma-separated (e.g., MD, MSc)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={form.city || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            name="specialty"
            value={form.specialty}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
          <Input
            id="consultation_fee"
            name="consultation_fee"
            type="number"
            value={form.consultation_fee ?? ""}
            onChange={handleInputChange}
            min="0"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={form.bio || ""}
          onChange={handleInputChange}
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Tell your patients about your background and philosophy of care.
        </p>
      </div>
    </>
  );
}
