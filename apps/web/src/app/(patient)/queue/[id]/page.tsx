"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "@/lib/services/appointmentService";
import { useSocketStore } from "@/store/socketStore";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // verify shadcn progress
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function QueueTrackingPage() {
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const { socket, connect } = useSocketStore();

    const { data: appointmentData } = useQuery({
        queryKey: ['appointment', id],
        queryFn: () => appointmentService.getAppointment(id),
        enabled: !!id
    });

    const { data: queueStats, isLoading, error } = useQuery({
        queryKey: ['queue-position', id],
        queryFn: () => appointmentService.getQueuePosition(id),
        refetchInterval: 10000, // Backup polling
    });

    useEffect(() => {
        connect();
        if (socket && id) {
            socket.emit('join-queue', { appointmentId: id });
            
            const refreshQueue = () => {
                queryClient.invalidateQueries({ queryKey: ['queue-position', id] });
                queryClient.invalidateQueries({ queryKey: ['appointment', id] });
            };

            const patientCalled = () => {
                toast.success("It's your turn. Please proceed to the doctor's room.", { duration: 10000 });
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Curevo queue update", {
                        body: "It's your turn. Please proceed to the doctor's room.",
                    });
                }
                refreshQueue();
            };

            socket.on('queue-update', refreshQueue);
            socket.on('queue_updated', refreshQueue);
            socket.on('your-turn', patientCalled);
            socket.on('patient_called', patientCalled);

            return () => {
                socket.off('queue-update', refreshQueue);
                socket.off('queue_updated', refreshQueue);
                socket.off('your-turn', patientCalled);
                socket.off('patient_called', patientCalled);
            }
        }
    }, [socket, connect, id, queryClient]);

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
    
    // Handle case where appointment is not in queue (e.g. booked but not checked in, or completed)
    if (error || !queueStats?.success) {
        // It might be because it's not 'waiting' or 'in-progress'.
        // Or it's 'booked' (not checked in).
        // I should probably handle this UI state.
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
                 <Card className="max-w-md w-full text-center p-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Queue Status Unavailable</h2>
                    <p className="mb-6 text-muted-foreground">
                        This appointment is mostly likely not in the active queue check-in yet or has been completed.
                    </p>
                    <a href="/patient-dashboard" className="text-primary hover:underline">Back to Dashboard</a>
                </Card>
            </div>
        );
    }
    
    // Status logic
    const { position, waitTime, patientsAhead } = queueStats;
    const appointment = appointmentData?.data;

    // Visual Percentage (Arbitrary for "feeling" of progress, usually based on initial position vs current)
    // We don't have initial position easily.
    // We can map position: 1 = 90%, 5 = 50%, >10 = 10%.
    const progress = Math.max(5, 100 - (position * 10));

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
             <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Live Queue Tracker</h1>
                    <p className="text-muted-foreground">
                        {appointment?.doctorId?.userId?.name ? `Dr. ${appointment.doctorId.userId.name}` : "Real-time updates from the clinic"}
                    </p>
                </div>

                <Card className="border-none shadow-xl overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-2 w-full bg-muted">
                        <div className="h-full bg-blue-600 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                    <CardContent className="pt-8 pb-8 text-center space-y-6">
                         
                         {position === 1 ? (
                              <div className="space-y-4 animate-pulse">
                                  <div className="mx-auto bg-green-100 h-24 w-24 rounded-full flex items-center justify-center">
                                     <User className="h-12 w-12 text-green-600" />
                                  </div>
                                  <div>
                                      <h2 className="text-3xl font-bold text-green-700">You are Next!</h2>
                                      <p className="text-green-600">Please be ready to be called.</p>
                                  </div>
                              </div>
                         ) : (
                             <div className="space-y-4">
                                  <div className="mx-auto bg-blue-50 h-24 w-24 rounded-full flex items-center justify-center border-4 border-blue-100">
                                     <span className="text-4xl font-bold text-blue-600 text-center leading-none">
                                         {position}
                                         <span className="block text-xs font-normal text-blue-400 mt-1">POSITION</span>
                                     </span>
                                  </div>
                                  <div>
                                       <p className="font-medium text-muted-foreground">Patients Ahead</p>
                                       <p className="text-2xl font-bold text-foreground">{patientsAhead}</p>
                                  </div>
                             </div>
                         )}

                         <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="text-center">
                                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">EST. WAIT</p>
                                <div className="flex items-center justify-center gap-1 font-semibold text-foreground">
                                    <Clock className="h-4 w-4" />
                                    {waitTime} mins
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">STATUS</p>
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-950">
                                    Token #{appointment?.tokenNumber || "-"}
                                </Badge>
                            </div>
                         </div>
                    </CardContent>
                </Card>

                <div className="text-center">
                     <p className="text-xs text-muted-foreground">
                         We'll notify you when it's your turn. Please stay close to the clinic area.
                     </p>
                </div>
             </div>
        </div>
    );
}
