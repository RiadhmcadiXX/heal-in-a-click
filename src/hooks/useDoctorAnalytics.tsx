
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDoctorAnalytics(doctorId: string | undefined) {
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    patients: true,
    appointments: true,
    status: true
  });
  const { toast } = useToast();

  // Fetch total unique patients
  useEffect(() => {
    async function fetchUniquePatients() {
      if (!doctorId) return;
      
      setLoading(prev => ({ ...prev, patients: true }));
      try {
        // Count unique patients
        const { data, error } = await supabase
          .from('appointments')
          .select('patient_id, guest_patient_id')
          .eq('doctor_id', doctorId);
        
        if (error) throw error;
        
        // Count unique patient IDs (excluding nulls)
        const uniquePatientIds = new Set();
        const uniqueGuestPatientIds = new Set();
        
        data.forEach(appointment => {
          if (appointment.patient_id) uniquePatientIds.add(appointment.patient_id);
          if (appointment.guest_patient_id) uniqueGuestPatientIds.add(appointment.guest_patient_id);
        });
        
        setPatientsCount(uniquePatientIds.size + uniqueGuestPatientIds.size);
      } catch (error: any) {
        console.error("Error fetching unique patients:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch patient analytics",
        });
      } finally {
        setLoading(prev => ({ ...prev, patients: false }));
      }
    }
    
    fetchUniquePatients();
  }, [doctorId, toast]);

  // Fetch appointment status distribution
  useEffect(() => {
    async function fetchStatusDistribution() {
      if (!doctorId) return;
      
      setLoading(prev => ({ ...prev, status: true }));
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('status, count')
          .eq('doctor_id', doctorId)
          .group('status');
        
        if (error) throw error;
        
        // Transform data for the pie chart
        const formattedData = data.map(item => ({
          name: item.status || 'Pending',
          value: item.count,
        }));
        
        setStatusDistribution(formattedData);
      } catch (error: any) {
        console.error("Error fetching status distribution:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch appointment status analytics",
        });
      } finally {
        setLoading(prev => ({ ...prev, status: false }));
      }
    }
    
    fetchStatusDistribution();
  }, [doctorId, toast]);

  // Fetch total appointments by month
  useEffect(() => {
    async function fetchMonthlyAppointments() {
      if (!doctorId) return;
      
      setLoading(prev => ({ ...prev, appointments: true }));
      try {
        // Get current date and date from 6 months ago
        const today = new Date();
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        
        const formattedStartDate = format(sixMonthsAgo, 'yyyy-MM-dd');
        const formattedEndDate = format(today, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('appointments')
          .select('appointment_date')
          .eq('doctor_id', doctorId)
          .gte('appointment_date', formattedStartDate)
          .lte('appointment_date', formattedEndDate);
        
        if (error) throw error;
        
        // Group appointments by month
        const monthlyData: Record<string, number> = {};
        
        data.forEach(appointment => {
          const month = appointment.appointment_date.substring(0, 7); // YYYY-MM format
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        });
        
        // Convert to array format for the bar chart
        const formattedData = Object.entries(monthlyData).map(([month, count]) => ({
          month,
          appointments: count,
          // Format month name (e.g., "2023-01" to "Jan 2023")
          name: format(new Date(month + '-01'), 'MMM yyyy')
        }));
        
        setAppointmentsData(formattedData);
      } catch (error: any) {
        console.error("Error fetching monthly appointments:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch appointment analytics",
        });
      } finally {
        setLoading(prev => ({ ...prev, appointments: false }));
      }
    }
    
    fetchMonthlyAppointments();
  }, [doctorId, toast]);

  return {
    appointmentsData,
    patientsCount,
    statusDistribution,
    loading,
    totalAppointments: appointmentsData.reduce((sum, item) => sum + item.appointments, 0),
    avgMonthlyAppointments: appointmentsData.length > 0 
      ? Math.round(appointmentsData.reduce((sum, item) => sum + item.appointments, 0) / appointmentsData.length) 
      : 0
  };
}
