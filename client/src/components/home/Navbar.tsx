"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/doctors", label: "Doctors" },
        { href: "/clinics", label: "Clinics" },
        { href: "/about", label: "About" },
    ];

    return (
        <motion.header 
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                scrolled ? "bg-background/80 backdrop-blur-md border-b border-border h-16 shadow-sm" : "bg-transparent h-24"
            }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container px-4 md:px-6 mx-auto h-full flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground group font-heading">
                    <div className="h-10 w-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
                        <HeartPulse className="h-6 w-6 text-white" />
                    </div>
                    <span className="tracking-tight text-xl">SmartQueue</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground font-body">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className="hover:text-primary transition-colors relative group">
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    
                    <div className="hidden sm:flex items-center gap-4">
                         {mounted && user ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="outline" className="border-border hover:bg-muted font-body">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button onClick={() => { logout(); window.location.reload(); }} variant="ghost" className="text-destructive hover:bg-destructive/10 font-body">
                                    Log Out
                                </Button>
                            </>
                         ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="hover:bg-muted text-muted-foreground hover:text-foreground font-body">Log In</Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-primary text-primary-foreground hover:opacity-90 shadow-md font-body rounded-full px-6">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                         )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <nav className="flex flex-col gap-4 mt-8 font-heading">
                                    {navLinks.map(link => (
                                        <Link key={link.href} href={link.href} className="text-lg font-medium py-2 border-b border-border">
                                            {link.label}
                                        </Link>
                                    ))}
                                    <div className="flex flex-col gap-2 mt-4 font-body">
                                        {mounted && user ? (
                                            <>
                                                <Link href="/dashboard"><Button className="w-full">Dashboard</Button></Link>
                                                <Button onClick={() => { logout(); window.location.reload(); }} variant="destructive" className="w-full">Log Out</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/login"><Button variant="outline" className="w-full">Log In</Button></Link>
                                                <Link href="/register"><Button className="w-full bg-primary text-primary-foreground">Sign Up</Button></Link>
                                            </>
                                        )}
                                    </div>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
