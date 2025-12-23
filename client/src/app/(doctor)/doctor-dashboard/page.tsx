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
    DollarSign,
    UserPlus
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
import { 
    Area, 
    AreaChart, 
    ResponsiveContainer, 
    Tooltip, 
    XAxis, 
    YAxis,
    CartesianGrid,
    BarChart,
    Bar
} from "recharts";
import { motion } from "framer-motion";

// Mock Data for Charts
const weeklyStats = [
    { name: "Mon", visitors: 40, revenue: 2400 },
    { name: "Tue", visitors: 30, revenue: 1398 },
    { name: "Wed", visitors: 50, revenue: 3800 },
    { name: "Thu", visitors: 28, revenue: 1908 },
    { name: "Fri", visitors: 65, revenue: 4800 },
    { name: "Sat", visitors: 45, revenue: 3200 },
    { name: "Sun", visitors: 20, revenue: 1100 },
];

const queueData = [
  { id: 1, name: "Alice Smith", time: "10:30 AM", type: "Check-up", status: "In Progress", image: "" },
  { id: 2, name: "Bob Johnson", time: "10:45 AM", type: "Consultation", status: "Waiting", image: "" },
  { id: 3, name: "Charlie Brown", time: "11:00 AM", type: "Follow-up", status: "Waiting", image: "" },
  { id: 4, name: "David Wilson", time: "11:15 AM", type: "Emergency", status: "Waiting", image: "" },
];

export default function DoctorDashboard() {
    const { user } = useAuthStore();

    return (
        <div className="flex flex-col gap-6 p-2 md:p-6 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground font-body">
                        Welcome back, Dr. {user?.name?.split(' ')[0] || 'Doctor'}. Here's what's happening today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10">Export Report</Button>
                    <Button className="h-10 bg-primary hover:bg-primary/90 gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add Patient
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,284</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-500 font-bold flex items-center inline-flex">
                                <TrendingUp className="h-3 w-3 mr-1" /> +12%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            4 remaining
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14 min</div>
                        <p className="text-xs text-muted-foreground">
                           <span className="text-red-500 font-bold inline-flex items-center">
                                +2 min
                           </span> 
                           from yesterday
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue (Wk)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,450</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-500 font-bold inline-flex items-center">
                                +8%
                            </span>
                            from last week
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart Section */}
                <Card className="col-span-4 lg:col-span-4 hover:shadow-md transition-shadow border-none shadow-sm dark:bg-card/50">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>
                            Weekly patient visits and revenue analytics.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyStats}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                    />
                                    <YAxis 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={(value) => `$${value}`} 
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="oklch(var(--primary))" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Live Queue Section */}
                <Card className="col-span-3 lg:col-span-3 hover:shadow-md transition-shadow border-none shadow-sm dark:bg-card/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Current Queue</CardTitle>
                                <CardDescription>
                                    You have {queueData.length} patients waiting.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Live</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {queueData.map((patient, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={patient.id} 
                                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-muted/10 hover:bg-muted transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border-2 border-background">
                                                <AvatarImage src={patient.image} />
                                                <AvatarFallback>{patient.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${patient.status === 'In Progress' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold leading-none">{patient.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <MoreHorizontal className="h-3 w-3" /> {patient.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold font-mono">{patient.time}</p>
                                        <Badge variant={patient.status === 'In Progress' ? 'default' : 'secondary'} className="mt-1 text-[10px] h-5">
                                            {patient.status}
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-primary">
                            View Full Queue <ArrowRight className="ml-2 h-4 w-4" />
                         </Button>
                    </CardFooter>
                </Card>
            </div>
            
            {/* Recent Appointments Table (Simplified) */}
             <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>
                        A history of your consulting sessions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     {/* We can reuse queue data or a different set for history */}
                     <div className="text-sm text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        No recent history available for this demo.
                     </div>
                </CardContent>
             </Card>
        </div>
    );
}
