"use client";

import { useAuthStore } from "@/store/authStore";
import { 
    Calendar as CalendarIcon, 
    Search,
    Filter,
    Clock,
    User,
    CheckCircle,
    XCircle,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { doctorService } from "@/lib/services/doctorService";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Appointment {
    _id: string;
    patientId: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
        phone?: string;
        gender?: string;
        age?: number;
    };
    date: string;
    slotTime: string;
    tokenNumber: number;
    status: string;
    type: string;
    symptoms?: string;
}

export default function DoctorAppointments() {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await doctorService.getDoctorAppointments({ 
                date: selectedDate,
                status: statusFilter !== 'all' ? statusFilter : undefined
            });
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch schedule", error);
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate, statusFilter]);

    // Group by status for quick stats
    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => ['booked', 'waiting'].includes(a.status)).length,
        completed: appointments.filter(a => a.status === 'completed').length
    };

    return (
        <div className="flex flex-col gap-6 p-2 md:p-6 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                            Schedule & Appointments
                        </h1>
                        <p className="text-muted-foreground font-body">
                            Manage your daily patient list.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-card border p-1 rounded-lg shadow-sm">
                        <Input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-none shadow-none focus-visible:ring-0 w-auto"
                        />
                         <Button variant="ghost" size="icon" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 md:w-1/2 lg:w-1/3">
                    <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                        <p className="text-xs text-primary font-bold uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-bold text-primary">{stats.total}</p>
                    </div>
                    <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    </div>
                    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Done</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-muted/30">
                <CardHeader className="bg-card rounded-t-xl border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <Button 
                                variant={statusFilter === 'all' ? 'default' : 'ghost'} 
                                size="sm" 
                                onClick={() => setStatusFilter('all')}
                                className="rounded-full"
                            >
                                All
                            </Button>
                            <Button 
                                variant={statusFilter === 'booked' ? 'default' : 'ghost'} 
                                size="sm" 
                                onClick={() => setStatusFilter('booked')}
                                className="rounded-full"
                            >
                                Upcoming
                            </Button>
                            <Button 
                                variant={statusFilter === 'completed' ? 'default' : 'ghost'} 
                                size="sm" 
                                onClick={() => setStatusFilter('completed')}
                                className="rounded-full"
                            >
                                Completed
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="bg-card min-h-[500px] rounded-b-xl">
                        {loading ? (
                             <div className="space-y-4 p-6">
                                {[1,2,3,4,5].map(i => <div key={i} className="h-16 w-full bg-muted/50 rounded-lg animate-pulse"></div>)}
                            </div>
                        ) : appointments.length > 0 ? (
                            <div className="divide-y">
                                {appointments.map((appt) => (
                                    <div key={appt._id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-primary/5 text-primary border border-primary/10">
                                                <span className="text-xs font-medium uppercase">Token</span>
                                                <span className="text-xl font-bold">{appt.tokenNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border">
                                                    <AvatarImage src={appt.patientId.profileImage} />
                                                    <AvatarFallback>{appt.patientId.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-bold text-foreground">{appt.patientId.name}</h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <span>{appt.patientId.gender}</span>
                                                        <span>•</span>
                                                        <span>{appt.patientId.age ? `${appt.patientId.age} yrs` : 'Age N/A'}</span>
                                                        <span>•</span>
                                                        <span className="text-primary">{appt.slotTime}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 md:w-1/3 justify-between md:justify-end">
                                             <div className="text-right mr-4 hidden md:block">
                                                 <p className="text-xs text-muted-foreground uppercase font-semibold">Symptoms</p>
                                                 <p className="text-sm truncate max-w-[150px]">{appt.symptoms || "None reported"}</p>
                                             </div>
                                             
                                             <Badge variant={
                                                appt.status === 'completed' ? 'default' : 
                                                appt.status === 'cancelled' ? 'destructive' : 
                                                appt.status === 'in-progress' ? 'default' :
                                                'secondary'
                                            } className={appt.status === 'in-progress' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                            {appt.status}
                                            </Badge>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>View Patient History</DropdownMenuItem>
                                                    <DropdownMenuItem>Add Note</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-500">Cancel Appointment</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <CalendarIcon className="h-16 w-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">No appointments for this date.</p>
                                <p className="text-sm">Try selecting a different date.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
