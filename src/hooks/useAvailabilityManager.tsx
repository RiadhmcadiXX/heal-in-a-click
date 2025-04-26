
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

  return {
    selectedDate,
    setSelectedDate,
    selectedSlots,
    setSelectedSlots,
    isSubmitting,
    handleSaveAvailability,
    appointmentDuration
  };
}
