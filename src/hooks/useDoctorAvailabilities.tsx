
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

      return (data || []).map(availability => ({
        id: availability.id,
        doctorId: availability.doctor_id,
        startTime: availability.available_time,
        endTime: (new Date(`1970-01-01T${availability.available_time}`).getTime() + 3600000).toLocaleTimeString('en-US', { timeStyle: 'short' }),
        date: availability.available_date,
        isBooked: false
      })) as TimeSlot[];
    },
  });
}
