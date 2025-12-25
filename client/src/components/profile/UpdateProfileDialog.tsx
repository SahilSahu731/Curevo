"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/lib/services/authService";
import { useAuthStore } from "@/store/authStore";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UpdateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function UpdateProfileDialog({ open, onOpenChange, user }: UpdateProfileDialogProps) {
  const { setUser } = useAuthStore();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      bio: user?.bio || "",
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      zipCode: user?.address?.zipCode || "",
      country: user?.address?.country || ""
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
        // Prepare nested address object
        const payload = {
            name: data.name,
            phone: data.phone,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            bio: data.bio,
            address: {
                street: data.street,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                country: data.country
            }
        };
        return updateProfile(payload);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser, useAuthStore.getState().token);
      toast.success("Profile updated successfully");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    }
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          
          {/* Personal Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...register("name", { required: true })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register("phone")} placeholder="+1 (555) 000-0000" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(val) => setValue("gender", val)} defaultValue={watch("gender")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" {...register("dateOfBirth")} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" {...register("bio")} placeholder="Tell us a little about yourself" className="resize-none" />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Address Details</h3>
            <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" {...register("street")} placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" {...register("state")} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip / Postal Code</Label>
                    <Input id="zipCode" {...register("zipCode")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...register("country")} />
                </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
