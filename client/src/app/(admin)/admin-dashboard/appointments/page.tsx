"use client";

import { useAuthStore } from "@/store/authStore";
import { 
    Search,
    Filter,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Calendar
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react";
import { adminService } from "@/lib/services/adminService";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface AdminAppointment {
    _id: string;
    patientId: {
        _id: string;
        name: string;
        email: string;
    };
    doctorId: {
        _id: string;
        userId: {
            name: string;
        };
    };
    clinicId: {
        name: string;
    };
    date: string;
    slotTime: string;
    tokenNumber: number;
    status: string;
}

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllAppointments({
                page,
                limit: 10,
                status: statusFilter,
                date: dateFilter
            });
            
            if (data.success) {
                setAppointments(data.data);
                setTotalPages(data.totalPages);
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
    }, [page, statusFilter, dateFilter]);

    return (
        <div className="flex flex-col gap-6 p-2 md:p-6 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                        All Appointments
                    </h1>
                    <p className="text-muted-foreground font-body">
                        System-wide appointment oversight.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                         <div className="flex flex-1 gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by patient or doctor..."
                                    className="pl-8"
                                    disabled
                                />
                            </div>
                            <div className="w-[180px]">
                                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="booked">Booked</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="w-auto">
                                <Input 
                                    type="date" 
                                    value={dateFilter}
                                    onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                                    className="w-[160px]"
                                />
                             </div>
                         </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Token</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Clinic</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                     <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : appointments.length > 0 ? (
                                    appointments.map((appt) => (
                                        <TableRow key={appt._id}>
                                            <TableCell className="font-medium">#{appt.tokenNumber}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{appt.patientId?.name || "Deleted User"}</div>
                                                <div className="text-xs text-muted-foreground">{appt.patientId?.email}</div>
                                            </TableCell>
                                            <TableCell>{appt.doctorId?.userId?.name || "Dr. N/A"}</TableCell>
                                            <TableCell>{appt.clinicId?.name}</TableCell>
                                            <TableCell>
                                                <div>{format(new Date(appt.date), 'MMM dd, yyyy')}</div>
                                                <div className="text-xs text-muted-foreground">{appt.slotTime}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    appt.status === 'completed' ? 'default' : 
                                                    appt.status === 'cancelled' ? 'destructive' : 
                                                    'secondary'
                                                }>
                                                    {appt.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No appointments found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
