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
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Pencil, Building2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clinicService } from "@/lib/services/clinicService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  averageConsultationTime: z.coerce.number().min(5, "Must be at least 5 minutes"),
  workingDays: z.array(z.string()).min(1, "Select at least one working day"),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const WORKING_DAYS = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

interface EditClinicDialogProps {
  clinic: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClinicDialog({ clinic, open, onOpenChange }: EditClinicDialogProps) {
    const queryClient = useQueryClient();
    
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch, trigger } = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            openingTime: "09:00",
            closingTime: "17:00",
            averageConsultationTime: 15,
            workingDays: [],
            isActive: true,
        }
    });

    useEffect(() => {
        if (clinic && open) {
            setValue("name", clinic.name);
            setValue("email", clinic.email || "");
            setValue("phone", clinic.phone);
            setValue("address", clinic.address);
            setValue("openingTime", clinic.openingTime);
            setValue("closingTime", clinic.closingTime);
            setValue("averageConsultationTime", clinic.averageConsultationTime);
            setValue("workingDays", clinic.workingDays);
            setValue("isActive", clinic.isActive);
        }
    }, [clinic, open, setValue]);

    const selectedDays = watch("workingDays");

    const onSubmit = async (values: FormValues) => {
        try {
            await clinicService.updateClinic(clinic._id, values);
            toast.success("Clinic updated successfully");
            onOpenChange(false);
            queryClient.invalidateQueries({ queryKey: ['clinics'] });
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update clinic");
        }
    };

    const toggleDay = (day: string) => {
        const current = selectedDays || [];
        const updated = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day];
        setValue("workingDays", updated);
        trigger("workingDays");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                            <Pencil className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                            Edit Clinic Details
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                            Update the information for {clinic?.name || "this facility"}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                         <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-900 dark:text-zinc-200">Clinic Name</Label>
                            <Input id="name" {...register("name")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-emerald-500/20" />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-900 dark:text-zinc-200">Business Email</Label>
                                <Input id="email" {...register("email")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-emerald-500/20" />
                                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-zinc-900 dark:text-zinc-200">Phone Number</Label>
                                <Input id="phone" {...register("phone")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-emerald-500/20" />
                                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                            </div>
                         </div>

                         <div className="space-y-2">
                            <Label htmlFor="address" className="text-zinc-900 dark:text-zinc-200">Address</Label>
                            <Textarea id="address" {...register("address")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-emerald-500/20 resize-none min-h-[80px]" />
                            {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
                         </div>

                         <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="openingTime" className="text-zinc-900 dark:text-zinc-200">Opening (24h)</Label>
                                <Input type="time" id="openingTime" {...register("openingTime")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:[color-scheme:dark]" />
                                {errors.openingTime && <p className="text-sm text-red-500 mt-1">{errors.openingTime.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="closingTime" className="text-zinc-900 dark:text-zinc-200">Closing (24h)</Label>
                                <Input type="time" id="closingTime" {...register("closingTime")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:[color-scheme:dark]" />
                                {errors.closingTime && <p className="text-sm text-red-500 mt-1">{errors.closingTime.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avgTime" className="text-zinc-900 dark:text-zinc-200">Avg Consult (min)</Label>
                                <Input type="number" id="avgTime" {...register("averageConsultationTime")} className="dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500" />
                                {errors.averageConsultationTime && <p className="text-sm text-red-500 mt-1">{errors.averageConsultationTime.message}</p>}
                            </div>
                         </div>
                         
                         <div className="space-y-3">
                            <Label className="text-zinc-900 dark:text-zinc-200">Working Days</Label>
                            <div className="flex flex-wrap gap-2">
                                {WORKING_DAYS.map((day) => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`edit-day-${day}`} 
                                            checked={selectedDays?.includes(day)}
                                            onCheckedChange={() => toggleDay(day)}
                                            className="dark:border-zinc-600 dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 dark:data-[state=checked]:text-white"
                                        />
                                        <label
                                            htmlFor={`edit-day-${day}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-zinc-700 dark:text-zinc-300"
                                        >
                                            {day.slice(0, 3)}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {errors.workingDays && <p className="text-sm text-red-500 mt-1">{errors.workingDays.message}</p>}
                         </div>

                         <div className="flex items-center space-x-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/30">
                            <Checkbox 
                                id="isActive" 
                                checked={watch("isActive")}
                                onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
                                className="dark:border-zinc-600 dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 dark:data-[state=checked]:text-white"
                            />
                            <Label htmlFor="isActive" className="text-zinc-900 dark:text-zinc-200 cursor-pointer">
                                Facility is currently active and operational
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white shadow-sm" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Facility
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
