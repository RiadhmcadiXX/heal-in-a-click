
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationDetailsSectionProps {
  form: {
    location_type: string;
    exact_location_address: string | null;
    building_name: string | null;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
}

export function LocationDetailsSection({
  form,
  handleInputChange,
  handleSelectChange,
}: LocationDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Location Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location_type">Location Type</Label>
          <Select
            value={form.location_type}
            onValueChange={(value) => handleSelectChange("location_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cabinet">Private Cabinet</SelectItem>
              <SelectItem value="clinic">Clinic</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="medical_center">Medical Center</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="building_name">Building Name</Label>
          <Input
            id="building_name"
            name="building_name"
            value={form.building_name || ""}
            onChange={handleInputChange}
            placeholder="e.g., Medical Tower, City Hospital"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="exact_location_address">Exact Location Address</Label>
          <Input
            id="exact_location_address"
            name="exact_location_address"
            value={form.exact_location_address || ""}
            onChange={handleInputChange}
            placeholder="Full address of your practice location"
          />
        </div>
      </div>
    </div>
  );
}
