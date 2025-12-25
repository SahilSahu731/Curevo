"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicService } from "@/lib/services/clinicService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { 
    MapPin, 
    Calendar as CalendarIcon, 
    Clock, 
    Phone, 
    Mail, 
    Star, 
    ShieldCheck, 
    Award,
    Stethoscope, 
    Users, 
    Building2,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Share2,
    Video,
    ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export default function ClinicDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [activeTab, setActiveTab] = useState("overview");

    // Queries
    const { data: clinicRes, isLoading: isClinicLoading } = useQuery({
        queryKey: ['clinic', id],
        queryFn: () => clinicService.getClinic(id)
    });

    // Fetch doctors based on clinicId (using separate relational query)
    const { data: doctorsRes, isLoading: isDoctorsLoading } = useQuery({
        queryKey: ['clinic-doctors', id],
        queryFn: () => clinicService.getClinicDoctors(id)
    });

    const clinic = clinicRes?.data;
    const doctors = doctorsRes?.data || [];

    if (isClinicLoading) return <ClinicSkeleton />;
    if (!clinic) return <div className="min-h-screen flex items-center justify-center">Clinic not found</div>;

    // Derived State / Mocks
    const rating = 4.8; 
    const reviewCount = 320;
    const services = clinic.services && clinic.services.length > 0 ? clinic.services : [
        "General Consultation", "Pediatrics", "Cardiology", "Dermatology", "Orthopedics", "Emergency Care"
    ];
    const images = clinic.images && clinic.images.length > 0 ? clinic.images : [
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1516549655169-df83a0833860?auto=format&fit=crop&q=80&w=2000"
    ];

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-black font-body mb-20 dark:text-zinc-300 relative">
             {/* Back Button */}
             <div className="absolute top-24 left-4 md:left-8 z-30">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
             </div>

            {/* --- Hero Gallery --- */}
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
                 <div className="absolute inset-0 bg-black/40 z-10"></div>
                 <img 
                    src={images[0]} 
                    alt={clinic.name} 
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-12 z-20">
                     <div className="container mx-auto max-w-7xl">
                         <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                             <div>
                                <Badge className="bg-emerald-500 text-white border-emerald-400 mb-4 hover:bg-emerald-600">
                                    Premium Healthcare
                                </Badge>
                                <h1 className="text-4xl md:text-6xl font-bold text-white font-heading mb-2">
                                    {clinic.name}
                                </h1>
                                <p className="text-zinc-300 text-lg flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-emerald-400" />
                                    {clinic.address}, {clinic.city}, {clinic.state}
                                </p>
                             </div>
                             
                             <div className="flex gap-4">
                                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center min-w-[100px]">
                                     <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-2xl">
                                         4.8 <Star className="w-5 h-5 fill-amber-400" />
                                     </div>
                                     <p className="text-zinc-300 text-xs uppercase tracking-wider">Rating</p>
                                 </div>
                                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center min-w-[100px]">
                                     <div className="text-white font-bold text-2xl">
                                         {doctors.length}+
                                     </div>
                                     <p className="text-zinc-300 text-xs uppercase tracking-wider">Doctors</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* --- Main Content --- */}
            <div className="container mx-auto px-4 max-w-7xl mt-12">
                <div className="grid lg:grid-cols-12 gap-10">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-8">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start rounded-xl p-0 h-auto bg-transparent border-b border-zinc-200 dark:border-zinc-800 mb-8 gap-8 overflow-x-auto no-scrollbar">
                                {['Overview', 'Doctors', 'Services', 'Reviews'].map((tab) => (
                                    <TabsTrigger 
                                        key={tab} 
                                        value={tab.toLowerCase()}
                                        className="rounded-none border-b-2 border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 px-4 py-3 text-lg font-medium data-[state=active]:bg-transparent transition-all"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <AnimatePresence mode="wait">
                                {/* OVERVIEW */}
                                <TabsContent value="overview" key="overview" className="mt-0 space-y-10">
                                    <section>
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">About {clinic.name}</h2>
                                        <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg">
                                            <p>
                                                {clinic.description || `${clinic.name} is a state-of-the-art medical facility dedicated to providing comprehensive healthcare services. Our team of experienced specialists uses the latest technology to ensure accurate diagnosis and effective treatment for all our patients.`}
                                            </p>
                                            <p className="mt-4">
                                                Located in the heart of {clinic.city}, we are committed to making quality healthcare accessible to everyone. We offer a wide range of medical services, from routine check-ups to complex surgical procedures.
                                            </p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4 mt-8">
                                            <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20">
                                                <CardContent className="p-4 flex gap-4 items-center">
                                                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                                                        <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Working Hours</h4>
                                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                                            {clinic.openingTime} - {clinic.closingTime}
                                                        </p>
                                                        <p className="text-zinc-500 dark:text-zinc-500 text-xs">Mon - Sat</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                                                <CardContent className="p-4 flex gap-4 items-center">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                                        <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Certified Facility</h4>
                                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">ISO 9001:2015 Certified</p>
                                                        <p className="text-zinc-500 dark:text-zinc-500 text-xs">Top Hygiene Standards</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </section>
                                    
                                    <Separator />

                                    <section>
                                         <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Gallery</h2>
                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {images.slice(0, 3).map((img: string, i: number) => (
                                                <div key={i} className="rounded-xl overflow-hidden h-48 md:h-64 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                                                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                            ))}
                                         </div>
                                    </section>
                                </TabsContent>

                                {/* DOCTORS */}
                                <TabsContent value="doctors" key="doctors" className="mt-0">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {doctors.length > 0 ? (
                                            doctors.map((doc: any) => (
                                                <Card key={doc._id} className="hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden cursor-pointer group" onClick={() => router.push(`/doctors/${doc._id}`)}>
                                                    <div className="flex p-4 gap-4">
                                                        <Avatar className="h-20 w-20 rounded-lg">
                                                            <AvatarImage src={doc.userId?.profileImage} className="object-cover" />
                                                            <AvatarFallback className="rounded-lg">{doc.userId?.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">{doc.userId?.name}</h3>
                                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{doc.specialization}</p>
                                                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9</span>
                                                                <span>&bull;</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.experience} Years</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <CardFooter className="bg-zinc-50 dark:bg-zinc-950 p-3 px-4 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800">
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">${doc.consultationFee}</span>
                                                        <Button size="sm" variant="ghost" className="text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-0 h-auto gap-1">
                                                            View Profile <ArrowRight className="w-4 h-4" />
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">
                                                No doctors currently listed for this clinic.
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* SERVICES */}
                                <TabsContent value="services" key="services" className="mt-0">
                                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {services.map((service: string, i: number) => (
                                            <Card key={i} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group cursor-default">
                                                <CardContent className="p-4 flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{service}</span>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>

                                {/* REVIEWS */}
                                <TabsContent value="reviews" key="reviews" className="mt-0">
                                 <ClinicReviews clinicId={id} clinicName={clinic.name} />
                                </TabsContent>
                            </AnimatePresence>
                        </Tabs>
                    </div>

                    {/* Right Column (Sticky Info) */}
                    <div className="lg:col-span-4">
                         <div className="sticky top-24 space-y-6">
                            {/* Contact Card */}
                             <Card className="border-none shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                                 <div className="h-2 bg-blue-500 w-full"></div>
                                 <CardHeader>
                                     <CardTitle>Contact Information</CardTitle>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                             <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                         </div>
                                         <div>
                                             <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Phone</p>
                                             <p className="font-medium text-zinc-900 dark:text-zinc-100">{clinic.phone}</p>
                                         </div>
                                     </div>
                                     <Separator />
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                                             <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                         </div>
                                         <div>
                                             <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Email</p>
                                             <p className="font-medium text-zinc-900 dark:text-zinc-100">{clinic.email || "contact@clinic.com"}</p>
                                         </div>
                                     </div>
                                      <Separator />
                                     <div className="flex items-start gap-3">
                                         <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md shrink-0">
                                             <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                         </div>
                                         <div>
                                             <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Address</p>
                                             <p className="font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                                                 {clinic.address}<br/>
                                                 {clinic.city}, {clinic.state} {clinic.zipCode}
                                             </p>
                                         </div>
                                     </div>
                                 </CardContent>
                                 <CardFooter className="pt-0 pb-6">
                                     <Button className="w-full gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
                                         Get Directions <Share2 className="w-4 h-4" />
                                     </Button>
                                 </CardFooter>
                             </Card>

                             {/* Map Widget */}
                             <div className="rounded-xl overflow-hidden h-64 border border-zinc-200 dark:border-zinc-800 shadow-sm relative group">
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    className="filter grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(clinic.name + " " + clinic.city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                ></iframe>
                             </div>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function ClinicSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
             <div className="h-[400px] bg-zinc-200 dark:bg-zinc-900 animate-pulse"></div>
             <div className="container mx-auto px-4 max-w-7xl mt-12 grid lg:grid-cols-12 gap-10">
                 <div className="lg:col-span-8 space-y-8">
                     <Skeleton className="h-12 w-full rounded-xl" />
                     <Skeleton className="h-64 w-full rounded-xl" />
                 </div>
                 <div className="lg:col-span-4">
                     <Skeleton className="h-96 w-full rounded-xl" />
                 </div>
             </div>
        </div>
    )
}

function ClinicReviews({ clinicId, clinicName }: { clinicId: string, clinicName?: string }) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const { data: reviews = [] } = useQuery({
        queryKey: ['clinic-reviews', clinicId],
        queryFn: () => clinicService.getReviews(clinicId),
    });

    const createReviewMutation = useMutation({
        mutationFn: clinicService.createReview,
        onSuccess: () => {
            toast.success("Review submitted successfully!");
            setIsOpen(false);
            setRating(0);
            setComment("");
            queryClient.invalidateQueries({ queryKey: ['clinic-reviews', clinicId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to submit review");
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
        createReviewMutation.mutate({ clinicId, rating, comment });
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
        <div className="space-y-8">
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
                                            How was your visit to {clinicName}?
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
                                                className="h-32 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" 
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleSubmit} disabled={createReviewMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
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
