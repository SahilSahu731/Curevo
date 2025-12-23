"use client";

import { useAuthStore } from "@/store/authStore";
import { 
    User, 
    Mail, 
    Shield, 
    Calendar, 
    MapPin, 
    Phone, 
    Edit2,
    Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    CardDescription 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    // Mock data for display enhancement (since basic user model is simple)
    const extraDetails = {
        phone: "+1 (555) 123-4567",
        location: "New York, USA",
        joined: "January 2024",
        bio: "Dedicated to maintaining a healthy lifestyle and regular checkups."
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    return (
        <div className="container mx-auto max-w-5xl py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Cover Area */}
            <div className="relative mb-20 md:mb-24">
                <div className="h-48 md:h-64 w-full rounded-2xl bg-gradient-brand shadow-lg overflow-hidden">
                    <div className="absolute inset-0 bg-black/20" />
                </div>
                
                {/* Profile Avatar Overlay */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -bottom-16 left-6 md:left-12 flex items-end gap-6"
                >
                    <div className="relative group">
                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl rounded-2xl">
                            <AvatarImage src={user?.profileImage || ""} alt={user?.name} className="object-cover" />
                            <AvatarFallback className="text-4xl font-black bg-white text-primary">
                                {getInitials(user?.name || "")}
                            </AvatarFallback>
                        </Avatar>
                        <button className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="mb-4 hidden md:block">
                        <h1 className="text-3xl font-bold text-white drop-shadow-md">{user?.name}</h1>
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm mt-2 uppercase tracking-widest text-[10px]">
                            {user?.role} Account
                        </Badge>
                    </div>
                </motion.div>
                
                {/* Mobile Name */}
                <div className="md:hidden mt-20 px-6">
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    <Badge variant="outline" className="mt-1 capitalize">{user?.role}</Badge>
                </div>

                <div className="absolute bottom-4 right-6 hidden md:block">
                    <Button 
                        variant={isEditing ? "secondary" : "default"} 
                        className="shadow-lg"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Cancel Edit' : 'Edit Profile'} 
                        <Edit2 className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Left Sidebar: Key Info */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {extraDetails.bio}
                            </p>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate" title={user?.email}>{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{extraDetails.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{extraDetails.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Joined {extraDetails.joined}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                        <CardHeader className="pb-2">
                             <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <Shield className="h-5 w-5" />
                                <CardTitle className="text-base">Security Status</CardTitle>
                             </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Email Verified</span>
                                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Verified</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">2FA</span>
                                <Badge variant="outline" className="text-amber-500 border-amber-500/30">Disabled</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content: Edit Form or Activity */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Manage your personal details and account settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Full Name</Label>
                                        <Input 
                                            id="firstName" 
                                            defaultValue={user?.name} 
                                            disabled={!isEditing} 
                                            className="bg-muted/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            defaultValue={user?.email} 
                                            disabled 
                                            className="bg-muted/50 text-muted-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input 
                                            id="phone" 
                                            defaultValue={extraDetails.phone} 
                                            disabled={!isEditing}
                                            className="bg-muted/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input 
                                            id="location" 
                                            defaultValue={extraDetails.location} 
                                            disabled={!isEditing}
                                            className="bg-muted/30"
                                        />
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-2">
                                    <Label>Bio</Label>
                                    <textarea 
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        defaultValue={extraDetails.bio}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end gap-4 pt-4">
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
