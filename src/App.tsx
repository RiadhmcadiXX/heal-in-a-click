
import { 
  Toaster 
} from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DoctorDetail from "./pages/DoctorDetail";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import NotFound from "./pages/NotFound";
import DoctorDashboard from "./pages/DoctorDashboard";
import ManageAvailability from "./pages/ManageAvailability";
import SubscriptionPage from "./pages/SubscriptionPage";
import Analytics from "./pages/Analytics";
import Help from "./pages/Help";
import SharePatient from "./pages/SharePatient";
import PatientsManagement from "./pages/PatientsManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctor/:id" element={<DoctorDetail />} />
          <Route path="/book/:id" element={<BookAppointment />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DoctorDashboard />} />
          <Route path="/availability" element={<ManageAvailability />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/help" element={<Help />} />
          <Route path="/share-patient" element={<SharePatient />} />
          <Route path="/patients" element={<PatientsManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
