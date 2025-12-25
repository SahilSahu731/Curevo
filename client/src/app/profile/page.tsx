"use client";

import { useAuthStore } from "@/store/authStore";
import { 
    Mail, 
    Shield, 
    Calendar, 
    MapPin, 
    Phone, 
    Edit2,
    Camera,
    Loader2,
    User as UserIcon,
    HeartPulse,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { updateProfileImage } from "@/lib/services/authService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpdateProfileDialog } from "@/components/profile/UpdateProfileDialog";
import { format } from "date-fns";

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Image Upload State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const getInitials = (name: string) => {
        return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    const imageMutation = useMutation({
        mutationFn: updateProfileImage,
        onSuccess: (updatedUser) => {
            setUser(updatedUser, useAuthStore.getState().token);
            toast.success("Profile photo updated successfully");
            closeUploadDialog();
        },
        onError: () => {
            toast.error("Failed to update profile photo");
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setIsDialogOpen(true);
            e.target.value = ""; 
        }
    };

    const closeUploadDialog = () => {
        setIsDialogOpen(false);
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    const handleConfirmUpload = () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);
            imageMutation.mutate(formData);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Format address helper
    const formattedAddress = user?.address 
        ? [user.address.street, user.address.city, user.address.state, user.address.country].filter(Boolean).join(", ") 
        : "No address provided";

    return (
        <div className="container mx-auto max-w-7xl py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            
            {/* Top Identity Section */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Profile Card */}
                <Card className="lg:col-span-8 border-none shadow-xl bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                       <UserIcon className="w-64 h-64 text-primary" />
                    </div>
                    
                    <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                        {/* Avatar Section */}
                        <div className="relative group shrink-0">
                            <div className="h-40 w-40 rounded-full p-1.5 bg-background shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <Avatar className="h-full w-full rounded-full">
                                    <AvatarImage src={user?.profileImage || ""} alt={user?.name} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                                        {getInitials(user?.name || "")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Camera Edit Button */}
                            <button 
                                onClick={triggerFileInput}
                                className="absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-200 border-4 border-background"
                            >
                                {imageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                            </button>
                            
                            {/* Hidden Input */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Identity Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <div className="flex flex-col md:flex-row items-center md:items-end gap-3 justify-center md:justify-start">
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{user?.name}</h1>
                                    <Badge variant="secondary" className="mb-1.5 px-3 py-0.5 text-xs uppercase tracking-wider font-semibold bg-primary/10 text-primary border-primary/20">
                                        {user?.role}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-2 flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-4 h-4" /> {user?.email}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-2">
                                <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{user?.phone || "No phone"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{user?.address?.city || "Location not set"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Member since {format(new Date(user?.createdAt || new Date()), 'MMM yyyy')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="absolute top-6 right-6">
                            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="gap-2">
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side Stats / Quick Actions */}
                <div className="lg:col-span-4 space-y-6">
                     <Card className="border-none shadow-lg bg-primary text-primary-foreground relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 rounded-full blur-3xl"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium opacity-90 flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Security Level
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">Strong</div>
                            <p className="text-primary-foreground/70 text-sm mt-1">2FA Enabled • Verified</p>
                            <div className="mt-4 flex gap-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">Email Verified</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-l-4 border-l-rose-500">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-base flex items-center justify-between">
                                <span className="flex items-center gap-2"><HeartPulse className="w-4 h-4 text-rose-500" /> Vitals</span>
                                <span className="text-xs text-muted-foreground">Detailed view &rarr;</span>
                             </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-bold text-foreground">120/80</div>
                                    <div className="text-xs text-muted-foreground">Blood Pressure</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-foreground">72 <span className="text-sm font-normal">bpm</span></div>
                                    <div className="text-xs text-muted-foreground">Heart Rate</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Grid Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* About Section */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserIcon className="w-5 h-5 text-primary" /> About Me
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="bg-secondary/30 p-4 rounded-xl">
                            <p className="text-muted-foreground leading-relaxed italic">
                                "{user?.bio || "No bio information provided. Click edit to tell us about yourself."}"
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                            <div className="space-y-1">
                                <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Full Name</div>
                                <div className="font-medium">{user?.name}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Date of Birth</div>
                                <div className="font-medium">{user?.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMMM d, yyyy') : "Not set"}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Gender</div>
                                <div className="font-medium capitalize">{user?.gender || "Not set"}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Language</div>
                                <div className="font-medium">English (Primary)</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Address Section */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="w-5 h-5 text-primary" /> Address Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full text-primary">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-medium text-sm text-foreground">Full Address</div>
                                    <div className="text-sm text-muted-foreground mt-1 max-w-sm">
                                        {formattedAddress}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg border bg-card">
                                    <div className="text-xs text-muted-foreground">City</div>
                                    <div className="font-medium mt-1">{user?.address?.city || "-"}</div>
                                </div>
                                <div className="p-3 rounded-lg border bg-card">
                                    <div className="text-xs text-muted-foreground">State/Province</div>
                                    <div className="font-medium mt-1">{user?.address?.state || "-"}</div>
                                </div>
                                <div className="p-3 rounded-lg border bg-card">
                                    <div className="text-xs text-muted-foreground">Country</div>
                                    <div className="font-medium mt-1">{user?.address?.country || "-"}</div>
                                </div>
                                <div className="p-3 rounded-lg border bg-card">
                                    <div className="text-xs text-muted-foreground">Postal Code</div>
                                    <div className="font-medium mt-1">{user?.address?.zipCode || "-"}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs remain unchanged */}
            <UpdateProfileDialog 
                open={isEditOpen} 
                onOpenChange={setIsEditOpen} 
                user={user} 
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Profile Photo</DialogTitle>
                        <DialogDescription>
                            Preview your new look before saving changes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-6 bg-secondary/20 rounded-xl my-2">
                        {previewUrl && (
                            <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-background shadow-xl ring-4 ring-secondary">
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="sm:justify-between gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={closeUploadDialog}
                            disabled={imageMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmUpload}
                            disabled={imageMutation.isPending}
                            className="bg-primary"
                        >
                            {imageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm & Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
