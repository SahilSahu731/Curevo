"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { UserCog, Loader2, Stethoscope, GraduationCap, Clock, DollarSign, Building } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doctorService } from "@/lib/services/doctorService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  specialization: z.string().min(2, "Specialization must be at least 2 characters"),
  qualification: z.string().min(2, "Qualification must be at least 2 characters"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  consultationFee: z.coerce.number().min(0, "Fee cannot be negative"),
  isAvailable: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDoctorDialogProps {
  doctor: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDoctorDialog({ doctor, open, onOpenChange }: EditDoctorDialogProps) {
    const queryClient = useQueryClient();
    
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            specialization: "",
            qualification: "",
            experience: 0,
            consultationFee: 0,
            isAvailable: true,
        }
    });

    useEffect(() => {
        if (doctor && open) {
            setValue("specialization", doctor.specialization);
            setValue("qualification", doctor.qualification);
            setValue("experience", doctor.experience);
            setValue("consultationFee", doctor.consultationFee);
            setValue("isAvailable", doctor.isAvailable);
        }
    }, [doctor, open, setValue]);

    const onSubmit = async (values: FormValues) => {
        try {
            await doctorService.updateDoctor(doctor._id, values);
            toast.success("Doctor profile updated successfully");
            onOpenChange(false);
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update doctor");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                            <UserCog className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                            Manage Doctor Profile
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                            Update professional details and availability for Dr. {doctor?.userId?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {/* Read-Only Personal Info */}
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 space-y-4">
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400"/> Personal Information (Read-Only)
                            </h4>
                            <div className="grid grid-cols-2 gap-4 opacity-75">
                                <div className="space-y-2">
                                    <Label className="text-zinc-700 dark:text-zinc-400 text-xs">Full Name</Label>
                                    <Input value={doctor?.userId?.name || ''} disabled className="h-8 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-700 dark:text-zinc-400 text-xs">Email Address</Label>
                                    <Input value={doctor?.userId?.email || ''} disabled className="h-8 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                                </div>
                            </div>
                        </div>

                         <div className="space-y-4">
                             <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                                 <Stethoscope className="h-4 w-4 text-emerald-500" /> Professional Details
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="specialization" className="text-zinc-900 dark:text-zinc-200">Specialization</Label>
                                    <Input id="specialization" {...register("specialization")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-emerald-500/20" />
                                    {errors.specialization && <p className="text-sm text-red-500 mt-1">{errors.specialization.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qualification" className="text-zinc-900 dark:text-zinc-200">Qualification</Label>
                                    <Input id="qualification" {...register("qualification")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-emerald-500/20" />
                                    {errors.qualification && <p className="text-sm text-red-500 mt-1">{errors.qualification.message}</p>}
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="experience" className="text-zinc-900 dark:text-zinc-200">Experience (Years)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input type="number" id="experience" className="pl-9 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-emerald-500/20" {...register("experience")} />
                                    </div>
                                    {errors.experience && <p className="text-sm text-red-500 mt-1">{errors.experience.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="consultationFee" className="text-zinc-900 dark:text-zinc-200">Consultation Fee</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input type="number" id="consultationFee" className="pl-9 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-emerald-500/20" {...register("consultationFee")} />
                                    </div>
                                    {errors.consultationFee && <p className="text-sm text-red-500 mt-1">{errors.consultationFee.message}</p>}
                                </div>
                             </div>
                         </div>

                         <div className="flex items-center space-x-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/30">
                            <Checkbox 
                                id="isAvailable" 
                                checked={watch("isAvailable")}
                                onCheckedChange={(checked) => setValue("isAvailable", checked as boolean)}
                                className="dark:border-zinc-600 dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 dark:data-[state=checked]:text-white"
                            />
                            <Label htmlFor="isAvailable" className="text-zinc-900 dark:text-zinc-200 cursor-pointer">
                                Doctor is currently available for appointments
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white shadow-sm" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Profile
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
