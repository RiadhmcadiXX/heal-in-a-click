
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDoctorAppointments(doctorId: string | undefined, selectedDate: Date) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!doctorId) return;
    
    setLoading(true);
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(first_name, last_name)
        `)
        .eq('doctor_id', doctorId)
        .eq('appointment_date', formattedDate)
        .order('appointment_time', { ascending: true });
      
      if (error) throw error;
      
      setAppointments(data || []);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch appointments",
      });
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!doctorId) return;

    const channel = supabase
      .channel('appointment-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorId}`,
        },
        async (payload: any) => {
          const { data: appointmentData } = await supabase
            .from('appointments')
            .select(`
              *,
              patients(first_name, last_name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (appointmentData) {
            toast({
              title: "New Appointment",
              description: `${appointmentData.patients.first_name} ${appointmentData.patients.last_name} booked for ${format(new Date(appointmentData.appointment_date), 'MMMM d, yyyy')} at ${format(new Date(`2000-01-01T${appointmentData.appointment_time}`), 'h:mm a')}`,
            });
            fetchAppointments();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [doctorId, selectedDate]);

  return { appointments, loading, refreshAppointments: fetchAppointments };
}
