"use client";

import { useAuthStore } from "@/store/authStore";
import { 
    CalendarCheck, 
    MapPin, 
    Activity, 
    FileText, 
    ArrowRight,
    Search,
    Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function PatientDashboard() {
    const { user } = useAuthStore();

    // Mock upcoming appointments
    const upcoming = [
        { id: 1, doctor: "Dr. Sarah Wilson", specialty: "Cardiologist", date: "Today, 2:30 PM", location: "Central Clinic, Room 302" },
    ];

    return (
        <div className="flex flex-col gap-6 p-2 md:p-6 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                    Good Morning, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-muted-foreground font-body">
                    Manage your health and upcoming appointments.
                </p>
                
                {/* Search Bar for Quick Booking */}
                <div className="mt-4 relative max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search for doctors, clinics, or specialties..." 
                        className="pl-10 h-12 text-base rounded-full shadow-sm border-muted-foreground/20 focus-visible:ring-primary"
                    />
                    <Button className="absolute right-1 top-1 top-1 bottom-1 rounded-full px-6">
                        Search
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                
                {/* Active Appointment Card */}
                <Card className="col-span-1 md:col-span-2 bg-gradient-brand text-white border-none shadow-lg shadow-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <CalendarCheck className="h-5 w-5" /> Upcoming Appointment
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                            You have an appointment coming up soon.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {upcoming.length > 0 ? (
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                <div className="flex items-center gap-4">
                                     <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                        <Stethoscope className="h-6 w-6 text-white" />
                                     </div>
                                     <div>
                                        <h3 className="font-bold text-lg">{upcoming[0].doctor}</h3>
                                        <p className="text-sm text-blue-100">{upcoming[0].specialty}</p>
                                     </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-xl">{upcoming[0].date}</p>
                                    <p className="text-sm text-blue-100 flex items-center justify-end gap-1">
                                        <MapPin className="h-3 w-3" /> {upcoming[0].location}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-blue-100">No upcoming appointments.</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" className="w-full md:w-auto font-bold text-primary">
                            View Ticket
                        </Button>
                    </CardFooter>
                </Card>

                {/* Quick Actions (Vitals/Queue) */}
                <div className="grid gap-4">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                             <CardTitle className="text-sm font-medium">My Queue Status</CardTitle>
                             <Activity className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">Not In Queue</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Join a queue to see live status.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                             <CardTitle className="text-sm font-medium">Recent Records</CardTitle>
                             <FileText className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3 New</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Lab results from last week.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Popular Categories */}
            <div>
                <h2 className="text-xl font-bold mb-4">Find Care by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {['General', 'Dentist', 'Cardiology', 'Neurology', 'Orthopedic', 'Pediatric'].map((cat, i) => (
                        <motion.div 
                            key={cat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-card hover:bg-muted/50 border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                        >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                i % 2 === 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                                <Stethoscope className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-sm">{cat}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
