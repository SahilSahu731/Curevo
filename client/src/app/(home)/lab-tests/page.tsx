"use client";

import { useState, useEffect } from "react";
import { LabHero } from "@/components/labs/LabHero";
import { LabFilters } from "@/components/labs/LabFilters";
import { LabTestCard } from "@/components/labs/LabTestCard";
import { BookTestModal } from "@/components/labs/BookTestModal";
import { getLabCategories, getLabTests, LabCategory, LabTest } from "@/lib/services/labService";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

export default function LabTestsPage() {
  const [categories, setCategories] = useState<LabCategory[]>([]);
  const [allTests, setAllTests] = useState<LabTest[]>([]);
  const [displayTests, setDisplayTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, tests] = await Promise.all([
          getLabCategories(),
          getLabTests()
        ]);
        setCategories(cats);
        setAllTests(tests);
        setDisplayTests(tests);
      } catch (error) {
        console.error("Failed to fetch lab data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = allTests;

    // Category filter
    if (activeCategory !== 'all') {
      if (activeCategory === 'popular') {
        filtered = filtered.filter(t => t.popular);
      } else {
        filtered = filtered.filter(t => t.category === activeCategory);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      );
    }

    setDisplayTests(filtered);
  }, [activeCategory, searchQuery, allTests]);

  const handleBook = (test: LabTest) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <LabHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <LabFilters 
        categories={categories} 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
      />

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
            <>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {activeCategory === 'all' ? 'All Tests' : categories.find(c => c.slug === activeCategory)?.name || 'Tests'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Showing {displayTests.length} result{displayTests.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <AnimatePresence mode='popLayout'>
                    {displayTests.length > 0 ? (
                        <motion.div 
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {displayTests.map((test) => (
                                <LabTestCard key={test.id} test={test} onBook={handleBook} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <div className="bg-slate-100 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No tests found</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                We couldn't find any tests matching your criteria. Try adjusting your search or filters.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        )}
      </div>

      <BookTestModal 
        test={selectedTest} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
