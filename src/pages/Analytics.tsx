import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, LineChart } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";

export default function Analytics() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    upcomingAppointments: 0,
    monthlyStats: []
  });

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
    async function fetchAnalyticsData() {
      if (!doctor) return;

      try {
        // Fetch appointment statistics
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('status, appointment_date')
          .eq('doctor_id', doctor.id);

        if (appointmentsError) throw appointmentsError;

        // Process the data
        const now = new Date();
        const totalAppointments = appointmentsData?.length || 0;
        const completedAppointments = appointmentsData?.filter(apt => apt.status === 'completed').length || 0;
        const cancelledAppointments = appointmentsData?.filter(apt => apt.status === 'cancelled').length || 0;
        const upcomingAppointments = appointmentsData?.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate > now && apt.status !== 'cancelled';
        }).length || 0;

        // Generate monthly statistics (simplified example)
        const monthlyStats = [
          { month: 'Jan', appointments: 12 },
          { month: 'Feb', appointments: 15 },
          { month: 'Mar', appointments: 18 },
          { month: 'Apr', appointments: 14 },
          { month: 'May', appointments: 21 },
          { month: 'Jun', appointments: 25 },
        ];

        setAnalyticsData({
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          upcomingAppointments,
          monthlyStats
        });
      } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch analytics data",
        });
      }
    }

    if (doctor) {
      fetchAnalyticsData();
    }
  }, [doctor, toast]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-500">View your practice statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.totalAppointments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{analyticsData.completedAppointments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{analyticsData.cancelledAppointments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{analyticsData.upcomingAppointments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              <span>Monthly Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will be implemented here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              <span>Appointment Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Trend visualization will be implemented here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
