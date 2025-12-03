"use client";

import Link from "next/link";
import {
  Users,
  Briefcase,
  Calendar,
  BarChart,
  LayoutDashboard,
  Settings,
  Hospital,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Doctors",
    href: "/admin/doctors",
    icon: Briefcase,
  },
  {
    name: "Appointments",
    href: "/admin/appointments",
    icon: Calendar,
  },
  {
    name: "Clinics",
    href: "/admin/clinics",
    icon: Hospital,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart,
  },
  {
    name: "Manage",
    href: "/admin/manage",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden min-h-screen md:flex flex-col w-72 bg-gray-900 text-white">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors",
                pathname === link.href ? "bg-gray-800" : ""
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
