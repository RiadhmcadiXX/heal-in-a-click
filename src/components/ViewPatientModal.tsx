import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Heart,
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { PatientFileUpload } from "./PatientFileUpload";
import { PatientFilesList } from "./PatientFilesList";

export function ViewPatientModal({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const pat = appointment.patients || {};
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided";
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return "Invalid date";
    }
  };

  const renderArrayField = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return <span className="text-gray-400">None listed</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {arr.map((item, index) => (
          <Badge key={index} variant="secondary">{item}</Badge>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6" />
            Patient Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{pat.first_name} {pat.last_name}</div>
                  <div className="text-sm text-gray-500">Name</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{pat.phone || "No phone"}</div>
                  <div className="text-sm text-gray-500">Phone</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{pat.email || "No email"}</div>
                  <div className="text-sm text-gray-500">Email</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{formatDate(pat.date_of_birth)}</div>
                  <div className="text-sm text-gray-500">Date of Birth</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Location Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Location</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <div className="font-medium">{pat.address || "No address provided"}</div>
                  <div className="text-sm text-gray-500">Address</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-medium">{pat.city || "No city provided"}</div>
                <div className="text-sm text-gray-500">City</div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Emergency Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{pat.emergency_contact_name || "Not provided"}</div>
                  <div className="text-sm text-gray-500">Contact Name</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{pat.emergency_contact_phone || "Not provided"}</div>
                  <div className="text-sm text-gray-500">Contact Phone</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Medical Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Medical Information</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Allergies</span>
                </div>
                {renderArrayField(pat.allergies)}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Medical Conditions</span>
                </div>
                {renderArrayField(pat.medical_conditions)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Blood Type</span>
                </div>
                <div className="mt-1">{pat.blood_type || "Not provided"}</div>
              </div>
            </div>
          </Card>

          {/* Appointment Notes */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Appointment Notes</h3>
            <div className="text-gray-700">
              {appointment.notes || <span className="text-gray-400">No notes for this appointment</span>}
            </div>
          </Card>

          {/* Add Files Section */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Patient Files</h3>
            <div className="space-y-4">
              <PatientFilesList patientId={appointment.patient_id} />
              <PatientFileUpload 
                patientId={appointment.patient_id} 
                doctorId={appointment.doctor_id}
                onUploadComplete={() => {
                  // Refresh the file list when a new file is uploaded
                  const filesList = document.querySelector('PatientFilesList');
                  if (filesList) {
                    // @ts-ignore
                    filesList.loadFiles();
                  }
                }}
              />
            </div>
          </Card>
        </div>

        <DialogClose asChild>
          <button className="mt-6 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors w-full">
            Close
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
