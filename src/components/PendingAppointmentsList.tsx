
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PendingAppointmentsListProps {
  appointments: any[];
  onStatusChange: () => void;
}

export function PendingAppointmentsList({ appointments, onStatusChange }: PendingAppointmentsListProps) {
  const { toast } = useToast();

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update appointment status",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Appointment ${status.toLowerCase()}`,
      });
      onStatusChange();
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Pending Appointments</h2>
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <p className="text-sm text-gray-500">No pending appointments</p>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="p-3 bg-yellow-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {appointment.patients?.first_name} {appointment.patients?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(`2000-01-01T${appointment.appointment_time}`), 'h:mm a')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleStatusUpdate(appointment.id, "accepted")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(appointment.id, "refused")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
