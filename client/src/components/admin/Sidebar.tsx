"use client";

import Link from "next/link";
import {
  Users,
  Stethoscope,
  Calendar,
  BarChart,
  LayoutDashboard,
  Settings,
  Building2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  {
    name: "Dashboard",
    href: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin-dashboard/users",
    icon: Users,
  },
  {
    name: "Doctors",
    href: "/admin-dashboard/doctors",
    icon: Stethoscope,
  },
  {
    name: "Appointments",
    href: "/admin-dashboard/appointments",
    icon: Calendar,
  },
  {
    name: "Clinics",
    href: "/admin-dashboard/clinics",
    icon: Building2,
  },
  {
    name: "Analytics",
    href: "/admin-dashboard/analytics",
    icon: BarChart,
  },
  {
    name: "Settings",
    href: "/admin-dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden min-h-screen md:flex flex-col w-72 bg-zinc-950 text-white border-r border-zinc-800">
      <div className="flex items-center justify-center h-20 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center p-3 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white",
                pathname === link.href ? "bg-zinc-900 text-emerald-400" : ""
              )}
            >
              <link.icon className="w-5 h-5 mr-3" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
