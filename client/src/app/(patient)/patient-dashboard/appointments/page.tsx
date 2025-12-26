"use client";

import { useAuthStore } from "@/store/authStore";
import { 
    CalendarCheck, 
    MapPin, 
    Activity, 
    FileText, 
    Stethoscope,
    Clock,
    X,
    Filter,
    Calendar,
    ArrowUpDown
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { patientService } from "@/lib/services/patientService";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface Appointment {
    _id: string;
    doctorId: {
        _id: string;
        userId: {
            name: string;
        }
    };
    clinicId: {
        name: string;
        address: string;
    };
    date: string;
    slotTime: string;
    tokenNumber: number;
    status: string;
    type: string;
}

export default function PatientAppointments() {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await patientService.getMyAppointments(filterStatus !== 'all' ? filterStatus : undefined);
            if (data.success) {
                setAppointments(data.appointments);
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [filterStatus]);


    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await patientService.cancelAppointment(id);
            toast.success("Appointment cancelled");
            fetchAppointments(); // Refresh
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to cancel");
        }
    };

    return (
        <div className="flex flex-col gap-6 p-2 md:p-6 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                        My Appointments
                    </h1>
                    <p className="text-muted-foreground font-body">
                        View and manage your consultation history.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="booked">Upcoming</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => fetchAppointments()} variant="outline" size="icon">
                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                   [1,2,3,4].map(i => <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-xl"></div>)
                ) : appointments.length > 0 ? (
                    appointments.map((appt, i) => (
                        <motion.div 
                            key={appt._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-all duration-300 border-l-4" style={{
                                borderLeftColor: 
                                    appt.status === 'completed' ? '#10b981' : 
                                    appt.status === 'cancelled' ? '#ef4444' : 
                                    appt.status === 'booked' ? '#3b82f6' : 
                                    '#f59e0b'
                            }}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge className="capitalize" variant={
                                            appt.status === 'completed' ? 'default' : 
                                            appt.status === 'cancelled' ? 'destructive' : 
                                            'secondary'
                                        }>
                                            {appt.status}
                                        </Badge>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground font-mono">Token</p>
                                            <p className="text-lg font-bold">#{appt.tokenNumber}</p>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg">Dr. {appt.doctorId.userId.name}</CardTitle>
                                    <CardDescription>{appt.clinicId.name}</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-3 mt-2">
                                        <div className="flex items-center text-sm gap-3 p-2 rounded-lg bg-muted/30">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{format(new Date(appt.date), 'EEEE, MMMM do yyyy')}</span>
                                        </div>
                                        <div className="flex items-center text-sm gap-3 p-2 rounded-lg bg-muted/30">
                                            <Clock className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{appt.slotTime}</span>
                                        </div>
                                        <div className="flex items-center text-sm gap-3 p-2 rounded-lg bg-muted/30">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span className="truncate">{appt.clinicId.address}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4">
                                     {appt.status === 'booked' && (
                                        <Button 
                                            variant="destructive" 
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-700 border border-red-200"
                                            onClick={() => handleCancel(appt._id)}
                                        >
                                            Cancel Appointment
                                        </Button>
                                    )}
                                    {appt.status === 'completed' && (
                                        <Button variant="outline" className="w-full">
                                            View Subscription / Prescription
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed">
                        <CalendarCheck className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No appointments found.</p>
                        <p className="text-sm">Book a new appointment to get started.</p>
                        <Button className="mt-4" onClick={() => window.location.href='/doctors'}>Book Now</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
