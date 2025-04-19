
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { ChevronLeft, User } from "lucide-react";

export function Header() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // For demonstration purposes
  
  // Determine if we should show back button (not on home page)
  const showBackButton = location.pathname !== "/";
  
  // Determine page title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Find Doctors";
      case "/appointments":
        return "My Appointments";
      case "/profile":
        return "My Profile";
      case "/login":
        return "Login";
      case "/signup":
        return "Sign Up";
      default:
        if (location.pathname.startsWith("/doctor/")) {
          return "Doctor Profile";
        }
        if (location.pathname.startsWith("/book/")) {
          return "Book Appointment";
        }
        return "Heal-in-a-Click";
    }
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b py-4 px-4">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {showBackButton ? (
          <Link to="/" className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
        ) : (
          <div className="text-healthcare-primary font-bold text-lg">Heal-in-a-Click</div>
        )}
        
        <h1 className="text-lg font-semibold flex-1 text-center">
          {getPageTitle()}
        </h1>
        
        <Link to={isLoggedIn ? "/profile" : "/login"}>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
