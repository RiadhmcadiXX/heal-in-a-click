
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock } from "lucide-react";
import { AppointmentActions } from "@/components/AppointmentActions";

interface AppointmentsTableProps {
  appointments: any[];
  onAppointmentClick: (appointment: any) => void;
  selectedAppointmentId?: string | null;
  refreshAppointments: () => void;
}

export function AppointmentsTable({
  appointments,
  onAppointmentClick,
  selectedAppointmentId,
  refreshAppointments
}: AppointmentsTableProps) {
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (e) {
      console.error('Error formatting time:', e);
      return timeString;
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow
              key={appointment.id}
              className={cn(
                selectedAppointmentId === appointment.id ? "bg-gray-100" : "",
                appointment.status === 'pending' && "bg-yellow-50/50",
                appointment.status === 'accepted' && "bg-green-50/50",
                appointment.status === 'refused' && "bg-red-50/50"
              )}
              onClick={() => onAppointmentClick(appointment)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-healthcare-primary" />
                  {formatTime(appointment.appointment_time)}
                </div>
              </TableCell>
              <TableCell>
                {appointment.patients?.first_name} {appointment.patients?.last_name}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  {
                    "bg-yellow-100 text-yellow-800": appointment.status === "pending",
                    "bg-blue-100 text-blue-800": appointment.status === "accepted",
                    "bg-green-100 text-green-800": appointment.status === "completed",
                    "bg-red-100 text-red-800": appointment.status === "refused" || appointment.status === "cancelled",
                    "bg-gray-300 text-gray-900": appointment.status === "no-show"
                  }
                )}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {appointment.notes || "No notes"}
              </TableCell>
              <TableCell>
                <AppointmentActions appointment={appointment} refresh={refreshAppointments} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
