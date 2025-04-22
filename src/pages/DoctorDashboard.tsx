
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { AppointmentsTable } from "@/components/AppointmentsTable";
import { useDoctorAppointments } from "@/hooks/useDoctorAppointments";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [monthAppointments, setMonthAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  
  const { appointments, loading: loadingData, refreshAppointments } = useDoctorAppointments(doctor?.id, date);

  useEffect(() => {
    async function fetchDoctorData() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        setDoctor(data);
      } catch (error: any) {
        console.error('Error fetching doctor data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch your doctor profile",
        });
      }
    }
    
    if (user) {
      fetchDoctorData();
    }
  }, [user, toast]);
  
  useEffect(() => {
    async function fetchMonthAppointments() {
      if (!doctor) return;
      
      try {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const formattedFirstDay = format(firstDay, 'yyyy-MM-dd');
        const formattedLastDay = format(lastDay, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('appointments')
          .select(`id, appointment_date`)
          .eq('doctor_id', doctor.id)
          .gte('appointment_date', formattedFirstDay)
          .lte('appointment_date', formattedLastDay);
        
        if (error) throw error;
        
        setMonthAppointments(data || []);
      } catch (error: any) {
        console.error('Error fetching month appointments:', error);
      }
    }
    
    if (doctor) {
      fetchMonthAppointments();
    }
  }, [doctor, date]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);
  
  const hasAppointmentOnDate = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return monthAppointments.some(apt => apt.appointment_date === formattedDay);
  };
  
  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-4">
        {doctor && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Welcome, Dr. {doctor.first_name} {doctor.last_name}
            </h1>
            <p className="text-gray-500">{doctor.specialty}</p>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 w-full md:max-w-xl">
            <MonthlyCalendar
              date={date}
              onDateSelect={(newDate) => newDate && setDate(newDate)}
              hasAppointmentOnDate={hasAppointmentOnDate}
            />
          </div>
        </div>
        
        <div className="mt-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Appointments for {format(date, 'MMMM d, yyyy')}
                </h2>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/availability')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Manage Availability</span>
                </Button>
              </div>
              
              {loadingData ? (
                <div className="text-center py-8">Loading appointments...</div>
              ) : appointments.length > 0 ? (
                <AppointmentsTable
                  appointments={appointments}
                  onAppointmentClick={setSelectedAppointment}
                  selectedAppointmentId={selectedAppointment?.id}
                  refreshAppointments={refreshAppointments}
                />
              ) : (
                <div className="text-center py-8 border rounded-md p-6">
                  <p className="text-gray-500">No appointments scheduled for this day.</p>
                  <Button
                    className="mt-4 bg-healthcare-primary hover:bg-healthcare-primary/90"
                    onClick={() => navigate("/availability")}
                  >
                    Add Availability
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
