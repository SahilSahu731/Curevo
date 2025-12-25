"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Heart, 
  Scale, 
  Activity, 
  ArrowRight, 
  Moon, 
  Droplets, 
  Eye, 
  Dumbbell, 
  Apple 
} from "lucide-react";

export interface HealthTool {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  questions: number;
  duration: string;
}

export const healthTools: HealthTool[] = [
  {
    id: "stress",
    title: "Stress & Anxiety Test",
    description: "Evaluate your mental well-being with our clinical-grade PSS assessment.",
    icon: Brain,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    questions: 10,
    duration: "5 min"
  },
  {
    id: "heart",
    title: "Heart Health Risk",
    description: "Assess your cardiovascular risk based on lifestyle and health metrics.",
    icon: Heart,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    questions: 12,
    duration: "6 min"
  },
  {
    id: "bmi",
    title: "BMI & Body Analysis",
    description: "Advanced body composition calculator with metabolic insights.",
    icon: Scale,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    questions: 6,
    duration: "3 min"
  },
  {
    id: "sleep",
    title: "Sleep Quality Score",
    description: "Analyze your sleep patterns and get tips for better rest.",
    icon: Moon,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    questions: 8,
    duration: "4 min"
  },
  {
    id: "hydration",
    title: "Hydration Check",
    description: "Are you drinking enough water? Find out your hydration level.",
    icon: Droplets,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    questions: 5,
    duration: "2 min"
  },
  {
    id: "eyestrain",
    title: "Digital Eye Strain",
    description: "Check if screen time is affecting your eye health.",
    icon: Eye,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    questions: 7,
    duration: "3 min"
  },
  {
    id: "fitness",
    title: "Fitness Readiness",
    description: "Evaluate your physical readiness for exercise routines.",
    icon: Dumbbell,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    questions: 9,
    duration: "4 min"
  },
  {
    id: "nutrition",
    title: "Nutrition Score",
    description: "Analyze your eating habits and get personalized diet tips.",
    icon: Apple,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800",
    questions: 10,
    duration: "5 min"
  }
];

interface ToolGridProps {
  onSelect: (tool: HealthTool) => void;
}

export function ToolGrid({ onSelect }: ToolGridProps) {
  return (
    <div className="py-16 bg-slate-50 dark:bg-slate-950">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your Assessment
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Select any tool below to begin your personalized health journey. All data is private and processed locally.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {healthTools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card 
                className={`h-full cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 ${tool.borderColor} bg-white dark:bg-slate-900`}
                onClick={() => onSelect(tool)}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl ${tool.bgColor} flex items-center justify-center mb-5`}>
                    <tool.icon className={`w-7 h-7 ${tool.color}`} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 line-clamp-2">
                    {tool.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>{tool.questions} questions</span>
                      <span>•</span>
                      <span>{tool.duration}</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full ${tool.bgColor} flex items-center justify-center`}>
                      <ArrowRight className={`w-4 h-4 ${tool.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
