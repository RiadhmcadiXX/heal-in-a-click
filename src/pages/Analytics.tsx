
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, PieChart, Users } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { useDoctorAnalytics } from "@/hooks/useDoctorAnalytics";
import { AppointmentBarChart } from "@/components/analytics/AppointmentBarChart";
import { StatusPieChart } from "@/components/analytics/StatusPieChart";
import { LoadingAnimation } from "@/components/LoadingAnimation";

export default function Analytics() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Add explicit loading state
  
  // Fetch doctor data
  useEffect(() => {
    async function fetchDoctorData() {
      if (!user) return;

      try {
        setIsLoading(true); // Set loading to true when fetching starts
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setDoctor(data);
        setIsLoading(false); // Set loading to false after fetching completes
      } catch (error: any) {
        console.error('Error fetching doctor data:', error);
        setIsLoading(false); // Also set loading to false if there's an error
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

  // Use our analytics hook
  const {
    appointmentsData,
    patientsCount,
    statusDistribution,
    loading: analyticsLoading,
    totalAppointments,
    avgMonthlyAppointments
  } = useDoctorAnalytics(doctor?.id);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login');
    }
  }, [userLoading, user, navigate]);

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingAnimation 
          animationUrl="https://lmlgqzzhbiisgmysaoww.supabase.co/storage/v1/object/public/images//animation.json"
          width={200}
          height={200}
        />
      </div>
    );
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
            <div className="text-3xl font-bold">{isLoading || analyticsLoading ? "-" : totalAppointments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Patients</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div className="text-3xl font-bold">{isLoading || analyticsLoading ? "-" : patientsCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {isLoading || analyticsLoading ? "-" : statusDistribution.find(item => item.name.toLowerCase() === "completed")?.value || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{isLoading || analyticsLoading ? "-" : avgMonthlyAppointments}</div>
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
            {isLoading || analyticsLoading ? (
              <div className="h-full flex items-center justify-center">
                <LoadingAnimation 
                  animationUrl="https://lmlgqzzhbiisgmysaoww.supabase.co/storage/v1/object/public/images//animation.json"
                  width={150}
                  height={150}
                />
              </div>
            ) : (
              <AppointmentBarChart data={appointmentsData || []} />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              <span>Appointment Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading || analyticsLoading ? (
              <div className="h-full flex items-center justify-center">
                <LoadingAnimation 
                  animationUrl="https://lmlgqzzhbiisgmysaoww.supabase.co/storage/v1/object/public/images//animation.json"
                  width={150}
                  height={150}
                />
              </div>
            ) : (
              <StatusPieChart data={statusDistribution || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
