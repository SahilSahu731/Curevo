"use client";

import { LabCategory } from "@/lib/services/labService";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LabFiltersProps {
  categories: LabCategory[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function LabFilters({ categories, activeCategory, onSelectCategory }: LabFiltersProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2 pb-1">
            <Button
              variant={activeCategory === 'all' ? "default" : "outline"}
              onClick={() => onSelectCategory('all')}
              className={cn(
                "rounded-full transition-all",
                activeCategory === 'all' 
                  ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900" 
                  : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              )}
            >
              All Tests
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.slug ? "default" : "outline"}
                onClick={() => onSelectCategory(category.slug)}
                className={cn(
                  "rounded-full transition-all",
                  activeCategory === category.slug 
                    ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600" 
                    : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800"
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
