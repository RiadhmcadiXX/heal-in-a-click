
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TimeSlot } from "@/types";
import { cn } from "@/lib/utils";
import { mockTimeSlots } from "@/lib/mockData";

interface TimeSlotsProps {
  doctorId: string;
  date: string;
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  selectedTimeSlot: TimeSlot | null;
}

export function TimeSlots({ doctorId, date, onTimeSlotSelect, selectedTimeSlot }: TimeSlotsProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    // Filter slots for the specific doctor and date
    const slots = mockTimeSlots.filter(
      slot => slot.doctorId === doctorId && 
      slot.date === date && 
      !slot.isBooked
    );
    
    // Group slots by morning and afternoon
    setAvailableSlots(slots);
  }, [doctorId, date]);
  
  // Group time slots by part of day
  const morningSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour < 12;
  });
  
  const afternoonSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour >= 12;
  });
  
  // Format time to be more readable (e.g., "9:00" to "9:00 AM")
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    return `${hourNum % 12 || 12}:${minute} ${hourNum >= 12 ? 'PM' : 'AM'}`;
  };
  
  return (
    <div className="mt-4 space-y-4">
      {availableSlots.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No available time slots for this date.</p>
          <p className="text-gray-500 text-sm mt-1">Please select another date.</p>
        </div>
      ) : (
        <>
          {morningSlots.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-gray-500">Morning</h3>
              <div className="grid grid-cols-3 gap-2">
                {morningSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className={cn(
                      "text-sm h-12",
                      selectedTimeSlot?.id === slot.id && "bg-healthcare-primary text-white border-healthcare-primary"
                    )}
                    onClick={() => onTimeSlotSelect(slot)}
                  >
                    {formatTime(slot.startTime)}
                  </Button>
                ))}
              </div>
            </>
          )}
          
          {afternoonSlots.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-gray-500">Afternoon</h3>
              <div className="grid grid-cols-3 gap-2">
                {afternoonSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className={cn(
                      "text-sm h-12",
                      selectedTimeSlot?.id === slot.id && "bg-healthcare-primary text-white border-healthcare-primary"
                    )}
                    onClick={() => onTimeSlotSelect(slot)}
                  >
                    {formatTime(slot.startTime)}
                  </Button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
