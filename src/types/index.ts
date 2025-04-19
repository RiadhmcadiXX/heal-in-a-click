
// Types for our application

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface Doctor {
  id: string;
  name: string;
  imageUrl: string;
  specialty: string;
  city: string;
  consultationFee: number;
  rating: number;
  experience: number;
  about: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  date: string;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  timeSlotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  doctorName: string;
  doctorSpecialty: string;
  doctorImageUrl: string;
}
