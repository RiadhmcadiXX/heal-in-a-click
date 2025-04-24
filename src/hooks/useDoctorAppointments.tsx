
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDoctorAppointments(
  doctorId: string | undefined, 
  selectedDate: Date,
  viewMode: "day" | "week" = "day"
) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!doctorId) return;
    
    setLoading(true);
    
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patients(first_name, last_name)
        `)
        .eq('doctor_id', doctorId);
      
      if (viewMode === "day") {
        // For day view, only fetch appointments for the selected date
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        query = query.eq('appointment_date', formattedDate);
      } else {
        // For week view, fetch appointments for the entire week
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        
        const formattedStartDate = format(weekStart, 'yyyy-MM-dd');
        const formattedEndDate = format(weekEnd, 'yyyy-MM-dd');
        
        query = query
          .gte('appointment_date', formattedStartDate)
          .lte('appointment_date', formattedEndDate);
      }
      
      const { data, error } = await query.order('appointment_time', { ascending: true });
      
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
              description: `${appointmentData.patients?.first_name || 'Guest'} ${appointmentData.patients?.last_name || 'Patient'} booked for ${format(new Date(appointmentData.appointment_date), 'MMMM d, yyyy')} at ${format(new Date(`2000-01-01T${appointmentData.appointment_time}`), 'h:mm a')}`,
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
  }, [doctorId, selectedDate, viewMode]);

  return { appointments, loading, refreshAppointments: fetchAppointments };
}
