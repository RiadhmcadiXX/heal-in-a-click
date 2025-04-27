
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PatientVisit } from "@/types";

interface PatientSelectorProps {
  patients: PatientVisit[];
  selectedPatient: string | null;
  onSelectPatient: (patientId: string) => void;
}

export default function PatientSelector({ 
  patients, 
  selectedPatient, 
  onSelectPatient 
}: PatientSelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Select Patient</h2>
        <Select value={selectedPatient || undefined} onValueChange={onSelectPatient}>
          <SelectTrigger>
            <SelectValue placeholder="Select a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.patient_id} value={patient.patient_id}>
                {patient.patients.first_name} {patient.patients.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
