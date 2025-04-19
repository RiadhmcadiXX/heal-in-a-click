
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/Calendar";
import { TimeSlots } from "@/components/TimeSlots";
import { useDoctors } from "@/hooks/useDoctors";
import { useDoctorAvailabilities } from "@/hooks/useDoctorAvailabilities";

export default function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: doctors = [] } = useDoctors();
  const doctor = doctors.find((doc) => doc.id === id);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  const { 
    data: availableTimeSlots = [], 
    isLoading: isLoadingAvailabilities 
  } = useDoctorAvailabilities(id || '', selectedDate);

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
  
  const handleBookAppointment = () => {
    if (selectedTimeSlot) {
      navigate(`/book/${id}`, {
        state: { 
          date: selectedDate, 
          timeSlot: selectedTimeSlot 
        }
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 container max-w-md mx-auto px-4 pb-24 pt-4">
        <Card className="mb-4 overflow-hidden">
          <div className="bg-healthcare-primary h-32 relative"></div>
          <CardContent className="pt-0">
            <div className="flex justify-center -mt-16">
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="h-32 w-32 rounded-full border-4 border-white object-cover bg-white"
              />
            </div>
            
            <div className="text-center mt-2">
              <h2 className="font-semibold text-xl">{doctor.name}</h2>
              <p className="text-gray-500">{doctor.specialty}</p>
              <p className="text-gray-500">{doctor.city}</p>
              
              <div className="flex justify-center items-center mt-2">
                <div className="flex items-center bg-healthcare-background px-2 py-1 rounded">
                  <span className="ml-1 text-sm font-medium">Rating: {doctor.rating}</span>
                </div>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-500">{doctor.experience} yrs exp</span>
              </div>
              
              <div className="mt-4">
                <div className="text-lg font-semibold text-healthcare-primary">
                  ${doctor.consultationFee}
                </div>
                <p className="text-sm text-gray-500">Consultation Fee</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">About</h3>
              <p className="text-gray-700 text-sm">{doctor.about}</p>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Select Appointment Date</h3>
              <Calendar 
                onDateSelect={(date) => setSelectedDate(date)}
                selectedDate={selectedDate}
              />
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Available Time Slots</h3>
              <TimeSlots 
                doctorId={id || ''} 
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
                Book Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
