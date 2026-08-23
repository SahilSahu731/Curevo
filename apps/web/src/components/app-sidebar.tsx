"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookHeart,
  BookOpenText,
  CircleUserRound,
  Focus,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquareText,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
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
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";

const memberItems = [
  { title: "Today", url: "/dashboard", icon: LayoutDashboard },
  { title: "Focus space", url: "/dashboard/focus", icon: Focus },
  { title: "Routines", url: "/dashboard/routines", icon: ListChecks },
  { title: "Reflections", url: "/dashboard/reflections", icon: BookHeart },
  { title: "Progress", url: "/dashboard/progress", icon: BarChart3 },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Feedback", url: "/dashboard/feedback", icon: MessageSquareText },
];

const adminItems = [
  { title: "Overview", url: "/admin-dashboard", icon: LayoutDashboard },
  { title: "Content", url: "/admin-dashboard/content", icon: BookOpenText },
  { title: "Analytics", url: "/admin-dashboard/analytics", icon: BarChart3 },
  { title: "Members", url: "/admin-dashboard/users", icon: Users },
  { title: "Feedback", url: "/admin-dashboard/feedback", icon: MessageSquareText },
  { title: "Notifications", url: "/admin-dashboard/notifications", icon: Bell },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const items = user?.role === "admin" ? adminItems : memberItems;
  const isActive = (url: string) => pathname === url || (url !== "/dashboard" && url !== "/admin-dashboard" && pathname.startsWith(`${url}/`));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-2 py-3">
        <div className="flex items-center gap-2 px-2">
          <BrandLogo compact />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-semibold text-muted-foreground">{user?.role === "admin" ? "Operations" : "Your focus space"}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{user?.role === "admin" ? "Manage" : "Practice"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link href={item.url}><item.icon /><span>{item.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role !== "admin" && (
          <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
            <div className="mx-2 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <Sparkles className="size-4 text-primary" />
              <p className="mt-3 text-sm font-semibold">A missed day is not a broken streak.</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Return with the smallest step that fits today.</p>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/profile"} tooltip="Profile and settings">
              <Link href="/profile"><CircleUserRound /><span>Profile</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings"><Link href="/profile"><Settings /><span>Settings</span></Link></SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={async () => { await logout(); router.push("/login"); }}
            >
              <LogOut /><span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
