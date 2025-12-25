"use client";

import { Medicine } from "@/lib/services/medicineService";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Pill, FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicine: Medicine) => void;
}

export function MedicineCard({ medicine, onAddToCart }: MedicineCardProps) {
  const discount = medicine.originalPrice 
    ? Math.round(((medicine.originalPrice - medicine.price) / medicine.originalPrice) * 100) 
    : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group">
        <div className="relative h-40 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 transition-colors">
            {/* Placeholder Icon illustration since we don't have real images */}
           <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm">
             <Pill className="w-12 h-12 text-blue-500" />
           </div>
           
           {discount > 0 && (
             <Badge className="absolute top-3 left-3 bg-rose-500 hover:bg-rose-600">
               {discount}% OFF
             </Badge>
           )}
           
           {medicine.prescriptionRequired && (
               <Badge variant="outline" className="absolute top-3 right-3 border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20">
                   Rx Required
               </Badge>
           )}
        </div>

        <CardContent className="flex-1 p-5">
          <div className="mb-2">
             <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                {medicine.dosageForm}
             </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">
            {medicine.name}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
             By {medicine.manufacturer}
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4">
            {medicine.description}
          </p>
          <div className="text-xs text-slate-400">
            Pack size: {medicine.packSize}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 mt-auto flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">₹{medicine.price}</span>
            {medicine.originalPrice && (
              <span className="ml-2 text-xs text-slate-400 line-through">₹{medicine.originalPrice}</span>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={() => onAddToCart(medicine)} 
            className="bg-blue-600 hover:bg-blue-700 rounded-full h-9 w-9 p-0 md:w-auto md:px-4 md:h-10"
          >
             <Plus className="w-5 h-5 md:hidden" />
             <span className="hidden md:flex items-center gap-2">
                Add <ShoppingCart className="w-4 h-4" />
             </span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
