"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
    HeartPulse, 
    Menu, 
    User, 
    LogOut, 
    LayoutDashboard, 
    Settings, 
    UserCircle 
} from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GlobalNavbar() {
    const { user, logout } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    }



    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    return (
        <header 
            className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 ${
                scrolled ? "h-16 shadow-md" : "h-20"
            }`}
        >
            <div className="container mx-auto px-4 h-full flex items-center justify-between max-w-[1600px]">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="h-10 w-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20"
                    >
                        <HeartPulse className="h-6 w-6 text-white fill-white/20" />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white font-heading leading-none">SmartQueue</span>
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 tracking-widest uppercase">Medical OS</span>
                    </div>
                </Link>

                {/* Categories (Desktop) - GFG Style */}
                <nav className="hidden lg:flex items-center gap-8">
                    {[
                        { label: "Doctors", href: "/doctors" },
                        { label: "Clinics", href: "#" },
                        { label: "Telehealth", href: "#" },
                        { label: "Lab Tests", href: "#" },
                        { label: "Medicines", href: "#" }
                    ].map(item => (
                        <Link key={item.label} href={item.href} className="relative group text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-body">
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    
                    <div className="hidden md:flex items-center gap-3">
                         {mounted && user ? (
                            <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-neutral-800">
                                            <Avatar className="h-9 w-9 border-2 border-green-500">
                                                <AvatarImage src={user.profileImage || ""} alt={user.name} />
                                                <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                                                    {user.name}
                                                </span>
                                                <span className="text-[10px] font-semibold text-gray-500 capitalize">
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 font-body">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                                            <UserCircle className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                         ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="font-bold text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400">Sign In</Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 shadow-lg shadow-green-600/20 rounded-full">
                                        Join Now
                                    </Button>
                                </Link>
                            </>
                         )}
                    </div>
                </div>
            </div>
        </header>
    );
}
