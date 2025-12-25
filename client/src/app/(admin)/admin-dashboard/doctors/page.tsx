"use client";

import { EditDoctorDialog } from "@/components/admin/EditDoctorDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, MoreHorizontal, Briefcase, GraduationCap, DollarSign, Trash2, UserCog, Stethoscope, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorService } from "@/lib/services/doctorService";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageLoader } from "@/components/common/Loader";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DoctorsManagementPage() {
    const queryClient = useQueryClient();
    const [editingDoctor, setEditingDoctor] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);

    const { data: doctorsData, isLoading, isError } = useQuery({
        queryKey: ['doctors'],
        queryFn: doctorService.getAllDoctors,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
             await doctorService.deleteDoctor(id);
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['doctors'] });
             toast.success("Doctor profile deleted successfully");
             setIsDeleteOpen(false);
             setDoctorToDelete(null);
        },
        onError: (error: any) => {
             toast.error("Failed to delete doctor profile");
             setIsDeleteOpen(false);
        }
    });

    const handleEdit = (doctor: any) => {
        setEditingDoctor(doctor);
        setIsEditOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDoctorToDelete(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (doctorToDelete) {
            deleteMutation.mutate(doctorToDelete);
        }
    };

    const doctors = doctorsData?.data || [];

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return <PageLoader text="Loading doctors..." />;
    }

    if (isError) {
        return <div className="text-center text-red-500 py-10 dark:text-red-400">Failed to load doctors. Please try again.</div>;
    }

    return (
        <div className="flex flex-col gap-8 p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Doctors Registry</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage medical professionals, their availability, and assignments.
                    </p>
                </div>
                {/* Future: Add Invite/Onboard Doctor Button here */}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor: any) => (
                    <Card key={doctor._id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-sm">
                        {/* Status Indicator Stripe */}
                        <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${doctor.isAvailable ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                        
                        <CardContent className="p-5 pl-7">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4 items-center">
                                    <Avatar className="h-12 w-12 border-2 border-white dark:border-zinc-800 shadow-sm">
                                        <AvatarImage src={doctor.userId?.profileImage} />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                            {getInitials(doctor.userId?.name || '?')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">
                                            {doctor.userId?.name}
                                        </h3>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                            {doctor.specialization}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 dark:bg-zinc-900 dark:border-zinc-800">
                                        <DropdownMenuItem onClick={() => handleEdit(doctor)} className="dark:focus:bg-zinc-800 dark:text-zinc-300 cursor-pointer">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-zinc-800 cursor-pointer" onClick={() => handleDeleteClick(doctor._id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Profile
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-3 mb-5">
                                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <MapPin className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                                    <span className="truncate">{doctor.clinicId?.name || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <Briefcase className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                                    <span>{doctor.experience} years exp.</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <DollarSign className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                                    <span>${doctor.consultationFee} / visit</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                <Badge variant="outline" className={`h-6 border-0 px-2 gap-1.5 ${
                                    doctor.isAvailable 
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}>
                                    {doctor.isAvailable ? (
                                        <>
                                            <CheckCircle2 className="h-3 w-3" /> Available
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-3 w-3" /> Unavailable
                                        </>
                                    )}
                                </Badge>
                                
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                    {doctor.qualification}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {doctors.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <UserCog className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No doctors found</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                        No doctor profiles have been created yet.
                    </p>
                </div>
            )}

            <EditDoctorDialog 
                open={isEditOpen} 
                onOpenChange={setIsEditOpen} 
                doctor={editingDoctor} 
            />

            <ConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Doctor Profile"
                description="Are you sure you want to delete this doctor's profile? This will remove their association with the clinic but will not delete their user account."
                onConfirm={confirmDelete}
                isLoading={deleteMutation.isPending}
                variant="destructive"
            />
        </div>
    );
}
