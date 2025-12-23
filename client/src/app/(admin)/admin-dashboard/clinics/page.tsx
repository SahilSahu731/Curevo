"use client";

import { CreateClinicDialog } from "@/components/admin/CreateClinicDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ClinicsManagementPage() {
    // Mock Clinics Data
    const clinics = [
        { id: 1, name: "City Care Medical Center", address: "123 Main St, New York", phone: "+1 (555) 123-4567", status: "Verified" },
        { id: 2, name: "Green Valley Health", address: "456 Oak Ave, California", phone: "+1 (555) 987-6543", status: "Pending" },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clinics Registry</h1>
                    <p className="text-muted-foreground">Onboard and manage medical facilities.</p>
                </div>
                <CreateClinicDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clinics.map((clinic) => (
                    <Card key={clinic.id} className="overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                             <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-emerald-700">
                                    {clinic.status}
                                </Badge>
                             </div>
                        </div>
                        <CardHeader className="pt-4 pb-2">
                            <CardTitle>{clinic.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{clinic.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span>{clinic.phone}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" className="w-full">Manage</Button>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
