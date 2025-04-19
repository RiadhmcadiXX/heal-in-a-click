
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlot } from "@/types";

export function useDoctorAvailabilities(doctorId: string, selectedDate: string) {
  return useQuery({
    queryKey: ["doctor-availabilities", doctorId, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_availabilities")
        .select("*")
        .eq("doctor_id", doctorId)
        .eq("available_date", selectedDate);

      if (error) {
        throw error;
      }

      return (data || []).map(availability => {
        // Create a date object from the time string
        const startTime = availability.available_time;
        const startDate = new Date(`1970-01-01T${startTime}`);
        // Add one hour to get the end time
        const endDate = new Date(startDate.getTime() + 3600000);
        const endTime = endDate.toLocaleTimeString('en-US', { timeStyle: 'short' });
        
        return {
          id: availability.id,
          doctorId: availability.doctor_id,
          startTime: startTime,
          endTime: endTime,
          date: availability.available_date,
          isBooked: false
        };
      }) as TimeSlot[];
    },
  });
}
