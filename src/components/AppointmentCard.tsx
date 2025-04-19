
import { Card, CardContent } from "@/components/ui/card";
import { Appointment } from "@/types";

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="mb-4 overflow-hidden border-l-4 border-l-healthcare-primary">
      <CardContent className="p-4">
        <div className="flex items-center">
          <img
            src={appointment.doctorImageUrl}
            alt={appointment.doctorName}
            className="h-16 w-16 rounded-full object-cover mr-4"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{appointment.doctorName}</h3>
            <p className="text-sm text-gray-500">{appointment.doctorSpecialty}</p>
            
            <div className="mt-2 flex items-center text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-healthcare-primary mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="mr-3">{formatDate(appointment.date)}</span>
              
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-healthcare-primary mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{appointment.startTime} - {appointment.endTime}</span>
            </div>
            
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
              }>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
