"use client";
import React from 'react';
import { useBookingStore } from "@/store/bookingStore";
import ClinicStep from "@/components/patient/booking/ClinicStep";
import DoctorStep from "@/components/patient/booking/DoctorStep";
import DateTimeStep from "@/components/patient/booking/DateTimeStep";
import { useRequireAuth } from "@/hooks/useRequireAuth"; // Verify availability

export default function BookAppointmentPage() {
    // useRequireAuth(); // Optional, assuming layout protects
    const { steps } = useBookingStore();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Book an Appointment</h1>
                    <p className="mt-2 text-gray-600">Follow the steps to schedule your visit</p>
                </div>

                {/* Progress Steps */}
                <div className="relative flex justify-between w-full max-w-2xl mx-auto mb-8">
                     <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
                     <div className={`absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-300`} 
                          style={{ width: `${((steps - 1) / 2) * 100}%` }}></div>

                     {[1, 2, 3].map((step) => (
                         <div key={step} className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                             steps >= step ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-white text-gray-400 border border-gray-200"
                         }`}>
                             {step}
                         </div>
                     ))}
                </div>

                {/* Content */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[400px]">
                    {steps === 1 && <ClinicStep />}
                    {steps === 2 && <DoctorStep />}
                    {steps === 3 && <DateTimeStep />}
                </div>
            </div>
        </div>
    );
}
