import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Plus, Clock } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { AppointmentActions } from "@/components/AppointmentActions";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [loadingData, setLoadingData] = useState(true);
  const [monthAppointments, setMonthAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const refreshAppointments = () => {
    setDate(new Date(date));
  };

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
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);
  
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (e) {
      console.error('Error formatting time:', e);
      return timeString;
    }
  };
  
  const hasAppointmentOnDate = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return monthAppointments.some(apt => apt.appointment_date === formattedDay);
  };
  
  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>Calendar</div>
                  <div className="text-base font-normal">
                    {format(date, 'MMMM yyyy')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md border w-full mx-auto"
                  modifiers={{
                    hasAppointment: (date) => hasAppointmentOnDate(date),
                  }}
                  modifiersStyles={{
                    hasAppointment: {
                      fontWeight: "bold",
                      textDecoration: "underline",
                      color: "var(--healthcare-primary)",
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div>Appointments for {format(date, 'MMMM d, yyyy')}</div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/availability')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Manage Availability</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="text-center py-8">Loading appointments...</div>
              ) : appointments.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow
                          key={appointment.id}
                          className={cn(
                            selectedAppointment?.id === appointment.id ? "bg-gray-100" : ""
                          )}
                          onClick={() => handleAppointmentClick(appointment)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-healthcare-primary" />
                              {formatTime(appointment.appointment_time)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {appointment.patients?.first_name} {appointment.patients?.last_name}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              {
                                "bg-blue-100 text-blue-800": appointment.status === "scheduled",
                                "bg-green-100 text-green-800": appointment.status === "completed",
                                "bg-red-100 text-red-800": appointment.status === "cancelled",
                                "bg-yellow-100 text-yellow-800": appointment.status === "waiting",
                                "bg-gray-300 text-gray-900": appointment.status === "no-show"
                              }
                            )}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {appointment.notes || "No notes"}
                          </TableCell>
                          <TableCell>
                            <AppointmentActions appointment={appointment} refresh={refreshAppointments} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
