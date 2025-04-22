
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface MonthlyCalendarProps {
  date: Date;
  onDateSelect: (date: Date | undefined) => void;
  hasAppointmentOnDate: (date: Date) => boolean;
}

export function MonthlyCalendar({ date, onDateSelect, hasAppointmentOnDate }: MonthlyCalendarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>Calendar</div>
          <div className="text-base font-normal">
            {format(date, 'MMMM yyyy')}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateSelect}
          className="rounded-md border w-full mx-auto"
          modifiers={{
            hasAppointment: (date) => hasAppointmentOnDate(date),
          }}
          modifiersStyles={{
            hasAppointment: {
              fontWeight: "bold",
              textDecoration: "underline",
              color: "var(--healthcare-primary)",
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
