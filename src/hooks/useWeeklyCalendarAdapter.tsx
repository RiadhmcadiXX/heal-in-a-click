
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

interface AppointmentData {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
  guest_patient_id?: string;
  notes?: string;
}

export interface FormattedAppointment {
  id: string;
  title: string;
  patientName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
  notes?: string;
  originalData: AppointmentData;
}

export function useWeeklyCalendarAdapter(appointments: AppointmentData[]): FormattedAppointment[] {
  const formattedAppointments = useMemo(() => {
    return appointments.map(appointment => {
      // Calculate end time (assuming 1 hour duration)
      const [hours, minutes] = appointment.appointment_time.split(':');
      const startHour = parseInt(hours);
      const endHour = startHour + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
      
      // Format patient name
      const patientName = appointment.patients
        ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
        : "Guest Patient";

      return {
        id: appointment.id,
        title: `Appointment with ${patientName}`,
        patientName,
        startTime: appointment.appointment_time,
        endTime,
        date: appointment.appointment_date,
        status: appointment.status,
        notes: appointment.notes,
        originalData: appointment
      };
    });
  }, [appointments]);

  return formattedAppointments;
}
