
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  date_of_birth: string | null;
}

interface PatientTableProps {
  patients: Patient[];
  onViewFiles: (patient: Patient) => void;
}

export function PatientTable({ patients, onViewFiles }: PatientTableProps) {
  function formatDate(dateString: string | null) {
    if (!dateString) return "Not provided";
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return "Invalid date";
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><User className="h-4 w-4 inline mr-2" />Patient Name</TableHead>
            <TableHead><Mail className="h-4 w-4 inline mr-2" />Email</TableHead>
            <TableHead><Phone className="h-4 w-4 inline mr-2" />Phone</TableHead>
            <TableHead><Calendar className="h-4 w-4 inline mr-2" />Date of Birth</TableHead>
            <TableHead><MapPin className="h-4 w-4 inline mr-2" />City</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">
                {patient.first_name} {patient.last_name}
              </TableCell>
              <TableCell>{patient.email || "No email"}</TableCell>
              <TableCell>{patient.phone || "No phone"}</TableCell>
              <TableCell>{formatDate(patient.date_of_birth)}</TableCell>
              <TableCell>{patient.city || "No city"}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => onViewFiles(patient)}
                >
                  <FileText className="h-4 w-4" />
                  Manage Files
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {patients.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">No patients found</h3>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
