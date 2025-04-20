
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [existingSlots, setExistingSlots] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Fetch existing availability slots for the next 30 days
  useEffect(() => {
    async function fetchAvailability() {
      if (!doctor) return;
      
      try {
        const startDate = format(new Date(), 'yyyy-MM-dd');
        const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('doctor_availabilities')
          .select('*')
          .eq('doctor_id', doctor.id)
          .gte('available_date', startDate)
          .lte('available_date', endDate);
        
        if (error) throw error;
        
        // Organize slots by date
        const slots: Record<string, string[]> = {};
        data?.forEach(slot => {
          const date = slot.available_date;
          if (!slots[date]) {
            slots[date] = [];
          }
          slots[date].push(slot.available_time);
        });
        
        setExistingSlots(slots);
      } catch (error: any) {
        console.error('Error fetching availability:', error);
      }
    }
    
    if (doctor) {
      fetchAvailability();
    }
  }, [doctor]);
  
  // Update selected slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      setSelectedSlots(existingSlots[dateString] || []);
    }
  }, [selectedDate, existingSlots]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);
  
  const handleSlotToggle = (time: string) => {
    setSelectedSlots(prev => 
      prev.includes(time) 
        ? prev.filter(slot => slot !== time)
        : [...prev, time]
    );
  };
  
  const handleSaveAvailability = async () => {
    if (!doctor || !selectedDate) return;
    
    setIsSubmitting(true);
    
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Delete existing slots for this date
      await supabase
        .from('doctor_availabilities')
        .delete()
        .eq('doctor_id', doctor.id)
        .eq('available_date', dateString);
      
      // Insert new slots
      if (selectedSlots.length > 0) {
        const slotsToInsert = selectedSlots.map(time => ({
          doctor_id: doctor.id,
          available_date: dateString,
          available_time: time
        }));
        
        const { error } = await supabase
          .from('doctor_availabilities')
          .insert(slotsToInsert);
        
        if (error) throw error;
      }
      
      // Update local state
      setExistingSlots(prev => ({
        ...prev,
        [dateString]: selectedSlots
      }));
      
      toast({
        title: "Success",
        description: "Your availability has been updated",
      });
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save availability",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
                className="pointer-events-auto"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {selectedDate ? `Available Times for ${format(selectedDate, 'MMMM d, yyyy')}` : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {timeSlots.map((slot) => (
                      <div key={slot.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={slot.value}
                          checked={selectedSlots.includes(slot.value)}
                          onCheckedChange={() => handleSlotToggle(slot.value)}
                        />
                        <Label htmlFor={slot.value}>{slot.label}</Label>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handleSaveAvailability}
                    className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Availability"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
