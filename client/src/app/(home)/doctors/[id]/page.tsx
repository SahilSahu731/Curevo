"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorService } from "@/lib/services/doctorService";
import { patientService } from "@/lib/services/patientService";
import { formatCurrency } from "@/lib/localization";
import { useAuthStore } from "@/store/authStore";
import { 
    MapPin, 
    Calendar as CalendarIcon, 
    Clock, 
    User, 
    DollarSign, 
    GraduationCap, 
    Star, 
    CheckCircle2,
    Shield,
    Languages,
    ThumbsUp,
    MessageSquare,
    Phone,
    Share2,
    Award,
    Stethoscope,
    Search,
    Filter,
    Video,
    ShieldCheck,
    Check,
    HelpCircle,
    ChevronDown,
    Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DoctorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const id = params.id as string;

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [symptoms, setSymptoms] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    // --- Queries ---
    const { data: doctorRes, isLoading: isDoctorLoading } = useQuery({
        queryKey: ['doctor', id],
        queryFn: () => doctorService.getDoctor(id)
    });

    const doctor = doctorRes?.data;

    const { data: slotsRes, isLoading: isSlotsLoading } = useQuery({
        queryKey: ['slots', id, date],
        queryFn: () => date ? doctorService.getAvailableSlots(id, format(date, 'yyyy-MM-dd')) : Promise.resolve({ data: [] }),
        enabled: !!date && !!doctor
    });

    const slots = slotsRes?.data || [];

    // --- Mutation ---
    const bookMutation = useMutation({
        mutationFn: patientService.bookAppointment,
        onSuccess: (data) => {
            toast.success("Appointment booked successfully!");
            router.push('/patient-dashboard/appointments');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to book appointment");
        }
    });

    const handleBook = () => {
        if (!user) {
            toast.error("Please login to book an appointment");
            router.push('/login?redirect=/doctors/' + id);
            return;
        }
        // Only stable identifiers cross the URL boundary; booking reloads authoritative details.
        const params = new URLSearchParams({
            doctorId: id,
            clinicId: doctor?.clinicId?._id || ''
        });
        router.push(`/book?${params.toString()}`);
    };

    const handleQuickBook = () => {
        if (!user) {
            toast.error("Please login to book an appointment");
            router.push('/login?redirect=/doctors/' + id);
            return;
        }
        if (!date || !selectedSlot) {
            toast.error("Please select a date and time slot");
            return;
        }

        bookMutation.mutate({
            doctorId: id,
            clinicId: doctor.clinicId?._id,
            date: date,
            slotTime: selectedSlot,
            symptoms: symptoms
        });
    };

    if (isDoctorLoading) {
        return <DoctorProfileSkeleton />;
    }

    if (!doctor) {
        return <div className="min-h-screen flex items-center justify-center">Doctor not found</div>;
    }

    const languages = doctor.languages?.length ? doctor.languages : ["English"];
    const averageRating = doctor.ratingStats?.averageRating || 0;
    const reviewCount = doctor.ratingStats?.reviewCount || 0;
    const patientsServed = doctor.completedConsultations || 0;

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:text-white dark:bg-black font-body mb-20">
            {/* --- Minimal Gradient Header --- */}
            <div className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 pt-10 pb-8 px-4">
                <div className="container mx-auto max-w-7xl">
                     <div className="flex flex-col md:flex-row gap-8 items-start">
                         {/* Avatar & Verification */}
                         <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative shrink-0 mx-auto md:mx-0"
                        >
                            <div className="p-1 rounded-full bg-linear-to-tr from-emerald-400 to-blue-500">
                                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white dark:border-black">
                                    <AvatarImage src={doctor.userId?.profileImage} alt={doctor.userId?.name} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                        {doctor.userId?.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                         </motion.div>

                         {/* Header Info */}
                         <div className="flex-1 text-center md:text-left space-y-3">
                             <div>
                                <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start mb-2">
                                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 font-heading">
                                        {doctor.userId?.name}
                                    </h1>
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">Submitted profile</Badge>
                                    {doctor.isSynthetic && <Badge variant="secondary" className="text-xs px-2 py-0.5">Synthetic demo</Badge>}
                                </div>
                                <p className="text-lg text-zinc-500 dark:text-zinc-300 font-medium flex items-center justify-center md:justify-start gap-2">
                                     <Stethoscope className="w-4 h-4" /> {doctor.specialization} &bull; {doctor.qualification}
                                </p>
                             </div>

                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-zinc-600 dark:text-zinc-300 pt-1">
                                 <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full">
                                     <MapPin className="w-3.5 h-3.5" />
                                     <span>{doctor.clinicId?.city}, {doctor.clinicId?.state}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full">
                                     <Languages className="w-3.5 h-3.5" />
                                     <span>{languages.join(", ")}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full">
                                     <Clock className="w-3.5 h-3.5" />
                                     <span>{doctor.experience} Yrs Exp.</span>
                                 </div>
                             </div>
                             
                             <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                                 <div className="text-center md:text-left">
                                     <p className="text-2xl font-bold text-zinc-900 dark:text-white">{doctor.experience}</p>
                                     <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Submitted years</p>
                                 </div>
                                 <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800"></div>
                                 <div className="text-center md:text-left">
                                     <p className="text-2xl font-bold text-zinc-900 dark:text-white">{patientsServed}</p>
                                     <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Completed visits</p>
                                 </div>
                                 <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800"></div>
                                 <div className="text-center md:text-left">
                                     <div className="flex items-center gap-1">
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{averageRating || "New"}</p>
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                     </div>
                                     <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">{reviewCount} Reviews</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
            </div>

            {/* --- Main Layout --- */}
            <div className="container mx-auto px-4 max-w-7xl mt-8">
                <div className="grid lg:grid-cols-12 gap-8 md:gap-10">
                    
                    {/* Left Column (Content) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start rounded-xl p-0 h-auto bg-transparent border-b border-zinc-200 dark:border-zinc-800 mb-6 gap-6 overflow-x-auto no-scrollbar">
                                {['Overview', 'Locations', 'Reviews'].map((tab) => (
                                    <TabsTrigger 
                                        key={tab} 
                                        value={tab.toLowerCase()}
                                        className="rounded-none border-b-2 border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 px-4 py-3 text-base font-medium data-[state=active]:bg-transparent transition-all whitespace-nowrap"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <AnimatePresence mode="wait">
                            {/* OVERVIEW CONTENT */}
                            <TabsContent value="overview" className="mt-0 space-y-8" key="overview">
                                {/* About Section */}
                                <section>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" /> About Dr. {doctor.userId?.name}
                                    </h3>
                                    <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg">
                                        <p>
                                            {doctor.userId?.bio || "No biography has been submitted. Profile fields and credentials require independent confirmation."}
                                        </p>
                                        
                                        <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20 flex gap-3">
                                                 <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg h-fit">
                                                     <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                 </div>
                                                 <div>
                                                     <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Video Consultation</h4>
                                                     <p className="text-sm text-zinc-600 dark:text-zinc-400">May be requested when a video slot is listed</p>
                                                 </div>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 flex gap-3">
                                                 <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg h-fit">
                                                     <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                 </div>
                                                 <div>
                                                     <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Credential status</h4>
                                                     <p className="text-sm text-zinc-600 dark:text-zinc-400">Confirm qualifications and licensing independently</p>
                                                 </div>
                                            </div>
                                        </div>
                                        
                                        <p>Submitted qualification: {doctor.qualification}. No honors, institutional history, board status, or leadership role is asserted.</p>
                                    </div>
                                </section>

                                {/* Education & Experience Timeline style */}
                                <section>
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-500" /> Submitted professional details</h3>
                                    <div className="border-l-2 border-zinc-200 pl-6 dark:border-zinc-800">
                                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">Qualification: {doctor.qualification}</p>
                                        <p className="mt-2 text-zinc-500 dark:text-zinc-400">Experience: {doctor.experience} submitted years</p>
                                        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Institutions, dates, licenses, board status, and current scope of practice are not published or independently confirmed here.</p>
                                    </div>
                                </section>

                                {/* FAQ Section */}
                                <section>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <HelpCircle className="w-5 h-5 text-purple-500" /> Common Questions
                                    </h3>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>Are credentials confirmed by this page?</AccordionTrigger>
                                            <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                                                No. The page displays submitted profile fields. Confirm identity, license, specialty, and scope directly with the clinician and relevant authority.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-2">
                                            <AccordionTrigger>Do you offer online consultations?</AccordionTrigger>
                                            <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                                                A video slot may be requested when listed. Suitability, availability, location rules, and care arrangements require direct confirmation.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-3">
                                            <AccordionTrigger>Does Curevo confirm insurance or fees?</AccordionTrigger>
                                            <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                                                No. Displayed fees are submitted listing data. Confirm fees, insurance, payment, cancellation, and required documents with the clinic before the visit.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </section>
                            </TabsContent>

                            {/* LOCATIONS CONTENT */}
                            <TabsContent value="locations" key="locations" className="mt-6">
                                <Card className="border-none shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800 overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col-reverse md:grid md:grid-cols-3">
                                            <div className="p-6 md:col-span-1 bg-zinc-50 dark:bg-zinc-900/50 space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-3 bg-white dark:bg-black rounded-lg shadow-sm shrink-0">
                                                            <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{doctor.clinicId?.name}</h4>
                                                            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">{doctor.clinicId?.address}</p>
                                                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{doctor.clinicId?.city}, {doctor.clinicId?.zipCode}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />
                                                
                                                <div className="space-y-4">
                                                    <h5 className="font-semibold text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Contact & Hours</h5>
                                                    <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                                                        <Phone className="w-4 h-4 text-zinc-400" />
                                                        <span>+1 (555) 123-4567</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                                                        <Clock className="w-4 h-4 text-zinc-400" />
                                                        <span>Mon - Fri: 09:00 AM - 06:00 PM</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <Button className="w-full gap-2" variant="outline">
                                                        Get Directions <Share2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="md:col-span-2 h-[400px] md:h-[500px] bg-zinc-100 dark:bg-zinc-800 relative">
                                                <iframe 
                                                    width="100%" 
                                                    height="100%" 
                                                    className="absolute inset-0 w-full h-full filter grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                                                    style={{ border: 0 }}
                                                    loading="lazy"
                                                    allowFullScreen
                                                    src={`https://maps.google.com/maps?q=${encodeURIComponent((doctor.clinicId?.name || doctor.clinicId?.city) || "Hospital")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                                ></iframe>

                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            
                            {/* REVIEWS CONTENT */}
                            <TabsContent value="reviews" key="reviews" className="mt-6">
                                <DoctorReviews doctorId={doctor._id} doctorName={doctor.userId?.name} />
                            </TabsContent>
                            
                            </AnimatePresence>
                        </Tabs>

                    </div>

                    {/* Right Column (Sticky Booking) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-4">
                            <Card className="border-none shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                                <div className="h-2 bg-emerald-500 w-full"></div>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex justify-between items-center">
                                        <span>Book Appointment</span>
                                        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">{formatCurrency(doctor.consultationFee)}</Badge>
                                    </CardTitle>
                                    <CardDescription>Select a date and time to reserve.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                     {/* Calendar */}
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-2 flex justify-center border border-zinc-100 dark:border-zinc-800">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="rounded-md"
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        />
                                    </div>

                                    {/* Slots */}
                                    {date && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-foreground dark:text-zinc-200">
                                                    {format(date, 'MMM d, yyyy')}
                                                </span>
                                                <span className="text-zinc-500 dark:text-zinc-400">{slots.length} slots available</span>
                                            </div>
                                            
                                            {isSlotsLoading ? (
                                                <div className="h-24 flex items-center justify-center"><Skeleton className="h-full w-full" /></div>
                                            ) : slots.length === 0 ? (
                                                <div className="text-center py-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                                    No slots available
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                                                    {slots.map((slot: any) => (
                                                        <button
                                                            key={slot.time}
                                                            disabled={slot.isBooked}
                                                            onClick={() => setSelectedSlot(slot.time)}
                                                            title={slot.isBooked ? "Already Booked" : "Available"}
                                                            className={`text-xs py-2 px-1 rounded-lg border font-medium transition-all ${
                                                                selectedSlot === slot.time
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105'
                                                                : slot.isBooked
                                                                    ? 'bg-red-50 text-red-500 border-red-100 cursor-not-allowed decoration-red-500/30'
                                                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:text-emerald-500'
                                                            }`}
                                                        >
                                                            {slot.time}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedSlot && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <Label>Reason (Optional)</Label>
                                            <Textarea 
                                                value={symptoms}
                                                onChange={(e) => setSymptoms(e.target.value)}
                                                placeholder="Briefly describe your symptoms..."
                                                className="resize-none h-20 bg-zinc-50 dark:bg-zinc-900"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-0 pb-6 flex flex-col gap-2">
                                    <Button 
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg shadow-lg shadow-emerald-500/20"
                                        disabled={!date || !selectedSlot || bookMutation.isPending}
                                        onClick={handleQuickBook}
                                    >
                                        {bookMutation.isPending ? "Confirming..." : "Quick Book"}
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleBook}
                                    >
                                        Full Booking Experience
                                    </Button>
                                </CardFooter>
                            </Card>

                            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl flex gap-3 items-start border border-blue-100 dark:border-blue-900/50">
                                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">Prototype booking</h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                        A listed slot may be requested but availability and care are not guaranteed.
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info Widget */}
                            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4 shadow-sm">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">Response time</span>
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Not provided</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Immediate consultation</span>
                                    <Badge variant="outline">Not offered</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Separator className="my-12" />
            
            {/* --- Similar Doctors Section --- */}
            <div className="container mx-auto px-4 max-w-7xl mb-20">
                <SimilarDoctors specialization={doctor.specialization} currentDoctorId={doctor._id} />
            </div>
        </div>
    );
}
function SimilarDoctors({ specialization, currentDoctorId }: { specialization: string, currentDoctorId: string }) {
    const router = useRouter();
    const { data } = useQuery({
        queryKey: ['similar-doctors', specialization],
        queryFn: () => doctorService.getAllDoctors({ specialization: specialization }),
        staleTime: 5 * 60 * 1000
    });

    const similar = data?.data?.filter((d: any) => d._id !== currentDoctorId).slice(0, 4) || [];

    if (similar.length === 0) return null;

    return (
        <section className="mt-16">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold font-heading text-zinc-900 dark:text-white">Similar Specialists</h2>
                <Button variant="link" className="text-emerald-600 dark:text-emerald-400">View All</Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similar.map((doc: any) => (
                    <Card key={doc._id} className="group hover:shadow-xl transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => router.push(`/doctors/${doc._id}`)}>
                        <div className="aspect-4/3 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                            <Avatar className="h-full w-full rounded-none">
                                <AvatarImage src={doc.userId?.profileImage} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                <AvatarFallback className="text-4xl rounded-none bg-zinc-200 dark:bg-zinc-800 text-zinc-400">{doc.userId?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {doc.ratingStats?.averageRating || "New"}
                            </div>
                        </div>
                        <CardContent className="p-5">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-1 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {doc.userId?.name}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{doc.specialization}</p>
                            
                            <div className="flex items-center justify-between text-sm mb-4">
                                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{doc.experience} Yrs</span>
                                </div>
                                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(doc.consultationFee)}
                                </div>
                            </div>
                            
                            <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                                View Profile
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function DoctorProfileSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="h-48 bg-zinc-100 animate-pulse"></div>
            <div className="container mx-auto px-4 max-w-7xl -mt-20">
                <div className="flex flex-col md:flex-row gap-8">
                     <Skeleton className="h-40 w-40 rounded-xl" />
                     <div className="pt-24 space-y-4">
                         <Skeleton className="h-10 w-64" />
                         <Skeleton className="h-6 w-48" />
                     </div>
                </div>
            </div>
        </div>
    )
}

function DoctorReviews({ doctorId, doctorName }: { doctorId: string, doctorName?: string }) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const { data: reviews = [] } = useQuery({
        queryKey: ['reviews', doctorId],
        queryFn: () => doctorService.getReviews(doctorId),
    });
    const { data: completedVisits } = useQuery({
        queryKey: ['completed-visits-for-review', doctorId, user?._id],
        queryFn: () => patientService.getMyAppointments('completed'),
        enabled: user?.role === 'patient',
    });
    const eligibleAppointment = completedVisits?.appointments?.find((appointment: any) => {
        const appointmentDoctorId = appointment.doctorId?._id || appointment.doctorId;
        return String(appointmentDoctorId) === doctorId;
    });

    const createReviewMutation = useMutation({
        mutationFn: doctorService.createReview,
        onSuccess: () => {
            toast.success("Review submitted successfully!");
            setIsOpen(false);
            setRating(0);
            setComment("");
            queryClient.invalidateQueries({ queryKey: ['reviews', doctorId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to submit review");
        }
    });

    const handleSubmit = () => {
        if (!user) {
            toast.error("Please login to write a review");
            return;
        }
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        if (!comment.trim()) {
             toast.error("Please write a comment");
             return;
        }
        if (!eligibleAppointment) {
            toast.error("A completed appointment with this clinician is required");
            return;
        }
        createReviewMutation.mutate({ appointmentId: eligibleAppointment._id, rating, comment });
    };

    // Calculate stats
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / total).toFixed(1) : "0.0";
    
    // Distribution
    const distribution = [5,4,3,2,1].map(star => {
        const count = reviews.filter((r: any) => Math.round(r.rating) === star).length;
        return total > 0 ? Math.round((count / total) * 100) : 0;
    });

    return (
        <div className="space-y-8 ">
             {/* Stats Header */}
            <Card className="border-none shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="text-center md:text-left shrink-0">
                            <div className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">{avg}</div>
                            <div className="flex items-center justify-center md:justify-start gap-1 my-2">
                                {Array(5).fill(0).map((_, i) => (
                                    <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avg)) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`} />
                                ))}
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Based on {total} reviews</p>
                        </div>
                        
                        <div className="flex-1 w-full space-y-2">
                            {distribution.map((percentage, i) => (
                                <div key={i} className="flex items-center gap-4 text-sm">
                                    <div className="w-8 text-right font-medium text-zinc-600 dark:text-zinc-300">{5-i} ★</div>
                                    <Progress value={percentage} className="h-2.5" />
                                    <div className="w-8 text-zinc-400 dark:text-zinc-400 text-xs">{percentage}%</div>
                                </div>
                            ))}
                        </div>

                        <div className="shrink-0 pt-4 md:pt-0">
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full md:w-auto bg-emerald-600 text-white hover:bg-emerald-700">Write a Review</Button>
                                </DialogTrigger>
                                <DialogContent className="dark:text-white">
                                    <DialogHeader>
                                        <DialogTitle>Share your experience</DialogTitle>
                                        <DialogDescription>
                                            How was your appointment with Dr. {doctorName}?
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="flex justify-center gap-2">
                                            {[1,2,3,4,5].map((star) => (
                                                <Button 
                                                    key={star} 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="hover:bg-transparent p-0 h-auto"
                                                    onClick={() => setRating(star)}
                                                >
                                                     <Star className={`w-8 h-8 transition-colors cursor-pointer ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 hover:text-amber-400'}`} />
                                                </Button>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Your Review</Label>
                                            <Textarea 
                                                placeholder="Tell us about your experience..." 
                                                className="h-32" 
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleSubmit} disabled={createReviewMutation.isPending}>
                                            {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Review List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">
                        No reviews yet. Be the first to review!
                    </div>
                ) : (
                    reviews.map((review: any) => (
                        <Card key={review._id} className="border-none shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <Avatar>
                                            <AvatarImage src={review.patientId?.profileImage} />
                                            <AvatarFallback>{review.patientId?.name?.[0] || 'A'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{review.patientId?.name || 'Anonymous'}</h4>
                                            {review.isSynthetic && <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">Synthetic review</span>}
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex">
                                                    {Array(5).fill(0).map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-zinc-400">&bull; {format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-zinc-400 text-sm hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>Helpful ({review.isHelpful || 0})</span>
                                    </div>
                                </div>
                                <div className="mt-4 pl-14">
                                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{review.comment}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
