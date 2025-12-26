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
    CheckCircle
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

export default function PatientDashboard() {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await patientService.getMyAppointments();
            if (data.success) {
                setAppointments(data.appointments);
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCheckIn = async (id: string) => {
        try {
            await patientService.checkIn(id);
            toast.success("Checked in successfully!");
            fetchAppointments(); // Refresh
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to check in");
        }
    };

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

    const upcomingAppointments = appointments.filter(a => 
        ['booked', 'waiting'].includes(a.status) && new Date(a.date) >= new Date(new Date().setHours(0,0,0,0))
    );

    const nextAppointment = upcomingAppointments[0];

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
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                
                {/* Active/Next Appointment Card */}
                <Card className="col-span-1 md:col-span-2 bg-gradient-brand text-white border-none shadow-lg shadow-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white z-10">
                            <CalendarCheck className="h-5 w-5" /> Next Appointment
                        </CardTitle>
                        <CardDescription className="text-blue-100 z-10">
                            {nextAppointment ? "Your next scheduled visit." : "No upcoming appointments scheduled."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        ) : nextAppointment ? (
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                <div className="flex items-center gap-4">
                                     <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                        <Stethoscope className="h-6 w-6 text-white" />
                                     </div>
                                     <div>
                                        <h3 className="font-bold text-lg">Dr. {nextAppointment.doctorId.userId.name}</h3>
                                        <p className="text-sm text-blue-100">{nextAppointment.clinicId.name}</p>
                                        <Badge variant="outline" className="mt-1 border-blue-200 text-blue-100">
                                            Token #{nextAppointment.tokenNumber}
                                        </Badge>
                                     </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-xl">
                                        {format(new Date(nextAppointment.date), 'MMM dd')} • {nextAppointment.slotTime}
                                    </p>
                                    <p className="text-sm text-blue-100 flex items-center justify-end gap-1 mt-1">
                                        <MapPin className="h-3 w-3" /> {nextAppointment.clinicId.address}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-blue-100">
                                <p>You have no active appointments.</p>
                                <Button variant="secondary" className="mt-4" onClick={() => window.location.href='/doctors'}>
                                    Book Now
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    {nextAppointment && (
                        <CardFooter className="gap-2 z-10 relative">
                             {/* Check-in logic: Only if today */}
                             {new Date(nextAppointment.date).toDateString() === new Date().toDateString() && nextAppointment.status === 'booked' && (
                                <Button variant="secondary" className="w-full md:w-auto font-bold text-primary" onClick={() => handleCheckIn(nextAppointment._id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Check In
                                </Button>
                             )}
                             <Button 
                                variant="destructive" 
                                className="w-full md:w-auto bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/20"
                                onClick={() => handleCancel(nextAppointment._id)}
                            >
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Status/Process Section (Using mock for now or static) */}
                <div className="grid gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {nextAppointment?.status === 'waiting' ? (
                                <>
                                    <div className="text-2xl font-bold text-emerald-500 animate-pulse">You are checked in!</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Please wait for your turn. Token #{nextAppointment.tokenNumber}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-muted-foreground">Not in Queue</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Check in on the day of appointment.
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* All Appointments List */}
            <div>
                <h2 className="text-xl font-bold mb-4">Your Appointments</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                       [1,2,3].map(i => <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-xl"></div>)
                    ) : appointments.length > 0 ? (
                        appointments.map((appt) => (
                            <motion.div 
                                key={appt._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full ${
                                    appt.status === 'completed' ? 'bg-emerald-500' : 
                                    appt.status === 'cancelled' ? 'bg-red-500' : 
                                    'bg-blue-500'
                                }`}></div>
                                
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold">Dr. {appt.doctorId.userId.name}</h3>
                                        <p className="text-sm text-muted-foreground">{appt.clinicId.name}</p>
                                    </div>
                                    <Badge variant={
                                        appt.status === 'completed' ? 'default' : 
                                        appt.status === 'cancelled' ? 'destructive' : 
                                        'secondary'
                                    }>
                                        {appt.status}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center text-sm gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{format(new Date(appt.date), 'PPP')} at {appt.slotTime}</span>
                                    </div>
                                    <div className="flex items-center text-sm gap-2">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        <span>Token: #{appt.tokenNumber}</span>
                                    </div>
                                </div>

                                {appt.status === 'booked' && (
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleCancel(appt._id)}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center text-muted-foreground">
                            No appointment history found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
