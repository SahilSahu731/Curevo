"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/services/userService";
import { Loader2, Calendar, Clock, MapPin, Stethoscope, Mail, Phone, User as UserIcon, Shield } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

// --- User Detail Dialog (View Appointments) ---

export function UserDetailDialog({ user, open, onOpenChange }: { user: any, open: boolean, onOpenChange: (open: boolean) => void }) {
    const { data: appointmentsData, isLoading } = useQuery({
        queryKey: ['admin-user-appointments', user?._id],
        queryFn: () => userService.getUserAppointments(user._id),
        enabled: !!user && open,
    });

    const appointments = appointmentsData?.data || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
            case 'booked': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden dark:bg-zinc-950 dark:border-zinc-800">
                <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-zinc-900 dark:text-zinc-50 text-xl">
                            <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-700">
                                <AvatarImage src={user?.profileImage} />
                                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                {user?.name}
                                <p className="text-sm font-normal text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                                    <Mail className="h-3.5 w-3.5" /> {user?.email}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-500" /> Appointment History
                    </h3>

                    {isLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-10 border border-dashed rounded-lg border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-500">No appointments found for this user.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((apt: any) => (
                                <div key={apt._id} className="group flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-zinc-100 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50 transition-all">
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                        <span className="text-xs font-semibold uppercase">{format(new Date(apt.date), 'MMM')}</span>
                                        <span className="text-lg font-bold">{format(new Date(apt.date), 'd')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 truncate">{apt.clinicId?.name}</h4>
                                                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                    <Stethoscope className="h-3.5 w-3.5" /> Dr. {apt.doctorId?.userId?.name}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`${getStatusColor(apt.status)} capitalize`}>
                                                {apt.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500 dark:text-zinc-500">
                                            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {apt.slotTime}</span>
                                            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {apt.clinicId?.address}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <DialogFooter className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Edit User Dialog ---

export function EditUserDialog({ user, open, onOpenChange }: { user: any, open: boolean, onOpenChange: (open: boolean) => void }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
        defaultValues: {
            name: "",
            email: "",
            role: "patient"
        }
    });

    useEffect(() => {
        if (user && open) {
            setValue("name", user.name);
            setValue("email", user.email);
            setValue("role", user.role);
        }
    }, [user, open, setValue]);

    const onSubmit = async (data: any) => {
        try {
            await userService.updateUser(user._id, data);
            toast.success("User updated successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-zinc-900 dark:text-zinc-50">Edit User Details</DialogTitle>
                    <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                        Update basic information and system role for {user?.name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-900 dark:text-zinc-200">Full Name</Label>
                        <Input id="name" {...register("name")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-900 dark:text-zinc-200">Email Address</Label>
                        <Input id="email" {...register("email")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-zinc-900 dark:text-zinc-200">System Role</Label>
                        <Select 
                            onValueChange={(val) => setValue("role", val)}
                            defaultValue={watch("role")}
                            value={watch("role")}
                        >
                            <SelectTrigger className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900">Cancel</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
