
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
  
  // Fetch existing availability slots for the next 30 days
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

        // Organize slots by date
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

  // Update selected slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      setSelectedSlots(existingSlots[dateString] || []);
    }
  }, [selectedDate, existingSlots]);

  const handleSaveAvailability = async () => {
    if (!doctorId || !selectedDate) return;

    setIsSubmitting(true);

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');

      // Delete existing slots for this date
      await supabase
        .from('doctor_availabilities')
        .delete()
        .eq('doctor_id', doctorId)
        .eq('available_date', dateString);

      // Insert new slots
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

      // Update local state
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
    handleSaveAvailability
  };
}
