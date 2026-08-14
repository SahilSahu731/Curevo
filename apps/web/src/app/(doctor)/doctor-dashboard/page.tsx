"use client";

import { useAuthStore } from "@/store/authStore";
import { 
    Users, 
    Clock, 
    Calendar, 
    TrendingUp, 
    MoreHorizontal, 
    ArrowRight,
    Activity,
    UserPlus,
    Play,
    CheckCircle,
    User,
    UserX,
    Video
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { doctorService } from "@/lib/services/doctorService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useSocketStore } from "@/store/socketStore";

interface Patient {
    _id: string;
    name: string;
    profileImage?: string;
    age?: number;
    gender?: string;
}

interface Appointment {
    _id: string;
    doctorId?: {
        _id: string;
    };
    patientId: Patient;
    date: string;
    slotTime: string;
    tokenNumber: number;
    status: string;
    consultationType?: "in-person" | "video";
    symptoms?: string;
    telehealthUrl?: string;
}

export default function DoctorDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        total: 0,
        waiting: 0,
        completed: 0
    });
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [currentPatient, setCurrentPatient] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingQueue, setProcessingQueue] = useState(false);
    const [consultationNotes, setConsultationNotes] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [prescriptionText, setPrescriptionText] = useState("");
    const [treatmentPlan, setTreatmentPlan] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const { socket, connect } = useSocketStore();

    const fetchTodayAppointments = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString();
            const data = await doctorService.getDoctorAppointments({ date: today });
            
            if (data.success) {
                const appts: Appointment[] = data.data;
                setAppointments(appts);
                
                // Calculate stats
                setStats({
                    total: appts.length,
                    waiting: appts.filter(a => a.status === 'booked' || a.status === 'waiting').length,
                    completed: appts.filter(a => a.status === 'completed').length
                });

                // Find current in-progress
                const active = appts.find(a => a.status === 'in-progress');
                setCurrentPatient(active || null);
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayAppointments();
    }, []);

    useEffect(() => {
        connect();
    }, [connect]);

    useEffect(() => {
        if (!socket) return;

        const activeDoctorId = appointments[0]?.doctorId?._id;
        if (activeDoctorId) {
            socket.emit("join-doctor", { doctorId: activeDoctorId });
        }

        const refresh = () => fetchTodayAppointments();
        socket.on("queue_updated", refresh);
        socket.on("queue-update", refresh);

        return () => {
            socket.off("queue_updated", refresh);
            socket.off("queue-update", refresh);
        };
    }, [socket, appointments]);

    const handleCallNext = async () => {
        try {
            setProcessingQueue(true);
            const data = await doctorService.callNextPatient();
            if (data.success) {
                if (data.patient) {
                    toast.success(`Now serving Token #${data.patient.tokenNumber}`);
                    await fetchTodayAppointments(); // Refresh to update lists and current patient
                } else {
                    toast("Queue is empty.", { icon: 'ℹ️' });
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to call next patient");
        } finally {
            setProcessingQueue(false);
        }
    };

    const handleComplete = async () => {
        if (!currentPatient) return;
        try {
            setProcessingQueue(true);
            await doctorService.completeConsultation(currentPatient._id, {
                notes: consultationNotes,
                diagnosis,
                prescriptionText,
                treatmentPlan,
                followUpDate: followUpDate || undefined,
            });
            toast.success("Consultation completed");
            setConsultationNotes("");
            setDiagnosis("");
            setPrescriptionText("");
            setTreatmentPlan("");
            setFollowUpDate("");
            setCurrentPatient(null);
            await fetchTodayAppointments();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to complete consultation");
        } finally {
            setProcessingQueue(false);
        }
    };

    const handleMarkAbsent = async (appointmentId: string) => {
        try {
            setProcessingQueue(true);
            await doctorService.markPatientAbsent(appointmentId);
            toast.success("Patient marked absent");
            if (currentPatient?._id === appointmentId) {
                setCurrentPatient(null);
            }
            await fetchTodayAppointments();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to mark absent");
        } finally {
            setProcessingQueue(false);
        }
    };

    const waitingList = appointments.filter(a => ['booked', 'waiting'].includes(a.status));

    return (
        <div className="flex flex-col gap-6 p-2 md:p-6 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                        Doctor Dashboard
                    </h1>
                    <p className="text-muted-foreground font-body">
                        Welcome back, Dr. {user?.name?.split(' ')[0]}.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchTodayAppointments} disabled={loading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Waiting</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.waiting}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                
                {/* Current Patient / Queue Control */}
                <Card className="col-span-4 lg:col-span-4 border-none shadow-lg shadow-primary/5 dark:bg-card/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Current Session</span>
                            {currentPatient && <Badge className="bg-emerald-500 animate-pulse">In Progress</Badge>}
                        </CardTitle>
                        <CardDescription>Manage the ongoing consultation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentPatient ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                     <Avatar className="h-16 w-16 border-2 border-background">
                                        <AvatarImage src={currentPatient.patientId.profileImage} />
                                        <AvatarFallback><User /></AvatarFallback>
                                     </Avatar>
                                     <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl">{currentPatient.patientId.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {currentPatient.patientId.gender} • Age: {currentPatient.patientId.age || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-2xl font-bold text-primary">Token #{currentPatient.tokenNumber}</p>
                                                <p className="text-xs text-muted-foreground">{currentPatient.slotTime}</p>
                                                {currentPatient.consultationType === "video" && (
                                                    <Badge variant="outline" className="mt-1">
                                                        <Video className="mr-1 h-3 w-3" /> Video
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                     </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                    <h4 className="text-sm font-semibold mb-1 text-blue-700 dark:text-blue-300">Reported Symptoms</h4>
                                    <p className="text-sm">{currentPatient.symptoms || "No symptoms provided."}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Diagnosis</label>
                                    <Textarea 
                                        placeholder="Primary diagnosis and clinical impression..." 
                                        className="h-24 resize-none"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Prescription</label>
                                    <Textarea 
                                        placeholder="One medicine per line: Medicine | Dosage | Frequency | Duration | Instructions" 
                                        className="h-28 resize-none"
                                        value={prescriptionText}
                                        onChange={(e) => setPrescriptionText(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Treatment Plan</label>
                                    <Textarea 
                                        placeholder="Lifestyle guidance, tests, referrals, or next steps..." 
                                        className="h-24 resize-none"
                                        value={treatmentPlan}
                                        onChange={(e) => setTreatmentPlan(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Consultation Notes (Private)</label>
                                        <Textarea 
                                            placeholder="Additional private remarks..." 
                                            className="h-24 resize-none"
                                            value={consultationNotes}
                                            onChange={(e) => setConsultationNotes(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Follow-up Date</label>
                                        <input
                                            type="date"
                                            value={followUpDate}
                                            onChange={(e) => setFollowUpDate(e.target.value)}
                                            className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                                <Activity className="h-12 w-12 mb-4 opacity-20" />
                                <p>No patient is currently in the consulting room.</p>
                                <p className="text-sm">Call the next patient to begin.</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 border-t pt-4">
                        {currentPatient ? (
                            <>
                                {currentPatient.consultationType === "video" && currentPatient.telehealthUrl && (
                                    <Button variant="outline" asChild className="w-full md:w-auto">
                                        <a href={currentPatient.telehealthUrl} target="_blank" rel="noreferrer">
                                            <Video className="h-4 w-4 mr-2" /> Open Video
                                        </a>
                                    </Button>
                                )}
                                <Button 
                                    variant="outline"
                                    className="w-full md:w-auto text-red-600 hover:text-red-700" 
                                    onClick={() => handleMarkAbsent(currentPatient._id)}
                                    disabled={processingQueue}
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Mark Absent
                                </Button>
                                <Button 
                                    className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto" 
                                    onClick={handleComplete}
                                    disabled={processingQueue}
                                >
                                    {processingQueue ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                    Complete Consultation
                                </Button>
                            </>
                        ) : (
                             <Button 
                                className="w-full md:w-auto" 
                                size="lg" 
                                onClick={handleCallNext}
                                disabled={processingQueue}
                            >
                                {processingQueue ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                Call Next Patient
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Queue List */}
                <Card className="col-span-3 lg:col-span-3 border-none shadow-sm dark:bg-card/50 flex flex-col h-[600px]">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Queue ({waitingList.length})</CardTitle>
                                <CardDescription>Patients waiting for you.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                        {loading ? (
                            <div className="space-y-4">
                                {[1,2,3].map(i => <div key={i} className="h-16 w-full bg-muted/50 rounded-lg animate-pulse"></div>)}
                            </div>
                        ) : waitingList.length > 0 ? (
                            <div className="space-y-4">
                                {waitingList.map((patient, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={patient._id} 
                                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-muted/10 hover:bg-muted transition-colors group cursor-pointer border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {patient.tokenNumber}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold leading-none">{patient.patientId.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    {patient.slotTime}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <Badge variant={patient.status === 'waiting' ? 'secondary' : 'outline'}>
                                                {patient.status}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-2 h-8 text-red-600 hover:text-red-700"
                                                onClick={() => handleMarkAbsent(patient._id)}
                                            >
                                                <UserX className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <p>Queue is empty.</p>
                             </div>
                        )}
                    </CardContent>
                     {/* Recently Completed (Mini List) */}
                     <div className="p-4 border-t bg-muted/20">
                         <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Recently Completed</h4>
                         <div className="flex gap-2 overflow-x-auto pb-2">
                             {appointments.filter(a => a.status === 'completed').slice(-5).map(a => (
                                 <div key={a._id} className="min-w-[80px] p-2 bg-background rounded-lg border text-center opacity-75">
                                     <span className="block font-bold text-xs">#{a.tokenNumber}</span>
                                     <span className="block text-[10px] truncate">{a.patientId.name.split(' ')[0]}</span>
                                 </div>
                             ))}
                             {appointments.filter(a => a.status === 'completed').length === 0 && (
                                 <span className="text-xs text-muted-foreground italic">None today</span>
                             )}
                         </div>
                     </div>
                </Card>
            </div>
        </div>
    );
}
