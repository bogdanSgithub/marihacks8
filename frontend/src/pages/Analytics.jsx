import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { EmergencySystem } from '../components/EmergencySystem';

function Analytics() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        {/* <SiteHeader /> */}
        <div>

          <EmergencySystem />

        </div>
      </SidebarInset>
      {/* <EmergencySystem /> */}
    </SidebarProvider>
  )
}


export default Analytics