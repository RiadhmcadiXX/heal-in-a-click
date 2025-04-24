
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  title: string;
  patientName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
}

interface WeeklyCalendarViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeeklyCalendarView({
  appointments,
  onAppointmentClick,
  selectedDate,
  onDateChange,
}: WeeklyCalendarViewProps) {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(selectedDate));
  
  // Update week start when selected date changes
  useEffect(() => {
    setWeekStart(startOfWeek(selectedDate));
  }, [selectedDate]);

  const handlePreviousWeek = () => {
    const newWeekStart = addDays(weekStart, -7);
    setWeekStart(newWeekStart);
    onDateChange(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = addDays(weekStart, 7);
    setWeekStart(newWeekStart);
    onDateChange(newWeekStart);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setWeekStart(startOfWeek(today));
    onDateChange(today);
  };

  // Generate days for the week
  const weekDays = Array.from({ length: 5 }).map((_, index) => {
    return addDays(weekStart, index);
  });

  // Generate time slots from 7 AM to 8 PM
  const timeSlots = Array.from({ length: 14 }).map((_, index) => {
    const hour = index + 7; // Start from 7 AM
    return {
      hour,
      label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
    };
  });

  // Format appointment time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Calculate position and height for appointment display
  const getAppointmentStyles = (startTime: string, endTime?: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startPosition = (startHour - 7) * 60 + startMinute;
    
    let height = 60; // Default height for 1-hour appointment
    if (endTime) {
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const endPosition = (endHour - 7) * 60 + endMinute;
      height = endPosition - startPosition;
    }

    return {
      top: `${startPosition}px`,
      height: `${height}px`,
      minHeight: '60px', // Minimum height for very short appointments
    };
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === formattedDay);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={handleTodayClick}
          className="text-sm font-medium"
        >
          Today
        </Button>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePreviousWeek}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold">
            {format(weekStart, 'MMMM yyyy')}
            <div className="text-sm font-normal text-gray-500">
              Week {format(weekStart, 'w')}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextWeek}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-20"></div> {/* Empty div for spacing */}
      </div>

      <div className="flex w-full">
        {/* Time column */}
        <div className="w-20 flex-shrink-0">
          <div className="h-20"></div> {/* Empty space for header alignment */}
          {timeSlots.map((slot, index) => (
            <div 
              key={index} 
              className="h-20 border-t border-gray-200 text-xs text-gray-500 pr-2 text-right"
            >
              {slot.label}
            </div>
          ))}
        </div>

        {/* Days columns */}
        <div className="flex-grow grid grid-cols-5 overflow-auto">
          {/* Headers */}
          {weekDays.map((day, dayIndex) => (
            <div 
              key={dayIndex} 
              className={cn(
                "h-20 border-b border-l border-gray-200 text-center p-2",
                isSameDay(day, selectedDate) && "bg-gray-50"
              )}
            >
              <div className="uppercase text-sm text-gray-500">
                {format(day, 'EEE')}
              </div>
              <Button 
                variant="ghost"
                className={cn(
                  "h-12 w-12 rounded-full p-0 font-semibold text-xl",
                  isSameDay(day, selectedDate) && "bg-healthcare-primary text-white hover:bg-healthcare-primary/90"
                )}
                onClick={() => onDateChange(day)}
              >
                {format(day, 'd')}
              </Button>
            </div>
          ))}

          {/* Time slots grid */}
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="relative">
              {/* Time slot background */}
              {timeSlots.map((_, slotIndex) => (
                <div 
                  key={slotIndex} 
                  className={cn(
                    "h-20 border-t border-l border-gray-200",
                    isSameDay(day, selectedDate) && "bg-gray-50"
                  )}
                ></div>
              ))}

              {/* Appointments for this day */}
              {getAppointmentsForDay(day).map((appointment, index) => (
                <div
                  key={appointment.id}
                  className="absolute left-1 right-1 bg-healthcare-primary/90 text-white p-2 rounded-md overflow-hidden cursor-pointer hover:bg-healthcare-primary transition-colors"
                  style={getAppointmentStyles(
                    appointment.startTime.split(' ')[0], 
                    appointment.endTime?.split(' ')[0]
                  )}
                  onClick={() => onAppointmentClick(appointment)}
                >
                  <div className="font-medium text-sm truncate">
                    {formatTime(appointment.startTime.split(' ')[0])}
                  </div>
                  <div className="font-medium text-sm truncate">
                    {appointment.patientName}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
