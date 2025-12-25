"use client";

import { CreateClinicDialog } from "@/components/admin/CreateClinicDialog";
import { EditClinicDialog } from "@/components/admin/EditClinicDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, MoreHorizontal, Clock, Calendar, Mail, Trash2, Building, Pencil, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicService } from "@/lib/services/clinicService";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageLoader } from "@/components/common/Loader";
import { useState } from "react";

export default function ClinicsManagementPage() {
    const queryClient = useQueryClient();
    const [editingClinic, setEditingClinic] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [clinicToDelete, setClinicToDelete] = useState<string | null>(null);

    const { data: clinicsData, isLoading, isError } = useQuery({
        queryKey: ['clinics'],
        queryFn: clinicService.getAllClinics,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
             await clinicService.deleteClinic(id);
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['clinics'] });
             toast.success("Clinic deleted successfully");
             setIsDeleteOpen(false);
             setClinicToDelete(null);
        },
        onError: (error: any) => {
             toast.error("Failed to delete clinic");
             setIsDeleteOpen(false);
        }
    });

    const handleEdit = (clinic: any) => {
        setEditingClinic(clinic);
        setIsEditOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setClinicToDelete(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (clinicToDelete) {
            deleteMutation.mutate(clinicToDelete);
        }
    };

    const clinics = clinicsData?.data || [];

    if (isLoading) {
        return <PageLoader text="Loading clinics..." />;
    }

    if (isError) {
        return <div className="text-center text-red-500 py-10 dark:text-red-400">Failed to load clinics. Please try again.</div>;
    }

    return (
        <div className="flex flex-col gap-8 p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Clinics Registry</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage your network of medical facilities from a central hub.
                    </p>
                </div>
                <CreateClinicDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clinics.map((clinic: any) => (
                    <Card key={clinic._id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-sm">
                        {/* Status Indicator Stripe */}
                        <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${clinic.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        
                        <CardContent className="p-5 pl-7">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3 items-center">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Building className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">
                                            {clinic.name}
                                        </h3>
                                        <Badge variant="outline" className={`mt-1 h-5 text-xs font-normal border-0 px-1.5 ${
                                            clinic.isActive 
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                            : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                        }`}>
                                            {clinic.isActive ? 'Operational' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 dark:bg-zinc-900 dark:border-zinc-800">
                                        <DropdownMenuItem onClick={() => handleEdit(clinic)} className="dark:focus:bg-zinc-800 dark:text-zinc-300 cursor-pointer">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-zinc-800 cursor-pointer" onClick={() => handleDeleteClick(clinic._id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-3 mb-5">
                                <div className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-zinc-400 dark:text-zinc-500" />
                                    <span className="line-clamp-2 leading-snug">{clinic.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <Phone className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                                    <span>{clinic.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <Clock className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                                    <span>{clinic.openingTime} - {clinic.closingTime}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50 text-xs text-zinc-500 dark:text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                    <Activity className="h-3.5 w-3.5" />
                                    <span>{clinic.averageConsultationTime}m consult</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{clinic.workingDays.length} days/week</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {clinics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <Building className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No clinics found</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
                        Get started by registering a new medical facility to your network.
                    </p>
                    <CreateClinicDialog />
                </div>
            )}

            <EditClinicDialog 
                open={isEditOpen} 
                onOpenChange={setIsEditOpen} 
                clinic={editingClinic} 
            />

            <ConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Clinic"
                description="Are you sure you want to delete this clinic? This action cannot be undone and will remove all associated data."
                onConfirm={confirmDelete}
                isLoading={deleteMutation.isPending}
                variant="destructive"
            />
        </div>
    );
}
