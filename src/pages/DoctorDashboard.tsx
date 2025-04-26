import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BarChart, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { AppointmentsTable } from "@/components/AppointmentsTable";
import { useDoctorAppointments } from "@/hooks/useDoctorAppointments";
import { DayAvailabilitySidebar } from "@/components/DayAvailabilitySidebar";
import { AddAppointmentModal } from "@/components/AddAppointmentModal";
import { WeeklyCalendarView } from "@/components/WeeklyCalendarView";
import { useWeeklyCalendarAdapter } from "@/hooks/useWeeklyCalendarAdapter";
import { PendingAppointmentsList } from "@/components/PendingAppointmentsList";

const WORKING_HOURS = [
  "09:00:00",
  "10:00:00",
  "11:00:00",
  "12:00:00",
  "13:00:00",
  "14:00:00",
  "15:00:00",
  "16:00:00",
  "17:00:00",
];

function formatHourLabel(t: string) {
  const [h, m] = t.split(":");
  const date = new Date(2000, 1, 1, Number(h), Number(m), 0);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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

  const { appointments, loading: loadingData, refreshAppointments } = useDoctorAppointments(
    doctor?.id,
    date,
    viewMode
  );

  const formattedWeeklyAppointments = useWeeklyCalendarAdapter(appointments);

  const [daySlots, setDaySlots] = useState<{ time: string; status: "free" | "occupied" }[]>([]);

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
          time,
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-4">
        {doctor && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Welcome, Dr. {doctor.first_name} {doctor.last_name}
            </h1>
            <p className="text-gray-500">{doctor.specialty}</p>
          </div>
        )}

        <div className="flex justify-end mb-4">
          <div className="flex rounded-md">
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("day")}
              className="rounded-l-md rounded-r-none"
            >
              Day View
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="rounded-r-md rounded-l-none"
            >
              Week View
            </Button>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {viewMode === "day" ? (
            <>
              <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
                <DayAvailabilitySidebar
                  slots={daySlots.map((s) => ({
                    time: formatHourLabel(s.time),
                    status: s.status,
                  }))}
                  onAddAppointmentClick={() => setShowAddModal(true)}
                  onSlotClick={undefined}
                />

                <div className="flex-1 w-full md:max-w-xl">
                  <MonthlyCalendar
                    date={date}
                    onDateSelect={(newDate) => newDate && setDate(newDate)}
                    hasAppointmentOnDate={hasAppointmentOnDate}
                  />
                </div>
              </div>
              <div className="w-80 sticky top-4">
                <PendingAppointmentsList 
                  appointments={pendingAppointments}
                  onStatusChange={refreshAppointments}
                />
              </div>
            </>
          ) : (
            <Card className="p-6 w-full">
              <WeeklyCalendarView
                appointments={formattedWeeklyAppointments}
                onAppointmentClick={(apt) => {
                  setSelectedAppointment(apt.originalData);
                }}
                selectedDate={date}
                onDateChange={setDate}
              />
            </Card>
          )}
        </div>

        <div className="mt-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Appointments for {format(date, 'MMMM d, yyyy')}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/analytics')}
                    className="flex items-center gap-2"
                  >
                    <BarChart className="h-4 w-4" />
                    <span>View Analytics</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/availability')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Manage Availability</span>
                  </Button>
                </div>
              </div>

              {loadingData ? (
                <div className="text-center py-8">Loading appointments...</div>
              ) : selectedDayAppointments.length > 0 ? (
                <AppointmentsTable
                  appointments={selectedDayAppointments}
                  onAppointmentClick={setSelectedAppointment}
                  selectedAppointmentId={selectedAppointment?.id}
                  refreshAppointments={refreshAppointments}
                />
              ) : (
                <div className="text-center py-8 border rounded-md p-6">
                  <p className="text-gray-500">No appointments scheduled for this day.</p>
                  <Button
                    className="mt-4 bg-healthcare-primary hover:bg-healthcare-primary/90"
                    onClick={() => navigate("/availability")}
                  >
                    Add Availability
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

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
      </main>
      <Footer />
    </div>
  );
}
