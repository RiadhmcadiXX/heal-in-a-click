
import { DayAvailabilitySidebar } from "@/components/DayAvailabilitySidebar";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { PendingAppointmentsList } from "@/components/PendingAppointmentsList";
import { format } from "date-fns";

interface DailyViewDashboardProps {
  slots: { time: string; status: "free" | "occupied" }[];
  onAddAppointmentClick: () => void;
  date: Date;
  onDateSelect: (newDate: Date | undefined) => void;
  hasAppointmentOnDate: (date: Date) => boolean;
  pendingAppointments: any[];
  onStatusChange: () => void;
}

export function DailyViewDashboard({
  slots,
  onAddAppointmentClick,
  date,
  onDateSelect,
  hasAppointmentOnDate,
  pendingAppointments,
  onStatusChange,
}: DailyViewDashboardProps) {
  function formatHourLabel(t: string) {
    const [h, m] = t.split(":");
    const date = new Date(2000, 1, 1, Number(h), Number(m), 0);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex gap-6 items-start">
      <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
        <DayAvailabilitySidebar
          slots={slots.map((s) => ({
            time: formatHourLabel(s.time),
            status: s.status,
          }))}
          onAddAppointmentClick={onAddAppointmentClick}
          onSlotClick={undefined}
        />

        <div className="flex-1 w-full md:max-w-xl">
          <MonthlyCalendar
            date={date}
            onDateSelect={onDateSelect}
            hasAppointmentOnDate={hasAppointmentOnDate}
          />
        </div>
      </div>
      <div className="w-80 sticky top-4">
        <PendingAppointmentsList 
          appointments={pendingAppointments}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}
