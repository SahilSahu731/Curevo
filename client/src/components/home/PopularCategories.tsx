"use client";

import { motion } from "framer-motion";
import { Stethoscope, Heart, Brain, Eye, Bone, Baby, Syringe, Pill } from "lucide-react";
import Link from "next/link";

// GFG / Fiverr Style Tile Grid
const categories = [
    { name: "General", icon: Stethoscope, color: "bg-blue-100 text-blue-600" },
    { name: "Cardiology", icon: Heart, color: "bg-rose-100 text-rose-600" },
    { name: "Neurology", icon: Brain, color: "bg-purple-100 text-purple-600" },
    { name: "Ophthalmology", icon: Eye, color: "bg-amber-100 text-amber-600" },
    { name: "Orthopedics", icon: Bone, color: "bg-slate-100 text-slate-600" },
    { name: "Pediatrics", icon: Baby, color: "bg-pink-100 text-pink-600" },
    { name: "Vaccination", icon: Syringe, color: "bg-emerald-100 text-emerald-600" },
    { name: "Medicine", icon: Pill, color: "bg-teal-100 text-teal-600" },
];

export default function PopularCategories() {
    return (
        <section className="py-16 w-full bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-4 max-w-7xl">
                <h2 className="text-3xl font-bold font-heading text-slate-900 dark:text-white mb-8">Popular Specializations</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((cat, i) => (
                        <Link href={`/doctors?specialization=${cat.name}`} key={i} className="contents">
                            <motion.div 
                                whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                                className="bg-white dark:bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center gap-4 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all h-40 text-center shadow-sm"
                            >
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${cat.color} bg-opacity-20`}>
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-300 font-body text-sm">{cat.name}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
