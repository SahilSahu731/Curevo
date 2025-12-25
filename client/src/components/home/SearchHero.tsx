"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    // Use 'name' for doctor name search (more semantic than 'q')
    if (searchQuery.trim()) params.set("name", searchQuery.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/doctors?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/doctors?specialization=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="relative w-full min-h-[500px] md:min-h-[600px] flex items-center justify-center bg-[#023e8a] overflow-hidden">
      {/* Background - Fiverr Green equivalent is our Curevo Blue */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#023e8a]/90 to-[#0077b6]/80"></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading tracking-tight"
        >
          Find the perfect <span className="font-serif italic text-blue-200">doctor</span> for you.
        </motion.h1>
        
        <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSearch}
            className="hidden md:flex max-w-2xl mx-auto bg-white rounded-md overflow-hidden shadow-2xl p-1.5"
        >
            <div className="flex-1 flex items-center px-4 border-r border-gray-200">
                <Search className="text-gray-400 h-5 w-5 mr-3" />
                <input 
                    type="text" 
                    placeholder="Doctor name or specialization..." 
                    className="w-full h-12 outline-none text-gray-700 placeholder-gray-400 font-body"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className="flex-1 flex items-center px-4">
                 <MapPin className="text-gray-400 h-5 w-5 mr-3" />
                 <input 
                    type="text" 
                    placeholder="City or Zip code" 
                    className="w-full h-12 outline-none text-gray-700 placeholder-gray-400 font-body"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <Button type="submit" size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 h-12 rounded-sm text-lg">
                Search
            </Button>
        </motion.form>

        {/* Mobile Search */}
        <div className="md:hidden max-w-sm mx-auto space-y-3">
             <div className="flex items-center bg-white rounded-md p-3 shadow-lg">
                 <Search className="text-gray-400 h-5 w-5 mr-3" />
                 <input 
                    type="text" 
                    placeholder="Doctor name..." 
                    className="w-full outline-none text-gray-700" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                 />
             </div>
             <Button 
                onClick={() => handleSearch()}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-md"
             >
                Search
             </Button>
        </div>

        <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.3 }}
             className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-blue-100 font-medium font-body"
        >
            <span className="opacity-70">Popular:</span>
            {['Dermatology', 'Cardiology', 'Dentistry', 'Neurology', 'Pediatrics'].map(tag => (
                <button 
                    key={tag} 
                    onClick={() => handleTagClick(tag)}
                    className="border border-white/30 rounded-full px-3 py-1 hover:bg-white/10 cursor-pointer transition-colors"
                >
                    {tag}
                </button>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
