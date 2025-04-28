
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useAvailabilityManager(doctorId: string | undefined) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [existingSlots, setExistingSlots] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentDuration, setAppointmentDuration] = useState<number>(60);

  useEffect(() => {
    async function fetchAvailability() {
      if (!doctorId) return;

      try {
        const startDate = format(new Date(), 'yyyy-MM-dd');
        const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

        const { data, error } = await supabase
          .from('doctor_availabilities')
          .select('*')
          .eq('doctor_id', doctorId)
          .gte('available_date', startDate)
          .lte('available_date', endDate);

        if (error) throw error;

        const slots: Record<string, string[]> = {};
        data?.forEach(slot => {
          const date = slot.available_date;
          if (!slots[date]) {
            slots[date] = [];
          }
          slots[date].push(slot.available_time);
        });

        setExistingSlots(slots);
      } catch (error: any) {
        console.error('Error fetching availability:', error);
      }
    }

    if (doctorId) {
      fetchAvailability();
    }
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      setSelectedSlots(existingSlots[dateString] || []);
    }
  }, [selectedDate, existingSlots]);

  useEffect(() => {
    async function fetchDoctorSettings() {
      if (!doctorId) return;

      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')  // Select all columns to avoid type errors
          .eq('id', doctorId)
          .single();

        if (error) throw error;

        if (data) {
          // Use optional chaining and provide a fallback
          setAppointmentDuration(data.appointment_duration || 60);
        }
      } catch (error) {
        console.error('Error fetching doctor settings:', error);
      }
    }

    fetchDoctorSettings();
  }, [doctorId]);

  const handleSaveAvailability = async () => {
    if (!doctorId || !selectedDate) return;

    setIsSubmitting(true);

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');

      // Delete existing slots for the date
      await supabase
        .from('doctor_availabilities')
        .delete()
        .eq('doctor_id', doctorId)
        .eq('available_date', dateString);

      if (selectedSlots.length > 0) {
        const slotsToInsert = selectedSlots.map(time => ({
          doctor_id: doctorId,
          available_date: dateString,
          available_time: time
        }));

        const { error } = await supabase
          .from('doctor_availabilities')
          .insert(slotsToInsert);

        if (error) throw error;
      }

      setExistingSlots(prev => ({
        ...prev,
        [dateString]: selectedSlots
      }));

      toast({
        title: "Success",
        description: "Your availability has been updated",
      });
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save availability",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveWeeklySchedule = async (weeklySchedule: Record<string, Array<{ startTime: string; endTime: string }>>) => {
    if (!doctorId) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate dates for each day of the week
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Get Sunday
      
      // Convert weekly schedule to availability slots
      const slotsToInsert: Array<{
        doctor_id: string;
        available_date: string;
        available_time: string;
      }> = [];

      // Define mapping from day names to day indices
      const dayMapping: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };
      
      // For each day in the weekly schedule
      for (const [day, timeRanges] of Object.entries(weeklySchedule)) {
        if (timeRanges.length === 0) continue;
        
        // Get the day index (0 = Sunday, 1 = Monday, etc.)
        const dayIndex = dayMapping[day.toLowerCase()];
        if (dayIndex === undefined) continue;
        
        // Calculate the date for this day
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + dayIndex);
        
        // Format the date as YYYY-MM-DD
        const dateString = format(date, 'yyyy-MM-dd');
        
        // Delete existing slots for this day
        await supabase
          .from('doctor_availabilities')
          .delete()
          .eq('doctor_id', doctorId)
          .eq('available_date', dateString);
        
        // Add slots for each time range on this day
        for (const { startTime, endTime } of timeRanges) {
          // Create slots based on appointment duration
          const start = new Date(`1970-01-01T${startTime}`);
          const end = new Date(`1970-01-01T${endTime}`);
          
          // Add slots at the specified interval (appointment_duration)
          while (start < end) {
            const timeSlot = format(start, 'HH:mm:00');
            
            slotsToInsert.push({
              doctor_id: doctorId,
              available_date: dateString,
              available_time: timeSlot
            });
            
            // Increment by appointment duration in minutes
            start.setMinutes(start.getMinutes() + appointmentDuration);
          }
        }
      }
      
      // Insert all generated slots
      if (slotsToInsert.length > 0) {
        const { error } = await supabase
          .from('doctor_availabilities')
          .insert(slotsToInsert);
        
        if (error) throw error;
      }
      
      // Refresh the existing slots data
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('doctor_availabilities')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('available_date', startDate)
        .lte('available_date', endDate);
        
      if (!error && data) {
        const slots: Record<string, string[]> = {};
        data.forEach(slot => {
          const date = slot.available_date;
          if (!slots[date]) slots[date] = [];
          slots[date].push(slot.available_time);
        });
        setExistingSlots(slots);
      }
      
      toast({
        title: "Success",
        description: "Your weekly schedule has been updated",
      });
    } catch (error: any) {
      console.error('Error saving weekly schedule:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save weekly schedule",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    selectedSlots,
    setSelectedSlots,
    isSubmitting,
    handleSaveAvailability,
    handleSaveWeeklySchedule,
    appointmentDuration
  };
}
