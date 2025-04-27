
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

// Generate time slots dynamically based on appointment duration
const generateTimeSlots = (durationMinutes: number = 60) => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += durationMinutes) {
      if (hour === endHour && minute > 0) continue; // Don't go past end hour
      
      const hourFormatted = hour < 10 ? `0${hour}` : `${hour}`;
      const minuteFormatted = minute < 10 ? `0${minute}` : `${minute}`;
      const time = `${hourFormatted}:${minuteFormatted}:00`;
      
      const label = `${hour % 12 || 12}:${minuteFormatted} ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push({ label, value: time });
    }
  }
  
  return slots;
};

export default function ManageAvailability() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<{ label: string; value: string }[]>([]);
  
  const {
    selectedDate,
    setSelectedDate,
    selectedSlots,
    setSelectedSlots,
    isSubmitting,
    handleSaveAvailability,
    appointmentDuration
  } = useAvailabilityManager(doctor?.id);

  useEffect(() => {
    // Update time slots whenever appointment duration changes
    setTimeSlots(generateTimeSlots(appointmentDuration));
  }, [appointmentDuration]);
  
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
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  const handleDurationChange = (newDuration: number) => {
    // Update time slots when duration changes
    setTimeSlots(generateTimeSlots(newDuration));
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 container max-w-5xl mx-auto px-6 pb-24 pt-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Manage Your Availability</h1>
          <p className="text-gray-500">Select dates and times when you're available for appointments</p>
        </div>

        {doctor && (
          <div className="mb-6">
            <AppointmentDurationSelector
              doctorId={doctor.id}
              currentDuration={doctor.appointment_duration}
              onDurationChange={handleDurationChange}
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
