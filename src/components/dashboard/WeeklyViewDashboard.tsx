
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyCalendarView } from "@/components/WeeklyCalendarView";

interface WeeklyViewDashboardProps {
  appointments: any[];
  onAppointmentClick: (apt: any) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeeklyViewDashboard({
  appointments,
  onAppointmentClick,
  selectedDate,
  onDateChange,
}: WeeklyViewDashboardProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Card className="p-4 w-full">
        <WeeklyCalendarView
          appointments={appointments}
          onAppointmentClick={onAppointmentClick}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      </Card>
    </div>
  );
}
