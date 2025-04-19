
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AppointmentCard } from "@/components/AppointmentCard";
import { mockAppointments } from "@/lib/mockData";

export default function AppointmentsPage() {
  // Filter appointments by status
  const upcomingAppointments = mockAppointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  
  const pastAppointments = mockAppointments.filter(
    (appointment) => appointment.status === "completed"
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 container max-w-md mx-auto px-4 pb-24 pt-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No upcoming appointments.</p>
              <p className="text-gray-500 text-sm mt-1">Book an appointment to get started.</p>
            </div>
          )}
        </div>
        
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
            
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
