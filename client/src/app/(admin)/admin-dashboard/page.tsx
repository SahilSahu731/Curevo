"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    Users, 
    Building2, 
    Stethoscope, 
    Activity,
    AlertCircle,
    CheckCircle2,
    MessageSquare
} from "lucide-react";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/lib/services/adminService";
import { toast } from "sonner";

export default function AdminDashboard() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["admin-dashboard"],
        queryFn: adminService.getDashboardStats,
    });

    const reviewMutation = useMutation({
        mutationFn: ({ doctorId, status }: { doctorId: string; status: "approved" | "rejected" }) =>
            adminService.reviewDoctorVerification(doctorId, { status }),
        onSuccess: () => {
            toast.success("Verification updated");
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["admin-doctor-verifications"] });
        },
        onError: () => toast.error("Failed to update verification"),
    });

    const statsData = data?.stats || {};
    const pendingDoctors = data?.pendingDoctors || [];
    const recentFeedback = data?.recentFeedback || [];

    const stats = [
        { title: "Patients", value: statsData.patients || 0, icon: Users, sub: "registered patients", color: "text-blue-500" },
        { title: "Active Clinics", value: statsData.clinics || 0, icon: Building2, sub: "clinics in network", color: "text-emerald-500" },
        { title: "Verified Doctors", value: statsData.verifiedDoctors || 0, icon: Stethoscope, sub: `${statsData.pendingVerifications || 0} pending`, color: "text-purple-500" },
        { title: "Appointments", value: statsData.totalAppointments || 0, icon: Activity, sub: `${statsData.todayAppointments || 0} today`, color: "text-amber-500" },
    ];

    return (
        <div className="flex flex-col gap-8 p-4">
             {/* Welcome Section */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
                    <p className="text-muted-foreground">System overview and management controls.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Open Feedback: {statsData.openFeedback || 0}</Button>
                    <Button>Generate Report</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading ? "..." : stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Activity & Verification */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                         <CardTitle>Recent Feedback & Complaints</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentFeedback.length ? recentFeedback.map((item: any) => (
                                <div key={item._id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">{item.subject}</p>
                                            <p className="text-xs text-muted-foreground">{item.userId?.name} • {item.category}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="capitalize">{item.status}</Badge>
                                </div>
                            )) : <div className="py-8 text-center text-sm text-muted-foreground">No feedback yet.</div>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Verifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {pendingDoctors.length ? pendingDoctors.map((doctor: any) => (
                            <div key={doctor._id} className="space-y-3 rounded-lg border p-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <div>
                                        <p className="text-sm font-bold">{doctor.userId?.name}</p>
                                        <p className="text-xs text-muted-foreground">{doctor.verification?.licenseNumber}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ doctorId: doctor._id, status: "approved" })}>
                                        <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ doctorId: doctor._id, status: "rejected" })}>
                                        Reject
                                    </Button>
                                </div>
                            </div>
                         )) : <div className="py-8 text-center text-sm text-muted-foreground">No pending doctors.</div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
