"use client";

import { useAuthStore } from "@/store/authStore";
import { 
    Users, 
    Building2, 
    Stethoscope, 
    Activity,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
    const { user } = useAuthStore();

    // Mock System Stats
    const stats = [
        { title: "Total Users", value: "2,543", icon: Users, change: "+12%", color: "text-blue-500" },
        { title: "Active Clinics", value: "45", icon: Building2, change: "+3", color: "text-emerald-500" },
        { title: "Verified Doctors", value: "128", icon: Stethoscope, change: "+5", color: "text-purple-500" },
        { title: "Total Appointments", value: "12,403", icon: Activity, change: "+8%", color: "text-amber-500" },
    ];

    const recentActions = [
        { user: "Dr. Smith", action: "Registered a new clinic", time: "2 hours ago", status: "pending" },
        { user: "Jane Doe", action: "Reported an issue", time: "4 hours ago", status: "resolved" },
        { user: "Clinic LifeCare", action: "Updated details", time: "5 hours ago", status: "approved" },
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
                    <Button variant="outline">System Logs</Button>
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
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className={stat.change.startsWith('+') ? "text-emerald-500" : "text-red-500"}>
                                    {stat.change}
                                </span> from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Activity & Verification */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                         <CardTitle>Recent System Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActions.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${item.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                        <div>
                                            <p className="text-sm font-medium">{item.user}</p>
                                            <p className="text-xs text-muted-foreground">{item.action}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Verifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center justify-between p-3 border rounded-lg">
                             <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <div>
                                    <p className="text-sm font-bold">Dr. Emily Stone</p>
                                    <p className="text-xs text-muted-foreground">License verification</p>
                                </div>
                             </div>
                             <Button size="sm" variant="outline">Review</Button>
                         </div>
                         <div className="flex items-center justify-between p-3 border rounded-lg">
                             <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <div>
                                    <p className="text-sm font-bold">City Care Clinic</p>
                                    <p className="text-xs text-muted-foreground">Registration</p>
                                </div>
                             </div>
                             <Button size="sm" variant="outline">Review</Button>
                         </div>
                         <Button variant="ghost" className="w-full text-xs">View All Pending</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
