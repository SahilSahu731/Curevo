"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { doctorService } from "@/lib/services/doctorService";
import { appointmentService } from "@/lib/services/appointmentService";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // verify shadcn calendar
import { useBookingStore } from "@/store/bookingStore";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DateTimeStep() {
    const { doctorId, clinicId, setDate, setSlot, date, slotTime, prevStep, reset, doctorName, clinicName } = useBookingStore();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const router = useRouter();

    const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

    const { data: slotsData, isLoading: slotsLoading } = useQuery({
        queryKey: ['slots', doctorId, formattedDate],
        queryFn: () => doctorService.getAvailableSlots(doctorId!, formattedDate),
        enabled: !!doctorId && !!selectedDate
    });

    const bookMutation = useMutation({
        mutationFn: appointmentService.bookAppointment,
        onSuccess: () => {
            toast.success("Appointment booked successfully!");
            reset();
            router.push('/patient-dashboard');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Booking failed");
        }
    });

    const handleBook = () => {
        if (!selectedDate || !slotTime) return;
        
        bookMutation.mutate({
            doctorId,
            clinicId,
            date: formattedDate,
            slotTime,
            symptoms: "Regular checkup" // Add symptom input if needed
        });
    };

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Select Date & Time</h2>
                <Button variant="ghost" onClick={prevStep}>Back</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="mb-4 font-medium text-gray-700">1. Pick a Date</h3>
                     {/* Assuming naive calendar component or standard input */}
                     <div className="p-4 border rounded-xl bg-white shadow-sm inline-block">
                        <input 
                            type="date" 
                            className="p-2 border rounded w-full"
                            value={formattedDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                const d = new Date(e.target.value);
                                setSelectedDate(d);
                                setDate(d);
                                setSlot(""); // Reset slot
                            }}
                        />
                     </div>
                </div>

                <div>
                    <h3 className="mb-4 font-medium text-gray-700">2. Pick a Time Slot</h3>
                    {slotsLoading ? (
                        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin h-4 w-4"/> Loading slots...</div>
                    ) : (slotsData && slotsData.data && slotsData.data.length > 0) ? (
                        <div className="grid grid-cols-3 gap-3">
                            {slotsData.data.map((slot: any) => (
                                <Button
                                    key={slot.time}
                                    variant={slotTime === slot.time ? "default" : slot.isBooked ? "destructive" : "outline"}
                                    disabled={slot.isBooked}
                                    onClick={() => setSlot(slot.time)}
                                    className={`w-full ${slot.isBooked ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100 opacity-100 cursor-not-allowed' : ''}`}
                                >
                                    {slot.time}
                                </Button>
                            ))}
                        </div>
                    ) : (
                         <div className="text-gray-500 italic">No slots available for this date.</div>
                    )}
                </div>
            </div>

            {slotTime && (
                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-2">Booking Summary</h3>
                    <p className="text-blue-800">Doctor: <span className="font-bold">{doctorName}</span></p>
                    <p className="text-blue-800">Clinic: <span className="font-bold">{clinicName}</span></p>
                    <p className="text-blue-800">Date: <span className="font-bold">{format(selectedDate!, 'PPPP')}</span></p>
                    <p className="text-blue-800 mb-4">Time: <span className="font-bold">{slotTime}</span></p>
                    
                    <Button 
                        onClick={handleBook} 
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700" 
                        size="lg"
                        disabled={bookMutation.isPending}
                    >
                         {bookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         Confirm Booking
                    </Button>
                </div>
            )}
        </div>
    );
}
