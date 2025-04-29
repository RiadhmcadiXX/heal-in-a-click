
import { useState, useEffect } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientFilesList } from "@/components/PatientFilesList";
import { PatientFileUpload } from "@/components/PatientFileUpload";
import { PatientTable } from "@/components/PatientTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Search, Grid, FileText, User, Phone, Mail, MapPin, Calendar, List } from "lucide-react";
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

export default function PatientsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientFiles, setShowPatientFiles] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "table">("grid");

  useEffect(() => {
    if (user) {
      fetchDoctorId();
    }
  }, [user]);

  useEffect(() => {
    if (doctorId) {
      fetchPatients();
    }
  }, [doctorId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = patients.filter(patient => 
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (patient.phone && patient.phone.includes(searchQuery))
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  async function fetchDoctorId() {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      setDoctorId(data.id);
    } catch (error: any) {
      console.error('Error fetching doctor ID:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch doctor information",
      });
    }
  }

  async function fetchPatients() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patients (
            id,
            first_name,
            last_name,
            phone,
            email,
            city,
            date_of_birth
          )
        `)
        .eq('doctor_id', doctorId)
        .not('patient_id', 'is', null);

      if (error) throw error;

      // Extract unique patients from appointments
      const uniquePatients = data.reduce((acc: Patient[], item) => {
        if (item.patients && !acc.some(p => p.id === item.patients.id)) {
          acc.push(item.patients);
        }
        return acc;
      }, []);

      setPatients(uniquePatients);
      setFilteredPatients(uniquePatients);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch patients",
      });
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "Not provided";
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return "Invalid date";
    }
  }

  function handleViewFiles(patient: Patient) {
    setSelectedPatient(patient);
    setShowPatientFiles(true);
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Patients Management</h1>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as "grid" | "table")} className="mb-6">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="h-4 w-4" /> Grid View
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" /> Table View
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPatients.length > 0 ? (
          <>
            {viewType === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient) => (
                  <Card key={patient.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{patient.phone || "No phone"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{patient.email || "No email"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{patient.city || "No city"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(patient.date_of_birth)}</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleViewFiles(patient)}
                      >
                        <FileText className="h-4 w-4" />
                        Manage Files
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {viewType === "table" && (
              <PatientTable 
                patients={filteredPatients}
                onViewFiles={handleViewFiles}
              />
            )}
          </>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium">No patients found</h3>
            <p className="text-gray-500">
              {searchQuery ? "Try adjusting your search query" : "You don't have any patients yet"}
            </p>
          </div>
        )}
      </div>

      {/* Patient Files Dialog */}
      <Dialog open={showPatientFiles} onOpenChange={setShowPatientFiles}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5" />
              Patient Files - {selectedPatient?.first_name} {selectedPatient?.last_name}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="files">View Files</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="mt-2">
              {selectedPatient && (
                <PatientFilesList patientId={selectedPatient.id} />
              )}
            </TabsContent>
            
            <TabsContent value="upload" className="mt-2">
              {selectedPatient && doctorId && (
                <PatientFileUpload 
                  patientId={selectedPatient.id}
                  doctorId={doctorId}
                  onUploadComplete={() => {
                    toast({
                      title: "File uploaded",
                      description: "The file has been uploaded successfully"
                    });
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
