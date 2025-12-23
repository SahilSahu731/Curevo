"use client";
import { useQuery } from "@tanstack/react-query";
import { clinicService } from "@/lib/services/clinicService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

export default function ClinicStep() {
    const { data, isLoading } = useQuery({
        queryKey: ['clinics'],
        queryFn: clinicService.getAllClinics
    });
    const { setClinic, nextStep } = useBookingStore();

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading clinics...</div>;

    const clinics = data?.data || [];

    const handleSelect = (clinic: any) => {
        setClinic(clinic._id, clinic.name);
        nextStep();
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Select a Clinic</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {clinics.map((clinic: any) => (
                    <Card key={clinic._id} className="cursor-pointer hover:border-blue-500 transition-all hover:shadow-md" onClick={() => handleSelect(clinic)}>
                        <CardHeader>
                            <CardTitle>{clinic.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {clinic.address}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">{clinic.phone}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
