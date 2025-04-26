
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PatientHistoryTable } from "@/components/PatientHistoryTable";

export default function Analytics() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading2, setLoading2] = useState(true);

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
        
        // Fetch all appointments for this doctor
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            patient_id,
            appointment_date,
            appointment_time,
            status,
            patients (
              id,
              first_name,
              last_name,
              email,
              phone,
              date_of_birth,
              address,
              city,
              gender,
              emergency_contact_name,
              emergency_contact_phone,
              medical_conditions,
              allergies,
              blood_type
            )
          `)
          .eq('doctor_id', data.id)
          .order('appointment_date', { ascending: false });

        if (appointmentsError) throw appointmentsError;

        setVisits(appointmentsData);
        setLoading2(false);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data",
        });
      }
    }

    if (user) {
      fetchDoctorData();
    } else if (!loading) {
      navigate('/login');
    }
  }, [user, loading, navigate, toast]);

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Patient History Analytics</h1>
        
        {doctor && (
          <div className="mb-6">
            <p className="text-xl">
              Dr. {doctor.first_name} {doctor.last_name}
            </p>
            <p className="text-gray-600">{doctor.specialty}</p>
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Patient Visit History</CardTitle>
            <CardDescription>
              View and analyze your patient visit history, search by name, and access detailed patient profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading2 ? (
              <div className="flex items-center justify-center h-64">Loading patient data...</div>
            ) : (
              <PatientHistoryTable visits={visits} />
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
