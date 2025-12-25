"use client";

import { LabTest } from "@/lib/services/labService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Tag, Activity, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface LabTestCardProps {
  test: LabTest;
  onBook: (test: LabTest) => void;
}

export function LabTestCard({ test, onBook }: LabTestCardProps) {
  const discount = test.originalPrice 
    ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100) 
    : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-6">
            <div className="flex justify-between items-start mb-4">
              <Badge variant={test.popular ? "default" : "secondary"} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur text-blue-700 dark:text-blue-300 pointer-events-none">
                {test.category}
              </Badge>
              {discount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {discount}% OFF
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">
              {test.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">
            {test.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span>Results in {test.reportsIn}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <Activity className="w-4 h-4 mr-2 text-green-500" />
              <span>{test.testCount ? `${test.testCount} Tests Included` : 'Single Test'}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <Tag className="w-4 h-4 mr-2 text-amber-500" />
              <span>{test.fasting ? 'Fasting Required' : 'No Fasting Required'}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{test.price}</span>
            {test.originalPrice && (
              <span className="ml-2 text-sm text-slate-400 line-through">₹{test.originalPrice}</span>
            )}
          </div>
          <Button onClick={() => onBook(test)} className="bg-blue-600 hover:bg-blue-700">
            Book Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
