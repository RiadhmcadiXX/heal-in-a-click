
import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ViewPatientModal } from "@/components/ViewPatientModal";
import { format } from "date-fns";
import { Search, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PatientFileUpload } from "@/components/PatientFileUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface PatientFiles {
  [key: string]: number;
}

export function PatientHistoryTable({ visits }: { visits: PatientVisit[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<PatientVisit | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientFiles, setPatientFiles] = useState<PatientFiles>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  useEffect(() => {
    loadPatientFilesCount();
  }, [visits]);

  const loadPatientFilesCount = async () => {
    const patientIds = [...new Set(visits.map(visit => visit.patient_id))];
    
    try {
      const { data, error } = await supabase
        .from('patient_files')
        .select('patient_id')
        .in('patient_id', patientIds);

      if (error) throw error;

      const filesCount: PatientFiles = {};
      data.forEach(file => {
        filesCount[file.patient_id] = (filesCount[file.patient_id] || 0) + 1;
      });

      setPatientFiles(filesCount);
    } catch (error) {
      console.error('Error loading patient files count:', error);
    }
  };

  const filteredVisits = visits.filter((visit) => {
    const patientName = `${visit.patients.first_name} ${visit.patients.last_name}`.toLowerCase();
    return patientName.includes(searchQuery.toLowerCase());
  });

  const patientVisits = filteredVisits.reduce((acc, visit) => {
    if (!acc[visit.patient_id]) {
      acc[visit.patient_id] = {
        patient: visit.patients,
        visits: [],
        lastVisit: visit.appointment_date
      };
    }
    
    acc[visit.patient_id].visits.push(visit);
    
    if (visit.appointment_date > acc[visit.patient_id].lastVisit) {
      acc[visit.patient_id].lastVisit = visit.appointment_date;
    }
    
    return acc;
  }, {} as Record<string, { patient: any; visits: PatientVisit[]; lastVisit: string }>);

  const handleUploadClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowUploadModal(true);
  };

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
              <TableHead>Files</TableHead>
              <TableHead>Actions</TableHead>
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
                  <div className="flex items-center gap-2">
                    {patientFiles[patientId] ? (
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        {patientFiles[patientId]}
                      </span>
                    ) : (
                      "No files"
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAppointment(data.visits[data.visits.length - 1]);
                        setShowPatientModal(true);
                      }}
                      className="text-primary hover:underline"
                    >
                      View Profile
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUploadClick(patientId)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add File
                    </Button>
                  </div>
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

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Patient File</DialogTitle>
          </DialogHeader>
          {selectedPatientId && (
            <PatientFileUpload
              patientId={selectedPatientId}
              doctorId={selectedAppointment?.doctor_id || ''}
              onUploadComplete={() => {
                setShowUploadModal(false);
                loadPatientFilesCount();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
