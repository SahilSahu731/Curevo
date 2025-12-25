"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Smile, Meh, Frown } from "lucide-react";

interface StressTestProps {
  onBack: () => void;
}

const questions = [
  "I have trouble falling or staying asleep.",
  "I feel nervous, anxious, or on edge.",
  "I get easily annoyed or irritable.",
  "I find it hard to relax.",
  "I worry too much about different things.",
  "I feel tired or have little energy.",
  "I have trouble concentrating on things.",
  "I feel afraid as if something awful might happen."
];

export function StressTest({ onBack }: StressTestProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);
    
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      setTimeout(() => setShowResult(true), 200);
    }
  };

  const getScore = () => {
    return answers.reduce((acc, curr) => acc + (curr === -1 ? 0 : curr), 0);
  };

  const getResult = () => {
    const score = getScore();
    const maxScore = questions.length * 3;
    const percentage = (score / maxScore) * 100;

    if (percentage < 25) return { 
        level: "Low Stress", 
        desc: "You seem to be handling things well. Keep up your healthy habits!",
        color: "text-emerald-400",
        bg: "bg-emerald-500",
        icon: Smile
    };
    if (percentage < 50) return { 
        level: "Moderate Stress", 
        desc: "You have some stress. Consider mindfulness or light exercise.",
        color: "text-amber-400",
        bg: "bg-amber-500",
        icon: Meh
    };
    return { 
        level: "High Stress", 
        desc: "Your stress levels are high. It's important to take a break and seek support if needed.",
        color: "text-rose-400",
        bg: "bg-rose-500",
        icon: Frown
    };
  };

  if (showResult) {
    const result = getResult();
    const score = getScore();
    const maxScore = questions.length * 3;
    const angle = (score / maxScore) * 180;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl mx-auto py-10 px-4"
        >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center">
                <div className={`w-20 h-20 rounded-full ${result.bg} mx-auto mb-6 flex items-center justify-center text-slate-950`}>
                    <result.icon className="w-10 h-10" />
                </div>
                
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Analysis Complete</h3>
                <h2 className={`text-4xl md:text-5xl font-black ${result.color} mb-6`}>{result.level}</h2>
                <p className="text-xl text-slate-300 mb-10 max-w-lg mx-auto">{result.desc}</p>

                {/* Meter Visualization */}
                <div className="relative w-64 h-32 mx-auto mb-10 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full rounded-t-full border-[20px] border-slate-800 border-l-emerald-500 border-t-amber-500 border-r-rose-500" />
                    <motion.div 
                        initial={{ rotate: -90 }}
                        animate={{ rotate: angle - 90 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="absolute bottom-0 left-1/2 w-1 h-28 bg-white origin-bottom -translate-x-1/2 rounded-full shadow-[0_0_10px_white]"
                    />
                     <div className="absolute bottom-0 left-1/2 w-8 h-8 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => { setStep(0); setShowResult(false); setAnswers(new Array(questions.length).fill(-1)); }} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                        Check Again
                    </Button>
                    <Button onClick={onBack} className="bg-white text-slate-900 hover:bg-slate-200">
                        Back to Hub
                    </Button>
                </div>
            </div>
        </motion.div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4">
      <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white mb-8 pl-0 hover:bg-transparent">
        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Hub
      </Button>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-slate-400 mb-2 font-medium">
            <span>Question {step + 1} of {questions.length}</span>
            <span>{Math.round(((step) / questions.length) * 100)}% Completed</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
                animate={{ width: `${((step) / questions.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
            />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 min-h-[400px] flex flex-col justify-center"
        >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-12 text-center leading-tight">
                {questions[step]}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { val: 0, label: "Never", icon: Smile },
                    { val: 1, label: "Sometimes", icon: Meh },
                    { val: 2, label: "Often", icon: AlertTriangle },
                    { val: 3, label: "Always", icon: Frown }
                ].map((option) => (
                    <button
                        key={option.val}
                        onClick={() => handleAnswer(option.val)}
                        className={`
                            p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-4 text-center group
                            ${answers[step] === option.val 
                                ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20" 
                                : "bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-800"}
                        `}
                    >   
                        <option.icon className={`w-8 h-8 ${answers[step] === option.val ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                        <span className={`font-bold ${answers[step] === option.val ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                            {option.label}
                        </span>
                    </button>
                ))}
            </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
