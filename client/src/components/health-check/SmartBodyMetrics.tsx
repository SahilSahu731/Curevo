"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SmartBodyMetricsProps {
    onBack: () => void;
}

export function SmartBodyMetrics({ onBack }: SmartBodyMetricsProps) {
    const [weight, setWeight] = useState(70);
    const [height, setHeight] = useState(170);

    const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
    const bmiNum = parseFloat(bmi);

    const getBMIStatus = (val: number) => {
        if (val < 18.5) return { label: "Underweight", color: "text-blue-400", bg: "bg-blue-500", range: [0, 18.5] };
        if (val < 25) return { label: "Healthy Weight", color: "text-emerald-400", bg: "bg-emerald-500", range: [18.5, 25] };
        if (val < 30) return { label: "Overweight", color: "text-amber-400", bg: "bg-amber-500", range: [25, 30] };
        return { label: "Obese", color: "text-rose-400", bg: "bg-rose-500", range: [30, 50] };
    };

    const status = getBMIStatus(bmiNum);
    const maxBmi = 40;
    const meterPercent = Math.min((bmiNum / maxBmi) * 100, 100);

    return (
        <div className="w-full max-w-4xl mx-auto py-10 px-4">
             <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white mb-8 pl-0 hover:bg-transparent">
                <ArrowLeft className="mr-2 w-4 h-4" /> Back to Hub
            </Button>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-12">
                     <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-slate-300 font-bold">Weight</label>
                            <span className="text-2xl font-black text-white">{weight} <span className="text-sm font-normal text-slate-500">kg</span></span>
                        </div>
                        <Slider 
                            value={[weight]} 
                            min={30} 
                            max={150} 
                            step={1} 
                            onValueChange={(val) => setWeight(val[0])}
                            className="bg-slate-800 rounded-full h-4" // Use custom styler later if needed, default is ok
                        />
                     </div>

                     <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-slate-300 font-bold">Height</label>
                            <span className="text-2xl font-black text-white">{height} <span className="text-sm font-normal text-slate-500">cm</span></span>
                        </div>
                        <Slider 
                            value={[height]} 
                            min={100} 
                            max={220} 
                            step={1} 
                            onValueChange={(val) => setHeight(val[0])}
                            className="bg-slate-800 rounded-full h-4"
                        />
                     </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                     <span className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-6">Your BMI</span>
                     
                     <div className="relative mb-6">
                        <span className={`text-8xl font-black ${status.color} tracking-tighter`}>{bmi}</span>
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            key={status.label}
                            className={`absolute -top-4 -right-8 ${status.bg} text-slate-950 text-xs font-bold px-2 py-1 rounded-full`}
                        >
                            Updated
                        </motion.div>
                     </div>

                     <div className={`text-2xl font-bold ${status.color} mb-8 px-6 py-2 rounded-2xl bg-white/5 border border-white/10`}>
                        {status.label}
                     </div>

                     <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                         <div className="absolute top-0 bottom-0 w-[46.25%] left-0 bg-blue-500/30" /> {/* Underweight */}
                         <div className="absolute top-0 bottom-0 w-[16.25%] left-[46.25%] bg-emerald-500/80" /> {/* Healthy */}
                         <div className="absolute top-0 bottom-0 w-[12.5%] left-[62.5%] bg-amber-500/80" /> {/* Overweight */}
                         <div className="absolute top-0 bottom-0 right-0 left-[75%] bg-rose-500/80" /> {/* Obese */}
                         
                         <motion.div 
                            animate={{ left: `${meterPercent}%` }}
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-slate-900 rounded-full shadow-lg z-10"
                         />
                     </div>
                     <div className="flex justify-between w-full text-[10px] text-slate-500 font-bold mt-2 uppercase">
                        <div>Low</div>
                        <div>Healthy</div>
                        <div>High</div>
                     </div>
                </div>
            </div>
        </div>
    );
}
