
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Heal-in-a-Click</h1>
        <h2 className="text-xl text-gray-600 mb-8">Doctor Portal</h2>
        
        <p className="max-w-md mb-8 text-gray-600">
          Manage your appointments, set your availability, and connect with patients all in one place.
        </p>
        
        <div className="space-y-4 w-full max-w-xs">
          <Button 
            className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/signup")}
          >
            Register as a Doctor
          </Button>
        </div>
      </main>
    </div>
  );
}
