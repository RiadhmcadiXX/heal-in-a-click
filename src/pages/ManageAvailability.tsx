import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DoctorAvailabilityCalendar } from "@/components/DoctorAvailabilityCalendar";
import { AvailabilityTimeSlots } from "@/components/AvailabilityTimeSlots";
import { useAvailabilityManager } from "@/hooks/useAvailabilityManager";
import { AppointmentDurationSelector } from "@/components/AppointmentDurationSelector";

const timeSlots = [
  { label: "9:00 AM", value: "09:00:00" },
  { label: "10:00 AM", value: "10:00:00" },
  { label: "11:00 AM", value: "11:00:00" },
  { label: "12:00 PM", value: "12:00:00" },
  { label: "1:00 PM", value: "13:00:00" },
  { label: "2:00 PM", value: "14:00:00" },
  { label: "3:00 PM", value: "15:00:00" },
  { label: "4:00 PM", value: "16:00:00" },
  { label: "5:00 PM", value: "17:00:00" }
];

export default function ManageAvailability() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  
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

  const {
    selectedDate,
    setSelectedDate,
    selectedSlots,
    setSelectedSlots,
    isSubmitting,
    handleSaveAvailability
  } = useAvailabilityManager(doctor?.id);

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Manage Your Availability</h1>
          <p className="text-gray-500">Select dates and times when you're available for appointments</p>
        </div>

        {doctor && (
          <div className="mb-6">
            <AppointmentDurationSelector
              doctorId={doctor.id}
              currentDuration={doctor.appointment_duration}
              onDurationChange={() => {}}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              {doctor && (
                <DoctorAvailabilityCalendar
                  doctorId={doctor.id}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              )}
            </CardContent>
          </Card>

          <AvailabilityTimeSlots
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
            onSlotsChange={setSelectedSlots}
            onSave={handleSaveAvailability}
            isSubmitting={isSubmitting}
            timeSlots={timeSlots}
          />
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
