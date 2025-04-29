
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ChevronLeft, User, LogOut, HelpCircle, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  
  const showBackButton = !["/", "/dashboard"].includes(location.pathname);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return t("navigation.home");
      case "/dashboard":
        return t("navigation.dashboard");
      case "/appointments":
        return t("navigation.appointments");
      case "/availability":
        return t("navigation.availability");
      case "/profile":
        return t("navigation.profile");
      case "/login":
        return "Login";
      case "/signup":
        return "Sign Up";
      default:
        return t("app.name");
    }
  };
  
  // This header is now only used for non-dashboard pages
  // The dashboard pages use the sidebar navigation instead
  if (["/dashboard", "/availability", "/analytics", "/share-patient", "/profile"].includes(location.pathname)) {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b py-4 px-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {showBackButton ? (
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="text-healthcare-primary font-bold text-lg">{t("app.name")}</div>
        )}
        
        <h1 className="text-lg font-semibold flex-1 text-center">
          {getPageTitle()}
        </h1>
        
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
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
      {user && location.pathname !== "/share-patient" && (
        <nav>
          <Link to="/share-patient" className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded">
            <Share2 className="h-4 w-4" />
            <span>{t("navigation.sharePatients")}</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
