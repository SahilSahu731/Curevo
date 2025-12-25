"use client";

import { useQuery } from "@tanstack/react-query";
import { clinicService } from "@/lib/services/clinicService";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Search, 
    MapPin, 
    Filter, 
    Hospital,
    Star,
    Clock,
    Phone,
    ArrowRight,
    Map
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ClinicsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    
    // Fetch Clinics
    const { data: clinicsRes, isLoading, isError } = useQuery({
        queryKey: ['clinics'],
        queryFn: clinicService.getAllClinics
    });

    const clinics = clinicsRes?.data || [];

    // Helper: Check if clinic is open
    const checkIsOpen = (clinic: any) => {
        if (!clinic.openingTime || !clinic.closingTime) return false;
        
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];

        // Check Working Days
        if (clinic.workingDays && !clinic.workingDays.includes(currentDay)) {
            return false;
        }

        const [openH, openM] = clinic.openingTime.split(':').map(Number);
        const [closeH, closeM] = clinic.closingTime.split(':').map(Number);
        
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = openH * 60 + openM;
        const endMinutes = closeH * 60 + closeM;

        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    };

    // Filter Logic
    const toggleFilter = (filter: string) => {
        setActiveFilters(prev => 
            prev.includes(filter) 
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const filteredClinics = clinics.filter((clinic: any) => {
        const matchesSearch = 
            clinic.name.toLowerCase().includes(search.toLowerCase()) ||
            clinic.city.toLowerCase().includes(search.toLowerCase()) ||
            clinic.address.toLowerCase().includes(search.toLowerCase());

        const isOpen = checkIsOpen(clinic);

        // Apply Filters
        if (activeFilters.includes('Open Now') && !isOpen) return false;
        // Other filters like '24/7' would need data support, ignoring for now or assuming false

        return matchesSearch;
    });

    const filters = ['Open Now', '24/7', 'Parking Available', 'Wheelchair Access'];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-body mb-20 dark:text-zinc-200">
             {/* --- Hero Section --- */}
             <div className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 pb-12 pt-28">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6 font-heading tracking-tight">
                            Find Top-Rated <span className="text-emerald-600 dark:text-emerald-400">Clinics</span> Near You
                        </h1>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                            Discover accredited medical facilities with state-of-the-art technology and experienced specialists. Book appointments instantly.
                        </p>
                        
                        <div className="flex gap-2 relative">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <Input 
                                    className="pl-10 h-12 text-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500 dark:focus:ring-emerald-500 rounded-xl"
                                    placeholder="Search by clinic name, city, or address..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button className="h-12 w-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl shrink-0">
                                <Filter className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
             </div>

             {/* --- Clinics Grid --- */}
             <div className="container mx-auto px-4 max-w-7xl mt-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold font-heading text-zinc-900 dark:text-white">
                        {filteredClinics.length} {filteredClinics.length === 1 ? 'Facilities' : 'Facilities'} Found
                    </h2>
                    
                    {/* Tags/Filters */}
                    <div className="hidden md:flex gap-3">
                         {filters.map(tag => (
                             <Badge 
                                key={tag} 
                                variant={activeFilters.includes(tag) ? "default" : "outline"}
                                className={`px-3 py-1.5 cursor-pointer font-medium transition-colors ${
                                    activeFilters.includes(tag) 
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent" 
                                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                                }`}
                                onClick={() => toggleFilter(tag)}
                             >
                                 {tag}
                             </Badge>
                         ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                             <div key={i} className="h-96 bg-zinc-200 dark:bg-zinc-900 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredClinics.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredClinics.map((clinic: any) => {
                            const isOpen = checkIsOpen(clinic);
                            return (
                                <motion.div 
                                    key={clinic._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card 
                                        className="group overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-500 cursor-pointer h-full flex flex-col"
                                        onClick={() => router.push(`/clinics/${clinic._id}`)}
                                    >
                                        {/* Image Cover */}
                                        <div className="h-48 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                            <img 
                                                src={clinic.images?.[0] || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"} 
                                                alt={clinic.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                            />
                                            {/* Top Right Badges */}
                                            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
                                                <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 4.8
                                                </div>
                                                <Badge className={`border-none ${isOpen ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                                    {isOpen ? 'Open Now' : 'Closed'}
                                                </Badge>
                                            </div>
                                            
                                            <div className="absolute bottom-4 left-4 z-20 text-white">
                                                <div className="flex items-center gap-1.5 text-xs font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded-md text-zinc-100 w-fit mb-1 border border-white/10">
                                                    <Clock className="w-3 h-3" /> {clinic.openingTime} - {clinic.closingTime}
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="p-6 flex-1">
                                            <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                {clinic.name}
                                            </h3>
                                            <div className="flex items-start gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                                                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
                                                <span className="line-clamp-2">{clinic.address}, {clinic.city}</span>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {(clinic.services || ['General Medicine', 'Consultation', 'Emergency']).slice(0, 3).map((s: string, i: number) => (
                                                    <span key={i} className="text-[10px] uppercase font-bold tracking-wider bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-sm">
                                                        {s}
                                                    </span>
                                                ))}
                                                {(clinic.services?.length || 3) > 3 && (
                                                    <span className="text-[10px] uppercase font-bold tracking-wider bg-zinc-50 dark:bg-zinc-900 text-zinc-400 px-2 py-1 rounded-sm">
                                                        +{(clinic.services?.length || 3) - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="p-6 pt-0 mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900/50 pt-4">
                                            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                                <Phone className="w-4 h-4" />
                                                <span>{clinic.phone || 'Contact'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                                                Details <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
                            <Hospital className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No clinics found</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">We couldn't find any clinics matching "{search}". Try searching for a different name or city.</p>
                        <Button 
                            variant="link" 
                            className="mt-4 text-emerald-600 dark:text-emerald-400"
                            onClick={() => setSearch("")}
                        >
                            View All Clinics
                        </Button>
                    </div>
                )}
             </div>
        </div>
    );
}
