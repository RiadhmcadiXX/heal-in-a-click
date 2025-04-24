
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDoctorAnalytics } from "@/hooks/useDoctorAnalytics";
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
  
  // Use the analytics hook to fetch core metrics
  const [loading3, setLoading3] = useState(true);
  const [loading4, setLoading4] = useState(true);
  const [appointmentHistory, setAppointmentHistory] = useState<any[]>([]);
  const [topPatients, setTopPatients] = useState<any[]>([]);
  
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
  
  // Use the doctor analytics hook
  const { 
    appointmentsData, 
    patientsCount, 
    statusDistribution, 
    loading: analyticsLoading,
    totalAppointments, 
    avgMonthlyAppointments 
  } = useDoctorAnalytics(doctor?.id);

  // Fetch appointment history based on date range
  useEffect(() => {
    async function fetchAppointmentHistory() {
      if (!doctor?.id) return;
      
      setLoading3(true);
      try {
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
          .select('appointment_date')
          .eq('doctor_id', doctor.id)
          .gte('appointment_date', formattedStartDate)
          .lte('appointment_date', formattedEndDate);
        
        if (error) throw error;
        
        // Group appointments by date and count
        const appointmentsByDate: Record<string, number> = {};
        
        data.forEach(appointment => {
          const date = appointment.appointment_date;
          appointmentsByDate[date] = (appointmentsByDate[date] || 0) + 1;
        });
        
        // Transform to array format for the chart
        const formattedData = Object.entries(appointmentsByDate).map(([date, count]) => ({
          date,
          appointments: count,
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
        // Fetch all appointments with patient info
        const { data: patientAppointments, error: patientError } = await supabase
          .from('appointments')
          .select(`
            patient_id,
            patients (first_name, last_name)
          `)
          .eq('doctor_id', doctor.id)
          .not('patient_id', 'is', null);
        
        if (patientError) throw patientError;
        
        // Also get guest patient data
        const { data: guestAppointments, error: guestError } = await supabase
          .from('appointments')
          .select(`
            guest_patient_id,
            guest_patient (first_name, last_name)
          `)
          .eq('doctor_id', doctor.id)
          .not('guest_patient_id', 'is', null);
        
        if (guestError) throw guestError;
        
        // Manual counting for patient appointments
        const patientCountMap: Record<string, { count: number, name: string }> = {};
        patientAppointments?.forEach(item => {
          if (item.patient_id) {
            const id = item.patient_id;
            if (!patientCountMap[id]) {
              patientCountMap[id] = { 
                count: 0, 
                name: `${item.patients.first_name} ${item.patients.last_name}` 
              };
            }
            patientCountMap[id].count++;
          }
        });
        
        // Manual counting for guest patient appointments
        const guestCountMap: Record<string, { count: number, name: string }> = {};
        guestAppointments?.forEach(item => {
          if (item.guest_patient_id) {
            const id = item.guest_patient_id;
            if (!guestCountMap[id]) {
              guestCountMap[id] = { 
                count: 0, 
                name: `${item.guest_patient.first_name} ${item.guest_patient.last_name}` 
              };
            }
            guestCountMap[id].count++;
          }
        });
        
        // Convert to arrays
        const patientData = Object.entries(patientCountMap).map(([id, data]) => ({
          id,
          name: data.name,
          appointments: data.count,
          isGuest: false
        }));
        
        const guestData = Object.entries(guestCountMap).map(([id, data]) => ({
          id,
          name: data.name,
          appointments: data.count,
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Fixed chart config to match the expected type
  const chartConfig = {
    "completed": { label: "Completed", color: "#10b981" },
    "cancelled": { label: "Cancelled", color: "#ef4444" },
    "pending": { label: "Pending", color: "#f59e0b" },
    "rescheduled": { label: "Rescheduled", color: "#3b82f6" },
    "appointments": { label: "Appointments", color: "#3b82f6" }
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
                {analyticsLoading.patients ? 'Loading...' : patientsCount}
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
                {totalAppointments}
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
                {avgMonthlyAppointments}
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
                  {analyticsLoading.status ? (
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
