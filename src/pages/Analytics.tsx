
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, LineChart, PieChart } from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

export default function Analytics() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("month");
  
  // Analytics data states
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<any[]>([]);
  const [topPatients, setTopPatients] = useState<any[]>([]);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(true);
  const [loading4, setLoading4] = useState(true);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
    } else if (!loading) {
      navigate('/login');
    }
  }, [user, loading, navigate, toast]);

  // Fetch total unique patients
  useEffect(() => {
    async function fetchUniquePatients() {
      if (!doctor?.id) return;
      
      setLoading1(true);
      try {
        // Count unique patients
        const { data, error } = await supabase
          .from('appointments')
          .select('patient_id, guest_patient_id')
          .eq('doctor_id', doctor.id);
        
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
        setLoading1(false);
      }
    }
    
    fetchUniquePatients();
  }, [doctor?.id, toast]);

  // Fetch appointment status distribution
  useEffect(() => {
    async function fetchStatusDistribution() {
      if (!doctor?.id) return;
      
      setLoading2(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('status, count')
          .eq('doctor_id', doctor.id)
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
        setLoading2(false);
      }
    }
    
    fetchStatusDistribution();
  }, [doctor?.id, toast]);

  // Fetch appointment history based on date range
  useEffect(() => {
    async function fetchAppointmentHistory() {
      if (!doctor?.id) return;
      
      setLoading3(true);
      try {
        let interval;
        let format_pattern;
        
        // Set appropriate interval and format pattern based on date range
        if (dateRange === 'week') {
          interval = '1 day';
          format_pattern = 'YYYY-MM-DD';
        } else if (dateRange === 'month') {
          interval = '1 day';
          format_pattern = 'YYYY-MM-DD';
        } else { // year
          interval = '1 month';
          format_pattern = 'YYYY-MM';
        }
        
        // Get current date
        const today = new Date();
        let startDate;
        
        if (dateRange === 'week') {
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
        } else if (dateRange === 'month') {
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1);
        } else { // year
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
        }
        
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(today, 'yyyy-MM-dd');
        
        // Fetch appointments within date range
        const { data, error } = await supabase
          .from('appointments')
          .select('appointment_date, count')
          .eq('doctor_id', doctor.id)
          .gte('appointment_date', formattedStartDate)
          .lte('appointment_date', formattedEndDate)
          .group('appointment_date')
          .order('appointment_date');
        
        if (error) throw error;
        
        // Transform data for the line chart
        const formattedData = data.map((item: any) => ({
          date: item.appointment_date,
          appointments: item.count,
        }));
        
        setAppointmentHistory(formattedData);
      } catch (error: any) {
        console.error("Error fetching appointment history:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch appointment history",
        });
      } finally {
        setLoading3(false);
      }
    }
    
    fetchAppointmentHistory();
  }, [doctor?.id, dateRange, toast]);

  // Fetch top patients with most appointments
  useEffect(() => {
    async function fetchTopPatients() {
      if (!doctor?.id) return;
      
      setLoading4(true);
      try {
        // This query is a bit more complex - we need to join with patients table
        const { data: patientAppointments, error: patientError } = await supabase
          .from('appointments')
          .select(`
            patient_id,
            patients (first_name, last_name),
            count
          `)
          .eq('doctor_id', doctor.id)
          .not('patient_id', 'is', null)
          .group('patient_id, patients.first_name, patients.last_name')
          .order('count', { ascending: false })
          .limit(5);
        
        if (patientError) throw patientError;
        
        // Also get guest patient data
        const { data: guestAppointments, error: guestError } = await supabase
          .from('appointments')
          .select(`
            guest_patient_id,
            guest_patient (first_name, last_name),
            count
          `)
          .eq('doctor_id', doctor.id)
          .not('guest_patient_id', 'is', null)
          .group('guest_patient_id, guest_patient.first_name, guest_patient.last_name')
          .order('count', { ascending: false })
          .limit(5);
        
        if (guestError) throw guestError;
        
        // Combine and format data
        const patientData = (patientAppointments || []).map(item => ({
          id: item.patient_id,
          name: `${item.patients.first_name} ${item.patients.last_name}`,
          appointments: item.count,
          isGuest: false
        }));
        
        const guestData = (guestAppointments || []).map(item => ({
          id: item.guest_patient_id,
          name: `${item.guest_patient.first_name} ${item.guest_patient.last_name}`,
          appointments: item.count,
          isGuest: true
        }));
        
        // Combine and sort by appointment count
        const combined = [...patientData, ...guestData]
          .sort((a, b) => b.appointments - a.appointments)
          .slice(0, 5);
        
        setTopPatients(combined);
      } catch (error: any) {
        console.error("Error fetching top patients:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch patient analytics",
        });
      } finally {
        setLoading4(false);
      }
    }
    
    fetchTopPatients();
  }, [doctor?.id, toast]);

  // Fetch total appointments by month
  useEffect(() => {
    async function fetchMonthlyAppointments() {
      if (!doctor?.id) return;
      
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
          .eq('doctor_id', doctor.id)
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
      }
    }
    
    fetchMonthlyAppointments();
  }, [doctor?.id, toast]);

  const chartConfig = {
    status: {
      Completed: { label: "Completed", color: "#10b981" },
      Cancelled: { label: "Cancelled", color: "#ef4444" },
      Pending: { label: "Pending", color: "#f59e0b" },
      Rescheduled: { label: "Rescheduled", color: "#3b82f6" }
    },
    appointments: {
      appointments: { label: "Appointments", color: "#3b82f6" }
    }
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        
        {doctor && (
          <div className="mb-6">
            <p className="text-xl">
              Dr. {doctor.first_name} {doctor.last_name}
            </p>
            <p className="text-gray-600">{doctor.specialty}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Patients Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Patients</CardTitle>
              <CardDescription>Unique patients seen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading1 ? 'Loading...' : patientsCount}
              </div>
            </CardContent>
          </Card>
          
          {/* Total Appointments Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Appointments</CardTitle>
              <CardDescription>Across all time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {appointmentsData.reduce((sum, item) => sum + item.appointments, 0)}
              </div>
            </CardContent>
          </Card>
          
          {/* Average Appointments Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Monthly Average</CardTitle>
              <CardDescription>Appointments per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {appointmentsData.length > 0 
                  ? Math.round(appointmentsData.reduce((sum, item) => sum + item.appointments, 0) / appointmentsData.length) 
                  : 0
                }
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Patients</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Appointments Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Appointments</CardTitle>
                  <CardDescription>Last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-80">
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={appointmentsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                          />
                          <Bar dataKey="appointments" fill="#3b82f6" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Status</CardTitle>
                  <CardDescription>Distribution by status</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {loading2 ? (
                    <div className="flex items-center justify-center h-64">Loading...</div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="patients" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Patients */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Top Patients</CardTitle>
                  <CardDescription>By number of appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading4 ? (
                    <div className="flex items-center justify-center h-16">Loading...</div>
                  ) : topPatients.length > 0 ? (
                    <div className="space-y-4">
                      {topPatients.map((patient) => (
                        <div key={`${patient.isGuest ? 'guest' : 'patient'}-${patient.id}`} 
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {patient.isGuest ? 'Guest Patient' : 'Regular Patient'}
                            </div>
                          </div>
                          <div className="text-lg font-semibold">
                            {patient.appointments} {patient.appointments === 1 ? 'appointment' : 'appointments'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">No patient data available</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <div className="mb-4">
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setDateRange("week")}
                  className={`px-3 py-1 text-sm rounded-md ${dateRange === "week" 
                    ? "bg-primary text-white" 
                    : "bg-gray-100"}`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setDateRange("month")}
                  className={`px-3 py-1 text-sm rounded-md ${dateRange === "month" 
                    ? "bg-primary text-white" 
                    : "bg-gray-100"}`}
                >
                  Month
                </button>
                <button 
                  onClick={() => setDateRange("year")}
                  className={`px-3 py-1 text-sm rounded-md ${dateRange === "year" 
                    ? "bg-primary text-white" 
                    : "bg-gray-100"}`}
                >
                  Year
                </button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>
                  {dateRange === "week" ? "Last 7 days" : 
                   dateRange === "month" ? "Last 30 days" : "Last 12 months"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {loading3 ? (
                  <div className="flex items-center justify-center h-64">Loading...</div>
                ) : appointmentHistory.length > 0 ? (
                  <div className="h-80">
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={appointmentHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => {
                              if (dateRange === "year") {
                                return format(new Date(date), "MMM");
                              }
                              return format(new Date(date), "dd MMM");
                            }} 
                          />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="appointments"
                            stroke="#3b82f6"
                            activeDot={{ r: 8 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="text-center py-8">No appointment history available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
