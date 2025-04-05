import React from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div>
          Dashboard
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;