
import { Button } from "@/components/ui/button";
import { BarChart, Calendar, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface DoctorHeaderProps {
  doctor: { first_name: string; last_name: string; specialty: string } | null;
  selectedDate: Date;
}

export function DoctorHeader({ doctor, selectedDate }: DoctorHeaderProps) {
  const navigate = useNavigate();
  
  if (!doctor) return null;
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, Dr. {doctor.first_name} {doctor.last_name}
        </h1>
        <p className="text-gray-500">{doctor.specialty}</p>
      </div>
      
      <div className="flex justify-end mb-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold">
            Appointments for {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              <span>View Analytics</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/availability')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Manage Availability</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
