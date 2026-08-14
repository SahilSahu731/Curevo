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
    FileCheck,
    Upload,
    Download,
    Trash2,
    Video
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfileImage } from "@/lib/services/authService";
import { doctorService } from "@/lib/services/doctorService";
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
import apiClient from "@/api/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, setUser, logout } = useAuthStore();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Image Upload State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [licenseNumber, setLicenseNumber] = useState("");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteEmail, setDeleteEmail] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [privacyActionPending, setPrivacyActionPending] = useState(false);

    const { data: verificationData } = useQuery({
        queryKey: ["doctor-verification-me"],
        queryFn: doctorService.getMyVerification,
        enabled: user?.role === "doctor",
    });

    const verification = verificationData?.data;

    const getInitials = (name: string) => {
        return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    const imageMutation = useMutation({
        mutationFn: updateProfileImage,
        onSuccess: (updatedUser) => {
            setUser(updatedUser);
            toast.success("Profile photo updated successfully");
            closeUploadDialog();
        },
        onError: () => {
            toast.error("Failed to update profile photo");
        }
    });

    const verificationMutation = useMutation({
        mutationFn: doctorService.submitVerification,
        onSuccess: () => {
            toast.success("License submitted for admin review");
            setLicenseFile(null);
            setLicenseNumber("");
            queryClient.invalidateQueries({ queryKey: ["doctor-verification-me"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "License upload failed");
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

    const handleVerificationSubmit = () => {
        if (!licenseFile || !licenseNumber.trim()) {
            toast.error("License number and file are required");
            return;
        }
        const formData = new FormData();
        formData.append("licenseNumber", licenseNumber);
        formData.append("license", licenseFile);
        verificationMutation.mutate(formData);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const downloadAccountData = async () => {
        setPrivacyActionPending(true);
        try {
            const response = await apiClient.get("/auth/export", { responseType: "blob" });
            const url = URL.createObjectURL(response.data);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `curevo-export-${new Date().toISOString().slice(0, 10)}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
            toast.success("Account export downloaded");
        } catch {
            toast.error("Account export failed");
        } finally {
            setPrivacyActionPending(false);
        }
    };

    const deleteAccount = async () => {
        setPrivacyActionPending(true);
        try {
            await apiClient.delete("/auth/account", { data: { confirmEmail: deleteEmail, password: deletePassword } });
            logout();
            router.replace("/");
            toast.success("Account deleted");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Account deletion failed");
        } finally {
            setPrivacyActionPending(false);
        }
    };

    const revokeTelehealthConsent = async () => {
        setPrivacyActionPending(true);
        try {
            await apiClient.post("/auth/consents", { type: "telehealth", accepted: false, policyVersion: "2026-08-03" });
            toast.success("Video-visit consent revoked");
        } catch {
            toast.error("Consent revocation failed");
        } finally {
            setPrivacyActionPending(false);
        }
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
                     <Card className="border shadow-lg bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" /> Privacy & account
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm leading-6 text-muted-foreground">Download the data linked to this account or permanently delete it.</p>
                            <Button variant="outline" className="w-full justify-start" onClick={downloadAccountData} disabled={privacyActionPending}>
                                <Download className="mr-2 h-4 w-4" /> Download my data
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={revokeTelehealthConsent} disabled={privacyActionPending}>
                                <Video className="mr-2 h-4 w-4" /> Revoke video-visit consent
                            </Button>
                            <Button variant="destructive" className="w-full justify-start" onClick={() => setIsDeleteOpen(true)} disabled={privacyActionPending}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete account
                            </Button>
                        </CardContent>
                    </Card>

                    {user?.role === "doctor" && (
                        <Card className="shadow-lg border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-emerald-500" /> Doctor Verification</span>
                                    <Badge variant="outline" className="capitalize">{verification?.status || "not-submitted"}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {verification?.notes && (
                                    <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">{verification.notes}</p>
                                )}
                                <input
                                    value={licenseNumber}
                                    onChange={(event) => setLicenseNumber(event.target.value)}
                                    placeholder="Medical license number"
                                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                                />
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(event) => setLicenseFile(event.target.files?.[0] || null)}
                                    className="block w-full text-sm"
                                />
                                <Button className="w-full" onClick={handleVerificationSubmit} disabled={verificationMutation.isPending}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {verificationMutation.isPending ? "Submitting..." : "Submit License"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
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

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete this account?</DialogTitle>
                        <DialogDescription>This removes linked database records and tracked uploads and cannot be undone. Removal from provider backups is not yet verified.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="delete-email">Type {user?.email} to confirm</label>
                            <input id="delete-email" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={deleteEmail} onChange={(event) => setDeleteEmail(event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="delete-password">Current password (leave blank for Google accounts)</label>
                            <input id="delete-password" type="password" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={deleteAccount} disabled={privacyActionPending || deleteEmail.trim().toLowerCase() !== user?.email?.toLowerCase()}>
                            {privacyActionPending ? "Deleting..." : "Permanently delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
