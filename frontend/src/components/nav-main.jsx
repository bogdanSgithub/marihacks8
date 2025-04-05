import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function NavMain({ items }) {
  const location = useLocation();
  
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.url;
        
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton 
              asChild 
              active={isActive}
            >
              <Link to={item.url}>
                {Icon && <Icon className="h-5 w-5" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}