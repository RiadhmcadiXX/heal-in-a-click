
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
  // Additional fields from database
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image_url?: string;
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

export interface PatientVisit {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  doctor_id: string;
  patients: {
    first_name: string;
    last_name: string;
    [key: string]: any;
  };
  status: string;
}

export interface SharedPatient {
  id: string;
  from_doctor_id: string;
  to_doctor_id: string;
  patient_id: string;
  shared_at: string;
  notes?: string;
  active: boolean;
  patients: {
    first_name: string;
    last_name: string;
    [key: string]: any;
  };
  from_doctor: {
    first_name: string;
    last_name: string;
    profile_image_url?: string;
    [key: string]: any;
  };
}
