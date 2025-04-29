
import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function Footer() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // If user is not logged in, don't show the footer on auth pages
  if (!user && (location.pathname === "/login" || location.pathname === "/signup")) {
    return null;
  }
  
  return (
    <footer className="fixed bottom-0 w-full bg-white border-t py-3 px-4 md:px-6">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <Link 
          to={user ? "/dashboard" : "/"} 
          className={cn(
            "flex flex-col items-center text-sm",
            isActive("/dashboard") ? "text-healthcare-primary font-medium" : "text-gray-500"
          )}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          <span>{user ? t("navigation.dashboard") : t("navigation.home")}</span>
        </Link>
        
        <Link 
          to={user ? "/availability" : "/appointments"} 
          className={cn(
            "flex flex-col items-center text-sm", 
            isActive("/availability") || isActive("/appointments") ? "text-healthcare-primary font-medium" : "text-gray-500"
          )}
        >
          <Calendar className="h-6 w-6" />
          <span>{user ? t("navigation.availability") : t("navigation.appointments")}</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={cn(
            "flex flex-col items-center text-sm",
            isActive("/profile") ? "text-healthcare-primary font-medium" : "text-gray-500"
          )}
        >
          <User className="h-6 w-6" />
          <span>{t("navigation.profile")}</span>
        </Link>
      </div>
    </footer>
  );
}
