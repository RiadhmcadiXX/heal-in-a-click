
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface DoctorAvailabilityCalendarProps {
  doctorId: string;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  slotCountPerDay?: number; // Number of slots per day (default: 9 for 9AM-5PM)
}

type DayState = "full" | "clear" | "partial" | "past";

export function DoctorAvailabilityCalendar({
  doctorId,
  selectedDate,
  onDateSelect,
  slotCountPerDay = 9,
}: DoctorAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date; isCurrentMonth: boolean }>>([]);
  const [dayStates, setDayStates] = useState<Record<string, DayState>>({});

  // Get day names for header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format date as YYYY-MM-DD string
  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Generate calendar days for the current month
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      // First day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      // Last day of the month
      const lastDayOfMonth = new Date(year, month + 1, 0);

      // Start from the first day of the week that contains the first day of the month
      const startDate = new Date(firstDayOfMonth);
      startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

      // End on the last day of the week that contains the last day of the month
      const endDate = new Date(lastDayOfMonth);
      if (endDate.getDay() < 6) {
        endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
      }

      const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

      // Generate all days for the calendar
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        days.push({
          date: new Date(currentDate),
          isCurrentMonth: currentDate.getMonth() === month,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentMonth]);

  // Fetch availabilities and appointments for every visible day in the current month
  useEffect(() => {
    async function fetchDayStates() {
      if (!doctorId) return;
      // get start/end (YYYY-MM-DD)
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const monthDates: string[] = [];
      let d = new Date(firstDay);
      while (d <= lastDay) {
        monthDates.push(formatDateString(d));
        d.setDate(d.getDate() + 1);
      }

      // Fetch all availability slots this month
      const { data: slots } = await supabase
        .from('doctor_availabilities')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('available_date', formatDateString(firstDay))
        .lte('available_date', formatDateString(lastDay));

      // Fetch appointments this month (status not 'cancelled')
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, status')
        .eq('doctor_id', doctorId)
        .gte('appointment_date', formatDateString(firstDay))
        .lte('appointment_date', formatDateString(lastDay))
        .neq('status', 'cancelled');

      // Aggregate: for each day: available slots vs booked slots.
      // A day is "full" if all available slots are booked, "clear" if no slots are booked.
      const slotMap: Record<string, string[]> = {};
      slots?.forEach(s => {
        const d = s.available_date;
        if (!slotMap[d]) slotMap[d] = [];
        slotMap[d].push(s.available_time);
      });

      const appointMap: Record<string, Set<string>> = {};
      appointments?.forEach(a => {
        const d = a.appointment_date;
        if (!appointMap[d]) appointMap[d] = new Set();
        appointMap[d].add(a.appointment_time);
      });

      const states: Record<string, DayState> = {};
      monthDates.forEach(date => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const thisDay = new Date(date);

        if (thisDay < today) {
          states[date] = "past";
        } else if (!slotMap[date] || slotMap[date].length === 0) {
          states[date] = "clear";
        } else {
          const totalSlots = slotMap[date].length;
          const bookedSlots = appointMap[date]?.size || 0;
          if (bookedSlots >= totalSlots && totalSlots > 0) {
            states[date] = "full";
          } else if (bookedSlots === 0) {
            states[date] = "clear";
          } else {
            states[date] = "partial";
          }
        }
      });

      setDayStates(states);
    }

    fetchDayStates();
  }, [doctorId, currentMonth]);

  // Navigate calendar
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle day click (only allow future/current, only current month)
  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    const dateState = dayStates[formatDateString(date)];
    if (!isCurrentMonth || dateState === "past") return;
    onDateSelect(date);
  };

  return (
    <Card className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={goToPreviousMonth} 
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-medium">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button 
          onClick={goToNextMonth} 
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs mb-1">
        {dayNames.map((day) => (
          <div key={day} className="py-1 font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          const dateStr = formatDateString(day.date);
          const state = dayStates[dateStr];
          const isSelected =
            selectedDate && formatDateString(selectedDate) === dateStr;
          let bg = "bg-white";
          let text = "text-neutral-700";
          let border = "border border-gray-200";
          let ring = "";

          if (state === "past") {
            bg = "bg-gray-100";
            text = "text-gray-300";
          } else if (state === "full") {
            bg = "bg-[#FFDEE2]";
            text = "text-red-700 font-bold";
            border = "border-2 border-red-400";
          } else if (state === "clear") {
            bg = "bg-[#F2FCE2]";
            text = "text-green-700 font-bold";
            border = "border-2 border-green-400";
          } else if (state === "partial") {
            bg = "bg-[#D6BCFA]";
            text = "text-purple-800 font-bold";
            border = "border-2 border-purple-400";
          }
          if (isSelected) {
            ring = "ring-2 ring-primary";
          }

          return (
            <button
              key={idx}
              className={cn(
                "h-14 w-full rounded-xl flex flex-col items-center justify-center text-base transition-all focus:outline-none",
                day.isCurrentMonth ? bg : "bg-gray-50 text-gray-300",
                text,
                border,
                isSelected && "shadow-lg",
                ring
              )}
              disabled={state === "past" || !day.isCurrentMonth}
              onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
              title={state ? state.charAt(0).toUpperCase() + state.slice(1) + " day" : ""}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mt-4">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-[#F2FCE2] border-green-400 border"></span>
          <span className="text-xs text-green-800">Clear</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-[#FFDEE2] border-red-400 border"></span>
          <span className="text-xs text-red-700">Full</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-[#D6BCFA] border-purple-400 border"></span>
          <span className="text-xs text-purple-800">Partial</span>
        </div>
      </div>
    </Card>
  );
}
