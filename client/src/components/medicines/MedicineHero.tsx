"use client";

import { motion } from "framer-motion";
import { Search, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MedicineHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function MedicineHero({ searchQuery, setSearchQuery }: MedicineHeroProps) {
  return (
    <div className="relative overflow-hidden bg-emerald-900 py-20 lg:py-28">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-20">
         <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500 blur-3xl" />
         <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-teal-400 blur-3xl opacity-50" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-700 text-emerald-300 text-sm font-medium mb-6"
          >
            <ShoppingBag className="w-4 h-4" /> Internet Pharmacy
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl mb-6"
          >
            Your Daily Dose of <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Wellness & Care</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 text-lg text-emerald-100/80 sm:text-xl max-w-2xl mx-auto"
          >
            Genuine medicines, supplements, and healthcare products delivered to your doorstep. Safe, fast, and reliable.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative mx-auto max-w-lg"
          >
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-100" />
              <Input 
                type="text" 
                placeholder="Search compounds like 'Paracetamol' or 'Vitamin C'" 
                className="h-12 w-full dark:text-slate-200 text-slate-100 rounded-full border-0 bg-white/10 pl-12 pr-4 text-white placeholder-emerald-200/50 backdrop-blur focus:bg-white/20 focus:ring-2 focus:ring-emerald-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
