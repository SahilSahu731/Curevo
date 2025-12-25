"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LabHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function LabHero({ searchQuery, setSearchQuery }: LabHeroProps) {
  return (
    <div className="relative overflow-hidden bg-slate-900 py-20 lg:py-28">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-20">
         <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600 blur-3xl" />
         <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-indigo-500 blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
         <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-600 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl mb-6"
          >
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Diagnostic Tests</span> <br/> for a Healthier You
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 text-lg text-slate-300 sm:text-xl"
          >
            Book trusted lab tests online. Home sample collection, accurate reports within 24 hours, and expert consultation included.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative mx-auto max-w-lg"
          >
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search for tests (e.g. Thyroid, Vitamin D, CBC)" 
                className="h-12 w-full rounded-full border-0 bg-white/10 pl-12 pr-4 text-white placeholder-slate-400 backdrop-blur focus:bg-white/20 focus:ring-2 focus:ring-blue-500"
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
