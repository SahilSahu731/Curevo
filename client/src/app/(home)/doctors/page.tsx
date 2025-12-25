
"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { doctorService } from "@/lib/services/doctorService";
import { 
    Search, 
    Filter, 
    MapPin, 
    Stethoscope, 
    Clock, 
    ArrowRight,
    Star,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Card, 
    CardContent, 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

// --- Specializations (In real app, fetch from DB) ---
const SPECIALIZATIONS = [
  "All",
  "General Medicine", 
  "Cardiology", 
  "Dermatology", 
  "Neurology", 
  "Pediatrics", 
  "Orthopedics", 
  "Psychiatry", 
  "Ophthalmology", 
  "Dentistry", 
  "ENT"
];

function DoctorsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Initialize state from URL params - using semantic param names
    const [name, setName] = useState(searchParams.get("name") || "");
    const [specialization, setSpecialization] = useState(searchParams.get("specialization") || "All");
    const [feeRange, setFeeRange] = useState([
        parseInt(searchParams.get("minFee") || "0"), 
        parseInt(searchParams.get("maxFee") || "500")
    ]);
    const [gender, setGender] = useState<string | undefined>(searchParams.get("gender") || undefined);
    const [sort, setSort] = useState(searchParams.get("sort") || "recommended");
    const [location, setLocation] = useState(searchParams.get("location") || "");

    // Debounce search
    const [debouncedName, setDebouncedName] = useState(name);
    
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedName(name), 500);
        return () => clearTimeout(timer);
    }, [name]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedName) params.set("name", debouncedName);
        if (specialization && specialization !== "All") params.set("specialization", specialization);
        if (feeRange[0] > 0) params.set("minFee", feeRange[0].toString());
        if (feeRange[1] < 500) params.set("maxFee", feeRange[1].toString());
        if (gender) params.set("gender", gender);
        if (sort && sort !== "recommended") params.set("sort", sort);
        if (location) params.set("location", location);
        
        const newUrl = params.toString() ? `?${params.toString()}` : "";
        router.replace(`/doctors${newUrl}`, { scroll: false });
    }, [debouncedName, specialization, feeRange, gender, sort, location, router]);

    // --- Query - send 'search' to backend (backend expects 'search' for doctor name) ---
    const { data: doctorsData, isLoading } = useQuery({
        queryKey: ['doctors', debouncedName, specialization, feeRange, gender, sort, location],
        queryFn: () => doctorService.getAllDoctors({
            search: debouncedName || undefined, // Backend uses 'search' for name filter
            specialization: specialization === "All" ? undefined : specialization,
            minFee: feeRange[0],
            maxFee: feeRange[1],
            gender: gender,
            sort: sort === 'recommended' ? undefined : sort
        })
    });

    const doctors = doctorsData?.data || [];

    const clearFilters = () => {
        setName("");
        setSpecialization("All");
        setFeeRange([0, 500]);
        setGender(undefined);
        setSort("recommended");
        setLocation("");
        router.replace("/doctors", { scroll: false });
    };

    const hasActiveFilters = name || specialization !== "All" || feeRange[0] > 0 || feeRange[1] < 500 || gender || sort !== "recommended" || location;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
            {/* --- Hero Section --- */}
            <div className="relative overflow-hidden bg-slate-900 text-white py-24 mb-10">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl"></div>
                
                <div className="container mx-auto max-w-7xl px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className="mb-6 px-4 py-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 backdrop-blur-sm rounded-full text-sm uppercase tracking-widest font-semibold">
                            World-Class Care
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            Find Your <span className="text-emerald-400">Specialist</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Book appointments with top-rated doctors across various specializations. 
                            Prioritize your health with our seamless, premium experience.
                        </p>
                        
                        {/* Show active search query */}
                        {(searchParams.get("name") || searchParams.get("specialization")) && (
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {searchParams.get("name") && (
                                    <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                                        Doctor: "{searchParams.get("name")}"
                                        <button onClick={() => setName("")} className="ml-2 hover:text-red-300">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                )}
                                {searchParams.get("specialization") && searchParams.get("specialization") !== "All" && (
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1">
                                        {searchParams.get("specialization")}
                                        <button onClick={() => setSpecialization("All")} className="ml-2 hover:text-red-300">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6">
                <div className="grid lg:grid-cols-4 gap-8">
                    
                    {/* --- Sidebar Filters --- */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-md sticky top-24">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="flex items-center gap-2 text-lg font-bold">
                                        <Filter className="h-5 w-5" /> Filters
                                    </h3>
                                    {hasActiveFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-destructive">
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Doctor Name Search */}
                                    <div className="space-y-2">
                                        <Label>Doctor Name</Label>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search by name..." 
                                                className="pl-9"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <Label>Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="City or Zip..." 
                                                className="pl-9"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Specialization */}
                                    <div className="space-y-2">
                                        <Label>Specialization</Label>
                                        <Select value={specialization} onValueChange={setSpecialization}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Specialization" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SPECIALIZATIONS.map((spec) => (
                                                    <SelectItem key={spec} value={spec}>
                                                        {spec}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Fee Range */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label>Consultation Fee</Label>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                ${feeRange[0]} - ${feeRange[1]}
                                            </span>
                                        </div>
                                        <Slider 
                                            defaultValue={[0, 500]} 
                                            max={1000} 
                                            step={10} 
                                            value={feeRange}
                                            onValueChange={setFeeRange}
                                            className="py-4"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-2">
                                        <Label>Doctor Gender</Label>
                                        <Select value={gender || "any"} onValueChange={(v) => setGender(v === "any" ? undefined : v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Any Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="any">Any Gender</SelectItem>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator />
                                    
                                    <Button variant="secondary" className="w-full" onClick={clearFilters}>
                                        Reset Filters
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* --- Main Content --- */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Top Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border">
                            <p className="text-muted-foreground font-medium">
                                Showing <span className="text-foreground font-bold">{doctors.length}</span> results
                            </p>
                            
                            <div className="flex items-center gap-2">
                                <Label className="whitespace-nowrap">Sort by:</Label>
                                <Select value={sort} onValueChange={setSort}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Recommended" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="recommended">Recommended</SelectItem>
                                        <SelectItem value="fee_asc">Price: Low to High</SelectItem>
                                        <SelectItem value="fee_desc">Price: High to Low</SelectItem>
                                        <SelectItem value="experience_desc">Experience: High</SelectItem>
                                        <SelectItem value="experience_asc">Experience: Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="grid gap-6">
                            {isLoading ? (
                                // Loading Skeletons
                                Array(5).fill(0).map((_, i) => (
                                    <Card key={i} className="p-6">
                                        <div className="flex gap-6">
                                            <Skeleton className="h-24 w-24 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-6 w-1/3" />
                                                <Skeleton className="h-4 w-1/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : doctors.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-dashed">
                                    <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <h3 className="text-lg font-semibold">No doctors found</h3>
                                    <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                                    <Button variant="link" onClick={clearFilters} className="mt-2">Clear all filters</Button>
                                </div>
                            ) : (
                                doctors.map((doctor: any) => (
                                    <DoctorCard key={doctor._id} doctor={doctor} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Specific Doctor Card Component ---
function DoctorCard({ doctor }: { doctor: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none shadow-md bg-white dark:bg-zinc-900">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        {/* Image & Quick Stats */}
                        <div className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-950/50 p-6 flex flex-col items-center justify-center border-r border-zinc-100 dark:border-zinc-800 shrink-0">
                             <Avatar className="h-32 w-32 border-4 border-white dark:border-zinc-800 shadow-md mb-4">
                                <AvatarImage src={doctor.userId?.profileImage} alt={doctor.userId?.name} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                    {doctor.userId?.name?.[0] || "D"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Consultation Fee</div>
                                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-500">${doctor.consultationFee}</div>
                            </div>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                                            <Link href={`/doctors/${doctor._id}`}>{doctor.userId?.name}</Link>
                                        </h3>
                                        <p className="text-primary font-medium flex items-center gap-1.5 text-sm mt-0.5">
                                            <Stethoscope className="h-3.5 w-3.5" />
                                            {doctor.specialization}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={`${doctor.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        {doctor.isAvailable ? 'Available' : 'Unavailable'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-secondary rounded-full">
                                            <Clock className="h-3.5 w-3.5 text-foreground" />
                                        </div>
                                        <span>{doctor.experience} Years Exp.</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <div className="p-1.5 bg-secondary rounded-full">
                                            <MapPin className="h-3.5 w-3.5 text-foreground" />
                                        </div>
                                        <span className="truncate max-w-[150px]" title={doctor.clinicId?.name}>{doctor.clinicId?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                         <div className="p-1.5 bg-secondary rounded-full">
                                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                        </div>
                                        <span className="text-foreground font-medium">4.9</span>
                                        <span className="text-xs">(120 Reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="flex items-center justify-between gap-4">
                                <Link href={`/doctors/${doctor._id}`} className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        View Profile
                                    </Button>
                                </Link>
                                <Link href={`/book?doctorId=${doctor._id}&doctorName=${encodeURIComponent(doctor.userId?.name || '')}&specialization=${encodeURIComponent(doctor.specialization || '')}&fee=${doctor.consultationFee}&clinicId=${doctor.clinicId?._id || ''}`} className="flex-1">
                                    <Button className="w-full group bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                                        Book Now
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function DoctorsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <DoctorsPageContent />
        </Suspense>
    );
}
