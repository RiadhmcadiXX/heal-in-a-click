
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  Share2, 
  BarChart, 
  User, 
  LogOut,
  HelpCircle,
  Users,
  Globe
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const navigationItems = [
    {
      title: t("navigation.dashboard"),
      path: "/dashboard",
      icon: Home,
    },
    {
      title: t("navigation.patients"),
      path: "/patients",
      icon: Users,
    },
    {
      title: t("navigation.availability"),
      path: "/availability",
      icon: Calendar,
    },
    {
      title: t("navigation.sharePatients"),
      path: "/share-patient",
      icon: Share2,
    },
    {
      title: t("navigation.analytics"),
      path: "/analytics",
      icon: BarChart,
    },
    {
      title: t("navigation.profile"),
      path: "/profile",
      icon: User,
    },
    {
      title: t("navigation.help"),
      path: "/help",
      icon: HelpCircle,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b py-4">
        <div className="px-4 flex items-center justify-between">
          <div className="text-healthcare-primary font-bold text-xl">
            {t("app.name")}
          </div>
          <div className="flex items-center">
            <LanguageSwitcher />
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={item.path} className={cn("flex items-center gap-2")}>
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        {user && (
          <button 
            onClick={signOut} 
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="size-5" />
            <span>{t("navigation.logout")}</span>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
