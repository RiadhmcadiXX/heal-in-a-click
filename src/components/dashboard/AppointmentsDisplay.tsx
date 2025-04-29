
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppointmentsTable } from "@/components/AppointmentsTable";
import { useNavigate } from "react-router-dom";

interface AppointmentsDisplayProps {
  loading: boolean;
  appointments: any[];
  onAppointmentClick: (apt: any) => void;
  selectedAppointmentId: string | undefined;
  refreshAppointments: () => void;
}

export function AppointmentsDisplay({
  loading,
  appointments,
  onAppointmentClick,
  selectedAppointmentId,
  refreshAppointments,
}: AppointmentsDisplayProps) {
  const navigate = useNavigate();
  
  return (
    <div className="mt-8">
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading appointments...</div>
          ) : appointments.length > 0 ? (
            <AppointmentsTable
              appointments={appointments}
              onAppointmentClick={onAppointmentClick}
              selectedAppointmentId={selectedAppointmentId}
              refreshAppointments={refreshAppointments}
            />
          ) : (
            <div className="text-center py-8 border rounded-md p-6">
              <p className="text-gray-500">No appointments scheduled for this day.</p>
              <Button
                className="mt-4 bg-healthcare-primary hover:bg-healthcare-primary/90"
                onClick={() => navigate("/availability")}
              >
                Add Availability
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
