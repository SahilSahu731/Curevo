"use client";
import { useQuery } from "@tanstack/react-query";
import { doctorService } from "@/lib/services/doctorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Stethoscope } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

export default function DoctorStep() {
    const { clinicId, setDoctor, nextStep, prevStep } = useBookingStore();
    
    // Fetch doctors, ideally filtered by clinicId if API supports it. 
    // Assuming backend returns all and we filter, or backend supports query.
    // The current doctorService.getAllDoctors returns all. 
    // I should probably optimize that but for now client filter or simple fetch.
    
    const { data, isLoading } = useQuery({
        queryKey: ['doctors'],
        queryFn: doctorService.getAllDoctors
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading doctors...</div>;

    const doctors = data?.data?.filter((d: any) => d.clinicId._id === clinicId) || [];

    const handleSelect = (doctor: any) => {
        setDoctor(doctor._id, doctor.userId.name);
        nextStep();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Select a Doctor</h2>
                <Button variant="ghost" onClick={prevStep}>Back</Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                {doctors.length > 0 ? doctors.map((doctor: any) => (
                    <Card key={doctor._id} className="cursor-pointer hover:border-blue-500 transition-all hover:shadow-md" onClick={() => handleSelect(doctor)}>
                        <CardHeader className="flex flex-row gap-4 items-center">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle>Dr. {doctor.userId.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <Stethoscope className="h-4 w-4" />
                                    {doctor.specialization}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-500">{doctor.experience} yrs exp</span>
                                 <span className="font-semibold text-green-600">${doctor.consultationFee}</span>
                             </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        No doctors found for this clinic.
                    </div>
                )}
            </div>
        </div>
    );
}
