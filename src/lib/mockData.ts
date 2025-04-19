
import { Doctor, TimeSlot, Appointment } from "@/types";

// Mock data for doctors
export const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    specialty: "Cardiologist",
    city: "New York",
    consultationFee: 150,
    rating: 4.8,
    experience: 10,
    about: "Dr. Sarah Johnson is a board-certified cardiologist with over 10 years of experience. She specializes in preventive cardiology and heart health management."
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    specialty: "Dermatologist",
    city: "Los Angeles",
    consultationFee: 120,
    rating: 4.7,
    experience: 8,
    about: "Dr. Michael Chen is a dermatologist specializing in skin cancer prevention and cosmetic procedures. He has helped thousands of patients achieve healthier skin."
  },
  {
    id: "3",
    name: "Dr. Emily Martinez",
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    specialty: "Pediatrician",
    city: "Chicago",
    consultationFee: 100,
    rating: 4.9,
    experience: 12,
    about: "Dr. Emily Martinez is a caring pediatrician dedicated to children's health. She provides comprehensive care from newborns to adolescents."
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    specialty: "Orthopedist",
    city: "Boston",
    consultationFee: 170,
    rating: 4.6,
    experience: 15,
    about: "Dr. James Wilson is an orthopedic surgeon specializing in sports medicine and joint replacement. He has worked with professional athletes throughout his career."
  },
  {
    id: "5",
    name: "Dr. Lisa Thompson",
    imageUrl: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    specialty: "Neurologist",
    city: "Seattle",
    consultationFee: 200,
    rating: 4.9,
    experience: 14,
    about: "Dr. Lisa Thompson is a leading neurologist specializing in headache disorders and multiple sclerosis. She takes a holistic approach to neurological health."
  }
];

// Generate time slots for the next 7 days
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  // For each doctor
  mockDoctors.forEach(doctor => {
    // For the next 7 days
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Create 8 slots per day (9am-5pm)
      for (let hour = 9; hour < 17; hour++) {
        const startTime = `${hour}:00`;
        const endTime = `${hour + 1}:00`;
        
        // Randomly mark some slots as booked
        const isBooked = Math.random() > 0.7;
        
        slots.push({
          id: `${doctor.id}-${dateString}-${hour}`,
          doctorId: doctor.id,
          date: dateString,
          startTime,
          endTime,
          isBooked
        });
      }
    }
  });
  
  return slots;
};

export const mockTimeSlots: TimeSlot[] = generateTimeSlots();

// Mock appointments
export const mockAppointments: Appointment[] = [
  {
    id: "appt1",
    userId: "user1",
    doctorId: "1",
    timeSlotId: mockTimeSlots[0].id,
    date: mockTimeSlots[0].date,
    startTime: mockTimeSlots[0].startTime,
    endTime: mockTimeSlots[0].endTime,
    status: 'scheduled',
    doctorName: "Dr. Sarah Johnson",
    doctorSpecialty: "Cardiologist",
    doctorImageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "appt2",
    userId: "user1",
    doctorId: "3",
    timeSlotId: mockTimeSlots[20].id,
    date: mockTimeSlots[20].date,
    startTime: mockTimeSlots[20].startTime,
    endTime: mockTimeSlots[20].endTime,
    status: 'scheduled',
    doctorName: "Dr. Emily Martinez",
    doctorSpecialty: "Pediatrician",
    doctorImageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  }
];
