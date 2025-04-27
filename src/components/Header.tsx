import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ChevronLeft, User, LogOut, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const showBackButton = !["/", "/dashboard"].includes(location.pathname);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Doctor Portal";
      case "/dashboard":
        return "Doctor Dashboard";
      case "/appointments":
        return "My Appointments";
      case "/availability":
        return "Manage Availability";
      case "/profile":
        return "My Profile";
      case "/login":
        return "Login";
      case "/signup":
        return "Sign Up";
      default:
        return "Heal-in-a-Click";
    }
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b py-4 px-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {showBackButton ? (
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="text-healthcare-primary font-bold text-lg">Heal-in-a-Click</div>
        )}
        
        <h1 className="text-lg font-semibold flex-1 text-center">
          {getPageTitle()}
        </h1>
        
        <div className="flex items-center space-x-2">
          <Link to="/help">
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>
          {user ? (
            <div className="flex items-center space-x-2">
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
