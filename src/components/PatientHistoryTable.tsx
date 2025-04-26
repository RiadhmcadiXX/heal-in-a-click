
import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ViewPatientModal } from "@/components/ViewPatientModal";
import { format } from "date-fns";
import { Search } from "lucide-react";

interface PatientVisit {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  patients: {
    first_name: string;
    last_name: string;
    [key: string]: any;
  };
  status: string;
}

export function PatientHistoryTable({ visits }: { visits: PatientVisit[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<PatientVisit | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const filteredVisits = visits.filter((visit) => {
    const patientName = `${visit.patients.first_name} ${visit.patients.last_name}`.toLowerCase();
    return patientName.includes(searchQuery.toLowerCase());
  });

  // Group visits by patient
  const patientVisits = filteredVisits.reduce((acc, visit) => {
    if (!acc[visit.patient_id]) {
      acc[visit.patient_id] = {
        patient: visit.patients,
        visits: [],
        lastVisit: visit.appointment_date
      };
    }
    
    acc[visit.patient_id].visits.push(visit);
    
    // Update last visit if current visit is more recent
    if (visit.appointment_date > acc[visit.patient_id].lastVisit) {
      acc[visit.patient_id].lastVisit = visit.appointment_date;
    }
    
    return acc;
  }, {} as Record<string, { patient: any; visits: PatientVisit[]; lastVisit: string }>);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(patientVisits).map(([patientId, data]) => (
              <TableRow key={patientId}>
                <TableCell className="font-medium">
                  {data.patient.first_name} {data.patient.last_name}
                </TableCell>
                <TableCell>{data.visits.length}</TableCell>
                <TableCell>
                  {format(new Date(data.lastVisit), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => {
                      setSelectedAppointment(data.visits[data.visits.length - 1]);
                      setShowPatientModal(true);
                    }}
                    className="text-primary hover:underline"
                  >
                    View Profile
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedAppointment && (
        <ViewPatientModal
          appointment={selectedAppointment}
          open={showPatientModal}
          onOpenChange={setShowPatientModal}
        />
      )}
    </div>
  );
}
