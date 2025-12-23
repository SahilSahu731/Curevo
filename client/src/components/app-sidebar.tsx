"use client"

import * as React from "react"
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  User,
  Stethoscope,
  Users,
  Activity,
  Clock,
  LogOut,
  Building2,
  LayoutDashboard
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/authStore"
import { usePathname, useRouter } from "next/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()

  const doctorItems = [
    { title: "Dashboard", url: "/doctor-dashboard", icon: Home },
    { title: "Queue Management", url: "/doctor-dashboard/queue", icon: Clock },
    { title: "Patients", url: "/doctor-dashboard/patients", icon: Users },
    { title: "Appointments", url: "/doctor-dashboard/appointments", icon: Calendar },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Settings", url: "/doctor-dashboard/settings", icon: Settings },
  ]

  const patientItems = [
    { title: "Home", url: "/patient-dashboard", icon: Home },
    { title: "My Appointments", url: "/patient-dashboard/appointments", icon: Calendar },
    { title: "Find Doctors", url: "/search", icon: Search },
    { title: "Medical Records", url: "/patient-dashboard/records", icon: Activity },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Settings", url: "/patient-dashboard/settings", icon: Settings },
  ]

  const adminItems = [
    { title: "Dashboard", url: "/admin-dashboard", icon: LayoutDashboard },
    { title: "Clinics", url: "/admin-dashboard/clinics", icon: Building2 },
    { title: "Doctors", url: "/admin-dashboard/doctors", icon: Stethoscope },
    { title: "Users", url: "/admin-dashboard/users", icon: Users },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Settings", url: "/admin-dashboard/settings", icon: Settings },
  ]
  
  let items = patientItems;
  if (user?.role === 'doctor') items = doctorItems;
  else if (user?.role === 'admin') items = adminItems;

  const getPortalName = () => {
      switch(user?.role) {
          case 'doctor': return 'Doctor Portal';
          case 'admin': return 'Admin Console';
          default: return 'Patient Portal';
      }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white">
            <Activity className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-foreground">SmartQueue</span>
            <span className="text-xs text-muted-foreground">{getPortalName()}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={() => {
                        logout();
                        router.push('/login');
                    }}
                    tooltip="Log out"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <LogOut />
                    <span>Log out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
