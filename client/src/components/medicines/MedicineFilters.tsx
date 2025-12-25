"use client";

import { MedicineCategory } from "@/lib/services/medicineService";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MedicineFiltersProps {
  categories: MedicineCategory[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function MedicineFilters({ categories, activeCategory, onSelectCategory }: MedicineFiltersProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2 pb-1">
            <Button
              variant={activeCategory === 'all' ? "default" : "outline"}
              onClick={() => onSelectCategory('all')}
              className={cn(
                "rounded-full transition-all border",
                activeCategory === 'all' 
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600" 
                  : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400"
              )}
            >
              All Medicines
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.slug ? "default" : "outline"}
                onClick={() => onSelectCategory(category.slug)}
                className={cn(
                  "rounded-full transition-all border",
                  activeCategory === category.slug 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600" 
                    : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200"
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </div>
  );
}
