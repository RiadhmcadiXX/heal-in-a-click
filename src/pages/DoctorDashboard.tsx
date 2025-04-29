
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDoctorAppointments } from "@/hooks/useDoctorAppointments";
import { useWeeklyCalendarAdapter } from "@/hooks/useWeeklyCalendarAdapter";
import { MainLayout } from "@/layouts/MainLayout";
import { AddAppointmentModal } from "@/components/AddAppointmentModal";
import { ViewModeToggle } from "@/components/dashboard/ViewModeToggle";
import { DoctorHeader } from "@/components/dashboard/DoctorHeader";
import { DailyViewDashboard } from "@/components/dashboard/DailyViewDashboard";
import { WeeklyViewDashboard } from "@/components/dashboard/WeeklyViewDashboard";
import { AppointmentsDisplay } from "@/components/dashboard/AppointmentsDisplay";

const WORKING_HOURS = [
  "09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00",
  "14:00:00", "15:00:00", "16:00:00", "17:00:00",
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [monthAppointments, setMonthAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [showAddModal, setShowAddModal] = useState(false);
  const [daySlots, setDaySlots] = useState<{ time: string; status: "free" | "occupied" }[]>([]);

  const { appointments, loading: loadingData, refreshAppointments } = useDoctorAppointments(
    doctor?.id,
    date,
    viewMode
  );

  const formattedWeeklyAppointments = useWeeklyCalendarAdapter(appointments);

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
    async function fetchMonthAppointments() {
      if (!doctor) return;

      try {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const formattedFirstDay = format(firstDay, 'yyyy-MM-dd');
        const formattedLastDay = format(lastDay, 'yyyy-MM-dd');

        const { data, error } = await supabase
          .from('appointments')
          .select(`id, appointment_date`)
          .eq('doctor_id', doctor.id)
          .gte('appointment_date', formattedFirstDay)
          .lte('appointment_date', formattedLastDay);

        if (error) throw error;

        setMonthAppointments(data || []);
      } catch (error: any) {
        console.error('Error fetching month appointments:', error);
      }
    }

    if (doctor) {
      fetchMonthAppointments();
    }
  }, [doctor, date]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    async function fetchSlots() {
      if (!doctor?.id) {
        setDaySlots([]);
        return;
      }
      const formattedDate = format(date, "yyyy-MM-dd");
      const { data: availableSlots } = await supabase
        .from("doctor_availabilities")
        .select("available_time")
        .eq("doctor_id", doctor.id)
        .eq("available_date", formattedDate);

      const availSet = new Set(
        (availableSlots || []).map((a: any) => a.available_time)
      );

      const { data: dayApts } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("doctor_id", doctor.id)
        .eq("appointment_date", formattedDate)
        .neq("status", "cancelled");

      const occupiedSet = new Set(
        (dayApts || []).map((a: any) => a.appointment_time)
      );

      let slots: { time: string; status: "free" | "occupied" }[] = [];
      let slotsToUse =
        availSet.size > 0 ? Array.from(availSet) : WORKING_HOURS;

      slots = slotsToUse
        .sort()
        .map((time) => ({
          time: time as string,
          status: occupiedSet.has(time as string) ? "occupied" : "free",
        }));
      setDaySlots(slots);
    }
    fetchSlots();
  }, [doctor?.id, date, appointments.length]);

  const hasAppointmentOnDate = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return monthAppointments.some(apt => apt.appointment_date === formattedDay);
  };

  const selectedDayAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    
    const formattedSelectedDate = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === formattedSelectedDate);
  }, [appointments, date]);

  const pendingAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    return appointments.filter(apt => apt.status === "pending");
  }, [appointments]);

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <MainLayout>
      <DoctorHeader doctor={doctor} selectedDate={date} />
      
      <div className="flex justify-end mb-4">
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {viewMode === "day" ? (
        <DailyViewDashboard
          slots={daySlots}
          onAddAppointmentClick={() => setShowAddModal(true)}
          date={date}
          onDateSelect={(newDate) => newDate && setDate(newDate)}
          hasAppointmentOnDate={hasAppointmentOnDate}
          pendingAppointments={pendingAppointments}
          onStatusChange={refreshAppointments}
        />
      ) : (
        <WeeklyViewDashboard
          appointments={formattedWeeklyAppointments}
          onAppointmentClick={(apt) => setSelectedAppointment(apt.originalData)}
          selectedDate={date}
          onDateChange={setDate}
        />
      )}

      <AppointmentsDisplay 
        loading={loadingData}
        appointments={selectedDayAppointments}
        onAppointmentClick={setSelectedAppointment}
        selectedAppointmentId={selectedAppointment?.id}
        refreshAppointments={refreshAppointments}
      />

      {doctor && (
        <AddAppointmentModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          doctorId={doctor.id}
          date={date}
          availableSlots={daySlots.filter((s) => s.status === "free").map((s) => s.time)}
          onSuccess={refreshAppointments}
        />
      )}
    </MainLayout>
  );
}
