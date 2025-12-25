"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    MapPin, 
    Briefcase, 
    Clock, 
    ArrowRight, 
    Zap, 
    Coffee, 
    Globe, 
    Heart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CareersPage() {
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    const departments = ["All", "Engineering", "Medical", "Product", "Operations", "Design"];

    const jobs = [
        {
            id: 1,
            title: "Senior Backend Engineer",
            department: "Engineering",
            location: "Remote / New York",
            type: "Full-time",
            tags: ["Node.js", "MongoDB", "AWS"],
            posted: "2 days ago"
        },
        {
            id: 2,
            title: "Product Designer",
            department: "Design",
            location: "San Francisco, CA",
            type: "Full-time",
            tags: ["Figma", "UI/UX", "Mobile"],
            posted: "1 week ago"
        },
        {
            id: 3,
            title: "Medical Director",
            department: "Medical",
            location: "London, UK",
            type: "Full-time",
            tags: ["Leadership", "Clinical", "MD"],
            posted: "3 days ago"
        },
        {
            id: 4,
            title: "Customer Success Manager",
            department: "Operations",
            location: "Remote",
            type: "Full-time",
            tags: ["Support", "SaaS", "HubSpot"],
            posted: "Just now"
        },
        {
            id: 5,
            title: "Frontend Developer",
            department: "Engineering",
            location: "Remote / Berlin",
            type: "Contract",
            tags: ["React", "Next.js", "Tailwind"],
            posted: "5 days ago"
        }
    ];

    const benefits = [
        { icon: Globe, title: "Remote-First", desc: "Work from anywhere in the world." },
        { icon: Heart, title: "Health Insurance", desc: "Comprehensive medical, dental, and vision." },
        { icon: Zap, title: "Learning Budget", desc: "$1000/year for courses and conferences." },
        { icon: Coffee, title: "Team Retreats", desc: "Bi-annual meetups in exotic locations." }
    ];

    const filteredJobs = jobs.filter(job => 
        (filter === "All" || job.department === filter) &&
        (job.title.toLowerCase().includes(search.toLowerCase()) || 
         job.location.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-body">
            {/* --- Hero --- */}
            <div className="bg-zinc-900 text-white relative overflow-hidden pt-32 pb-24">
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-900/40 to-transparent"></div>
                 <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl"></div>
                 
                 <div className="container mx-auto px-4 text-center relative z-10">
                     <Badge className="bg-white/10 text-emerald-300 hover:bg-white/20 mb-6 px-4 py-1 backdrop-blur-md border-white/10">We're Hiring</Badge>
                     <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight">
                         Join the <span className="text-emerald-400">Revolution</span> in Healthcare
                     </h1>
                     <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                         Build the future of medical access with a team that cares. We're looking for passionate individuals to solve hard problems.
                     </p>
                     
                     <div className="max-w-xl mx-auto relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                         <Input 
                            className="h-14 pl-12 rounded-full bg-white/10 border-white/10 text-white placeholder:text-zinc-400 focus:bg-white/20 transition-all text-lg"
                            placeholder="Search jobs (e.g. Engineer, Design)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                         />
                     </div>
                 </div>
            </div>

            {/* --- Benefits --- */}
            <div className="py-20 container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-6">
                    {benefits.map((b, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                             <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                                 <b.icon className="w-6 h-6" />
                             </div>
                             <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">{b.title}</h3>
                             <p className="text-zinc-500 dark:text-zinc-400 text-sm">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Jobs List --- */}
            <div className="bg-white dark:bg-zinc-950 py-20 min-h-[600px]" id="jobs">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white font-heading">Open Positions</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Come do your best work with us.</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                             {departments.map((dept) => (
                                 <Button 
                                    key={dept} 
                                    variant={filter === dept ? "default" : "outline"}
                                    onClick={() => setFilter(dept)}
                                    className={`rounded-full ${filter === dept ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                                 >
                                     {dept}
                                 </Button>
                             ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <motion.div
                                        key={job.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer group border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                                                        <Badge variant="secondary" className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{job.department}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                                                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type}</span>
                                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.posted}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="hidden md:flex gap-2">
                                                        {job.tags.map(tag => (
                                                            <span key={tag} className="text-xs font-medium px-2 py-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <Button className="rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black">
                                                        Apply <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No jobs found</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400">Try adjusting your filters.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
