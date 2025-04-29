
import { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarRail, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

// This component will show a menu button when the sidebar is collapsed
const CollapsedSidebarButton = () => {
  const { state, toggleSidebar } = useSidebar();
  
  if (state !== "collapsed") return null;
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleSidebar}
      className="fixed left-4 top-4 z-50 md:hidden"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open Sidebar</span>
    </Button>
  );
};

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        {/* Add the rail which provides a handle to resize the sidebar */}
        <SidebarRail />
        <div className="flex-1 flex flex-col min-h-screen">
          <CollapsedSidebarButton />
          <main className="flex-1 pb-24 pt-4 px-6">{children}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
