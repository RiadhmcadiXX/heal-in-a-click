
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [loadingData, setLoadingData] = useState(true);
  
  // Fetch doctor data
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
  
  // Fetch appointments for selected date
  useEffect(() => {
    async function fetchAppointments() {
      if (!doctor) return;
      
      setLoadingData(true);
      
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patients(first_name, last_name)
          `)
          .eq('doctor_id', doctor.id)
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
        setLoadingData(false);
      }
    }
    
    if (doctor) {
      fetchAppointments();
    }
  }, [doctor, date, toast]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);
  
  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 pb-24 pt-4">
        {doctor && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Welcome, Dr. {doctor.first_name} {doctor.last_name}
            </h1>
            <p className="text-gray-500">{doctor.specialty}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Appointments</h2>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(date, 'PPP')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Appointments for {format(date, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <div className="p-4 border-l-4 border-healthcare-primary flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {appointment.patients?.first_name} {appointment.patients?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(`1970-01-01T${appointment.appointment_time}`), 'h:mm a')}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm mt-2 text-gray-700">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No appointments for this day.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Manage Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90 flex items-center justify-center gap-2"
              onClick={() => navigate('/availability')}
            >
              <Plus className="h-4 w-4" />
              <span>Add Availability Slots</span>
            </Button>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
