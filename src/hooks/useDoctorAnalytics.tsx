
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDoctorAnalytics(doctorId: string | undefined) {
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Use a single loading state
  const { toast } = useToast();

  // Fetch data when doctorId is available
  useEffect(() => {
    async function fetchData() {
      if (!doctorId) {
        // Reset loading state if there's no doctorId
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Fetch all data in parallel for better performance
        await Promise.all([
          fetchUniquePatients(doctorId),
          fetchStatusDistribution(doctorId),
          fetchMonthlyAppointments(doctorId)
        ]);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        // Always set loading to false when all operations complete
        setLoading(false);
      }
    }
    
    fetchData();
  }, [doctorId]);
  
  // Fetch total unique patients
  async function fetchUniquePatients(docId: string) {
    try {
      // Count unique patients
      const { data, error } = await supabase
        .from('appointments')
        .select('patient_id, guest_patient_id')
        .eq('doctor_id', docId);
      
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
    }
  }

  // Fetch appointment status distribution
  async function fetchStatusDistribution(docId: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('status')
        .eq('doctor_id', docId);
      
      if (error) throw error;
      
      // Group data by status and count
      const statusCounts: Record<string, number> = {};
      data.forEach(item => {
        const status = (item.status || 'pending').toLowerCase();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      // Transform data for the pie chart
      const formattedData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      }));
      
      setStatusDistribution(formattedData);
    } catch (error: any) {
      console.error("Error fetching status distribution:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch appointment status analytics",
      });
    }
  }

  // Fetch total appointments by month
  async function fetchMonthlyAppointments(docId: string) {
    try {
      // Get current date and date from 6 months ago
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      
      const formattedStartDate = format(sixMonthsAgo, 'yyyy-MM-dd');
      const formattedEndDate = format(today, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('doctor_id', docId)
        .gte('appointment_date', formattedStartDate)
        .lte('appointment_date', formattedEndDate);
      
      if (error) throw error;
      
      // Group appointments by month
      const monthlyData: Record<string, number> = {};
      
      // Initialize all months in the range with zero values
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const monthKey = format(date, 'yyyy-MM');
        monthlyData[monthKey] = 0;
      }
      
      // Add counts from actual data
      data.forEach(appointment => {
        const month = appointment.appointment_date.substring(0, 7); // YYYY-MM format
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });
      
      // Convert to array format for the bar chart
      const formattedData = Object.entries(monthlyData)
        .map(([month, appointments]) => ({
          month,
          appointments,
          // Format month name (e.g., "2023-01" to "Jan 2023")
          name: format(new Date(month + '-01'), 'MMM yyyy')
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      setAppointmentsData(formattedData);
    } catch (error: any) {
      console.error("Error fetching monthly appointments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch appointment analytics",
      });
    }
  }

  // Calculate derived values
  const totalAppointments = appointmentsData.reduce((sum, item) => sum + item.appointments, 0);
  const avgMonthlyAppointments = appointmentsData.length > 0 
    ? Math.round(totalAppointments / appointmentsData.filter(item => item.appointments > 0).length) || 0
    : 0;

  return {
    appointmentsData,
    patientsCount,
    statusDistribution,
    loading,
    totalAppointments,
    avgMonthlyAppointments
  };
}
