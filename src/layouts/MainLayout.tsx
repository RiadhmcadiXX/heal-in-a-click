
import { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 pb-24 pt-4 px-6">{children}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
