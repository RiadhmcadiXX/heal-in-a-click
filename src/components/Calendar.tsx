
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date; isCurrentMonth: boolean }>>([]);
  
  // Get day names for header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Format date as YYYY-MM-DD string
  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if a date is selectable (today or in the future)
  const isSelectable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };
  
  // Check if a date is selected
  const isSelected = (date: Date): boolean => {
    return formatDateString(date) === selectedDate;
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
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isSelectable(date)) {
      onDateSelect(formatDateString(date));
    }
  };
  
  return (
    <Card className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={goToPreviousMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <h2 className="text-lg font-medium">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        
        <button 
          onClick={goToNextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
        {dayNames.map((day) => (
          <div key={day} className="py-1 font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            className={cn(
              "h-8 w-full rounded-full flex items-center justify-center text-sm",
              !day.isCurrentMonth && "text-gray-300",
              day.isCurrentMonth && !isSelectable(day.date) && "text-gray-400",
              isToday(day.date) && "border border-healthcare-primary",
              isSelected(day.date) && "bg-healthcare-primary text-white",
              day.isCurrentMonth && isSelectable(day.date) && !isSelected(day.date) && "hover:bg-gray-100"
            )}
            disabled={!day.isCurrentMonth || !isSelectable(day.date)}
            onClick={() => handleDateClick(day.date)}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
    </Card>
  );
}
