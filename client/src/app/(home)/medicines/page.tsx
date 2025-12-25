"use client";

import { useState, useEffect } from "react";
import { MedicineHero } from "@/components/medicines/MedicineHero";
import { MedicineFilters } from "@/components/medicines/MedicineFilters";
import { MedicineCard } from "@/components/medicines/MedicineCard";
import { getMedicineCategories, getMedicines, MedicineCategory, Medicine } from "@/lib/services/medicineService";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, PackageX } from "lucide-react";
import { toast } from "sonner";

export default function MedicinesPage() {
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [displayMedicines, setDisplayMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, meds] = await Promise.all([
          getMedicineCategories(),
          getMedicines()
        ]);
        setCategories(cats);
        setAllMedicines(meds);
        setDisplayMedicines(meds);
      } catch (error) {
        console.error("Failed to fetch medicines data", error);
        toast.error("Failed to load medicines. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = allMedicines;

    // Category filter
    if (activeCategory !== 'all') {
      if (activeCategory === 'popular') {
        filtered = filtered.filter(m => m.popular);
      } else {
        filtered = filtered.filter(m => m.category === activeCategory);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.description.toLowerCase().includes(query) ||
        m.manufacturer.toLowerCase().includes(query)
      );
    }

    setDisplayMedicines(filtered);
  }, [activeCategory, searchQuery, allMedicines]);

  const handleAddToCart = (medicine: Medicine) => {
    // In a real app, this would add to a cart context/store
    toast.success(`${medicine.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <MedicineHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <MedicineFilters 
        categories={categories} 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
      />

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
        ) : (
            <>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {activeCategory === 'all' ? 'All Products' : categories.find(c => c.slug === activeCategory)?.name || 'Products'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Showing {displayMedicines.length} product{displayMedicines.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <AnimatePresence mode='popLayout'>
                    {displayMedicines.length > 0 ? (
                        <motion.div 
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {displayMedicines.map((medicine) => (
                                <MedicineCard key={medicine.id} medicine={medicine} onAddToCart={handleAddToCart} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <div className="bg-slate-100 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <PackageX className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No medicines found</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                We couldn't find any products matching your criteria. Try adjusting your search or filters.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        )}
      </div>
    </div>
  );
}
