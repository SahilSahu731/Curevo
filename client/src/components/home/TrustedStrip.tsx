"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const brands = [
    "Apollo Hospitals", 
    "Max Healthcare", 
    "Fortis", 
    "Dr. Lal PathLabs", 
    "Medanta", 
    "Manipal Hospitals", 
    "Aster DM",
    "Narayana Health"
];

// Duplicate for marquee effect
const marqueeBrands = [...brands, ...brands, ...brands];

export default function TrustedStrip() {
    return (
        <section className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6 overflow-hidden">
            <div className="container mx-auto px-4 mb-4 text-center">
                 <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Trusted by leading healthcare providers</p>
            </div>
            
            <div className="relative flex w-full overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 dark:from-gray-900 z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 dark:from-gray-900 z-10"></div>

                <motion.div 
                    className="flex whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{ 
                        repeat: Infinity, 
                        ease: "linear", 
                        duration: 30 
                    }}
                >
                    {marqueeBrands.map((brand, i) => (
                        <div key={i} className="inline-flex items-center mx-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{brand}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
