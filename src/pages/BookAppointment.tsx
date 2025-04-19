
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/Calendar";
import { TimeSlots } from "@/components/TimeSlots";
import { useDoctors } from "@/hooks/useDoctors";
import { TimeSlot } from "@/types";

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: doctors = [] } = useDoctors();
  const [doctor] = doctors.filter((doc) => doc.id === id);
  
  const [selectedDate, setSelectedDate] = useState(
    location.state?.date || new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    location.state?.timeSlot || null
  );
  
  const handleBookAppointment = async () => {
    if (!selectedTimeSlot) return;
    
    try {
      // In a real app, you would:
      // 1. Check if the user is authenticated
      // 2. Insert appointment into Supabase
      // 3. Update time slot availability
      
      // Simulate booking process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      navigate("/appointments");
    } catch (error) {
      console.error("Booking failed", error);
    }
  };
  
  // Handle doctor not found
  if (!doctor) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container max-w-md mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Doctor not found</h2>
            <p className="text-gray-500 mb-4">
              The doctor you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 container max-w-md mx-auto px-4 pb-24 pt-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center">
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="h-16 w-16 rounded-full object-cover mr-4"
              />
              <div>
                <h2 className="font-semibold">{doctor.name}</h2>
                <p className="text-sm text-gray-500">{doctor.specialty}</p>
                <div className="mt-1">
                  <span className="text-healthcare-primary font-medium">${doctor.consultationFee}</span>
                  <span className="text-sm text-gray-500"> per consultation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Select Date</h3>
          <Calendar 
            onDateSelect={setSelectedDate} 
            selectedDate={selectedDate} 
          />
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Select Time</h3>
          <TimeSlots
            doctorId={doctor.id}
            date={selectedDate}
            onTimeSlotSelect={setSelectedTimeSlot}
            selectedTimeSlot={selectedTimeSlot}
          />
        </div>
        
        <div className="mt-8">
          <Button 
            className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
            disabled={!selectedTimeSlot}
            onClick={handleBookAppointment}
          >
            Confirm Booking
          </Button>
          
          {selectedTimeSlot && (
            <p className="text-center text-sm text-gray-500 mt-2">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })} • {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
            </p>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
