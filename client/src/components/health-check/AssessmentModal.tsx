"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ChevronLeft, 
  RotateCcw, 
  X, 
  Download,
  ThumbsUp,
  Meh,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { HealthTool } from "./ToolGrid";
import { 
  generateDetailedResult, 
  generatePDFReport, 
  AssessmentResult 
} from "@/lib/healthCalculations";
import { Progress } from "@/components/ui/progress";

// Question types
interface Question {
  id: string;
  text: string;
  type: "scale" | "choice" | "slider";
  options?: { value: number; label: string }[];
  min?: number;
  max?: number;
  unit?: string;
}

// Questions database for each assessment type
const questionSets: Record<string, Question[]> = {
  stress: [
    { id: "s1", text: "In the last month, how often have you felt nervous or stressed?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 1, label: "Rarely" }, { value: 2, label: "Sometimes" }, { value: 3, label: "Often" }, { value: 4, label: "Very Often" }] },
    { id: "s2", text: "How often have you felt that you were unable to control important things in your life?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 1, label: "Rarely" }, { value: 2, label: "Sometimes" }, { value: 3, label: "Often" }, { value: 4, label: "Very Often" }] },
    { id: "s3", text: "How often have you felt confident about handling personal problems?", type: "choice", options: [{ value: 4, label: "Never" }, { value: 3, label: "Rarely" }, { value: 2, label: "Sometimes" }, { value: 1, label: "Often" }, { value: 0, label: "Very Often" }] },
    { id: "s4", text: "How often have you felt that things were going your way?", type: "choice", options: [{ value: 4, label: "Never" }, { value: 3, label: "Rarely" }, { value: 2, label: "Sometimes" }, { value: 1, label: "Often" }, { value: 0, label: "Very Often" }] },
    { id: "s5", text: "How often have you been angered by things outside your control?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 1, label: "Rarely" }, { value: 2, label: "Sometimes" }, { value: 3, label: "Often" }, { value: 4, label: "Very Often" }] },
    { id: "s6", text: "How often have you felt difficulties piling up so high you could not overcome them?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 1, label: "Rarely" }, { value: 2, label: "Sometimes" }, { value: 3, label: "Often" }, { value: 4, label: "Very Often" }] },
    { id: "s7", text: "On a scale of 1-10, rate your overall mental well-being today.", type: "slider", min: 1, max: 10 },
    { id: "s8", text: "How many hours of quality sleep did you get last night?", type: "slider", min: 0, max: 12, unit: "hours" },
  ],
  heart: [
    { id: "h1", text: "What is your age?", type: "slider", min: 18, max: 100, unit: "years" },
    { id: "h2", text: "Do you smoke or use tobacco products?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 2, label: "Quit >1 year ago" }, { value: 4, label: "Currently smoke" }] },
    { id: "h3", text: "Do you have a family history of heart disease?", type: "choice", options: [{ value: 0, label: "No" }, { value: 2, label: "Yes, distant relative" }, { value: 4, label: "Yes, parent or sibling" }] },
    { id: "h4", text: "How often do you exercise per week?", type: "choice", options: [{ value: 4, label: "Never" }, { value: 3, label: "1-2 times" }, { value: 2, label: "3-4 times" }, { value: 0, label: "5+ times" }] },
    { id: "h5", text: "What is your typical blood pressure?", type: "choice", options: [{ value: 0, label: "Normal (<120/80)" }, { value: 2, label: "Elevated (120-129)" }, { value: 4, label: "High (130+ or unknown)" }] },
    { id: "h6", text: "How would you describe your diet?", type: "choice", options: [{ value: 0, label: "Very healthy" }, { value: 1, label: "Mostly healthy" }, { value: 3, label: "Average" }, { value: 4, label: "Unhealthy" }] },
    { id: "h7", text: "What is your approximate cholesterol level?", type: "choice", options: [{ value: 0, label: "Normal" }, { value: 2, label: "Borderline high" }, { value: 4, label: "High or unknown" }] },
    { id: "h8", text: "Do you experience chest pain or shortness of breath?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 2, label: "Rarely" }, { value: 4, label: "Sometimes or Often" }] },
  ],
  bmi: [
    { id: "b1", text: "What is your weight?", type: "slider", min: 30, max: 200, unit: "kg" },
    { id: "b2", text: "What is your height?", type: "slider", min: 100, max: 220, unit: "cm" },
    { id: "b3", text: "What is your age?", type: "slider", min: 10, max: 100, unit: "years" },
    { id: "b4", text: "What is your biological sex?", type: "choice", options: [{ value: 0, label: "Male" }, { value: 1, label: "Female" }] },
    { id: "b5", text: "How would you describe your activity level?", type: "choice", options: [{ value: 0, label: "Sedentary" }, { value: 1, label: "Lightly Active" }, { value: 2, label: "Moderately Active" }, { value: 3, label: "Very Active" }] },
  ],
  sleep: [
    { id: "sl1", text: "On average, how many hours do you sleep per night?", type: "slider", min: 0, max: 12, unit: "hours" },
    { id: "sl2", text: "How long does it usually take you to fall asleep?", type: "choice", options: [{ value: 0, label: "< 15 min" }, { value: 1, label: "15-30 min" }, { value: 2, label: "30-60 min" }, { value: 3, label: "> 1 hour" }] },
    { id: "sl3", text: "How often do you wake up during the night?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 1, label: "Once" }, { value: 2, label: "2-3 times" }, { value: 3, label: "More than 3 times" }] },
    { id: "sl4", text: "Do you feel refreshed when you wake up?", type: "choice", options: [{ value: 0, label: "Always" }, { value: 1, label: "Usually" }, { value: 2, label: "Sometimes" }, { value: 3, label: "Rarely" }] },
    { id: "sl5", text: "Do you use electronic devices before bed?", type: "choice", options: [{ value: 3, label: "Always" }, { value: 2, label: "Often" }, { value: 1, label: "Sometimes" }, { value: 0, label: "Rarely" }] },
    { id: "sl6", text: "Do you consume caffeine after 2 PM?", type: "choice", options: [{ value: 2, label: "Yes, often" }, { value: 1, label: "Sometimes" }, { value: 0, label: "Rarely or never" }] },
  ],
  hydration: [
    { id: "hy1", text: "How many glasses of water do you drink daily?", type: "slider", min: 0, max: 15, unit: "glasses" },
    { id: "hy2", text: "What is the color of your urine usually?", type: "choice", options: [{ value: 0, label: "Clear/pale yellow" }, { value: 1, label: "Yellow" }, { value: 2, label: "Dark yellow" }, { value: 3, label: "Amber/brown" }] },
    { id: "hy3", text: "How often do you feel thirsty during the day?", type: "choice", options: [{ value: 0, label: "Rarely" }, { value: 1, label: "Sometimes" }, { value: 2, label: "Often" }, { value: 3, label: "Almost always" }] },
    { id: "hy4", text: "Do you experience headaches or fatigue regularly?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 1, label: "Sometimes" }, { value: 2, label: "Often" }] },
  ],
  eyestrain: [
    { id: "e1", text: "How many hours do you spend on screens daily?", type: "slider", min: 0, max: 16, unit: "hours" },
    { id: "e2", text: "Do you experience eye fatigue or dryness?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 1, label: "Sometimes" }, { value: 2, label: "Often" }, { value: 3, label: "Always" }] },
    { id: "e3", text: "Do you use blue light filters?", type: "choice", options: [{ value: 0, label: "Yes, always" }, { value: 1, label: "Sometimes" }, { value: 2, label: "No" }] },
    { id: "e4", text: "Do you take breaks every 20 minutes (20-20-20 rule)?", type: "choice", options: [{ value: 0, label: "Yes" }, { value: 1, label: "Sometimes" }, { value: 2, label: "No" }] },
    { id: "e5", text: "Do you experience headaches after screen use?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 1, label: "Sometimes" }, { value: 2, label: "Often" }] },
  ],
  fitness: [
    { id: "f1", text: "How many days per week do you exercise?", type: "slider", min: 0, max: 7, unit: "days" },
    { id: "f2", text: "What is your typical workout duration?", type: "slider", min: 0, max: 120, unit: "minutes" },
    { id: "f3", text: "How would you rate your current fitness level?", type: "choice", options: [{ value: 0, label: "Beginner" }, { value: 1, label: "Intermediate" }, { value: 2, label: "Advanced" }, { value: 3, label: "Athlete" }] },
    { id: "f4", text: "Do you experience pain during or after exercise?", type: "choice", options: [{ value: 2, label: "Often" }, { value: 1, label: "Sometimes" }, { value: 0, label: "Rarely or never" }] },
    { id: "f5", text: "Can you climb 3 flights of stairs without getting winded?", type: "choice", options: [{ value: 0, label: "Easily" }, { value: 1, label: "With some effort" }, { value: 2, label: "With difficulty" }] },
  ],
  nutrition: [
    { id: "n1", text: "How many servings of fruits/vegetables do you eat daily?", type: "slider", min: 0, max: 10, unit: "servings" },
    { id: "n2", text: "How often do you eat fast food per week?", type: "choice", options: [{ value: 0, label: "Never" }, { value: 1, label: "1-2 times" }, { value: 2, label: "3-4 times" }, { value: 3, label: "5+ times" }] },
    { id: "n3", text: "Do you skip breakfast?", type: "choice", options: [{ value: 2, label: "Often" }, { value: 1, label: "Sometimes" }, { value: 0, label: "Rarely" }] },
    { id: "n4", text: "How many liters of sugary drinks do you consume weekly?", type: "slider", min: 0, max: 10, unit: "liters" },
    { id: "n5", text: "Do you read nutrition labels before buying food?", type: "choice", options: [{ value: 0, label: "Always" }, { value: 1, label: "Sometimes" }, { value: 2, label: "Never" }] },
    { id: "n6", text: "How often do you eat home-cooked meals?", type: "choice", options: [{ value: 0, label: "Almost always" }, { value: 1, label: "Often" }, { value: 2, label: "Sometimes" }, { value: 3, label: "Rarely" }] },
  ],
};

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: HealthTool | null;
}

export function AssessmentModal({ isOpen, onClose, tool }: AssessmentModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const questions = tool ? questionSets[tool.id] || [] : [];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setAnswers({});
      setResult(null);
      setIsAnalyzing(false);
    }
  }, [isOpen]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      finishAssessment();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
    }
  };

  const finishAssessment = () => {
    if (!tool) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const generatedResult = generateDetailedResult(tool.id, tool.title, answers);
      setResult(generatedResult);
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleDownloadPDF = () => {
    if (result) {
      generatePDFReport(result);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return ThumbsUp;
      case "good": return TrendingUp;
      case "average": return Meh;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", bar: "bg-emerald-500" };
      case "good": return { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", bar: "bg-blue-500" };
      case "average": return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", bar: "bg-amber-500" };
      default: return { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/30", bar: "bg-rose-500" };
    }
  };

  if (!tool) return null;

  const currentQ = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const canProceed = currentQ ? answers[currentQ.id] !== undefined : false;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>{tool.title}</DialogTitle>
          <DialogDescription>Health assessment questionnaire</DialogDescription>
        </VisuallyHidden>
        {/* Header */}
        <div className={`py-5 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${tool.bgColor}`}>
              <tool.icon className={`w-6 h-6 ${tool.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{tool.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {result ? "Your Results" : `Question ${currentStep + 1} of ${questions.length}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        {!result && !isAnalyzing && (
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
            <motion.div 
              className="h-full bg-indigo-600"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-16"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-700" />
                  <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-indigo-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Your Data</h3>
                <p className="text-slate-500 dark:text-slate-400">Our AI model is processing your responses...</p>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Score Header */}
                {(() => {
                  const StatusIcon = getStatusIcon(result.status);
                  const colors = getStatusColor(result.status);
                  return (
                    <div className="text-center">
                      <div className={`w-20 h-20 mx-auto rounded-full ${colors.bg} flex items-center justify-center mb-4`}>
                        <StatusIcon className={`w-10 h-10 ${colors.text}`} />
                      </div>
                      <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        {result.score}<span className="text-xl text-slate-400">/{result.maxScore}</span>
                      </h3>
                      <p className={`text-xl font-semibold ${colors.text} mb-4`}>{result.statusLabel}</p>
                      
                      <div className="max-w-md mx-auto">
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.percentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${colors.bar}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Summary */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" /> Summary
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{result.summary}</p>
                </div>

                {/* Metrics Grid */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" /> Key Metrics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {result.metrics.map((metric, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border ${
                          metric.status === "good" ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20" :
                          metric.status === "warning" ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20" :
                          metric.status === "bad" ? "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20" :
                          "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{metric.label}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {metric.value}{metric.unit && <span className="text-sm font-normal text-slate-400 ml-1">{metric.unit}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Analysis */}
                {result.detailedAnalysis && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Detailed Analysis</h4>
                    <p className="text-indigo-800 dark:text-indigo-200 text-sm leading-relaxed">{result.detailedAnalysis}</p>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">Recommendations</h4>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{idx + 1}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button 
                    onClick={handleDownloadPDF} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download PDF Report
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRestart}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Retake Assessment
                  </Button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-slate-400 text-center">
                  This report is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional for medical guidance.
                </p>
              </motion.div>
            ) : currentQ ? (
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-4 max-w-xl mx-auto"
              >
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                  {currentQ.text}
                </h3>

                {currentQ.type === "choice" && currentQ.options && (
                  <div className="grid gap-3">
                    {currentQ.options.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleAnswer(currentQ.id, opt.value)}
                        className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
                          answers[currentQ.id] === opt.value
                            ? `${tool.borderColor} ${tool.bgColor} ${tool.color}`
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {currentQ.type === "slider" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <span className="text-5xl font-bold text-slate-900 dark:text-white">
                        {answers[currentQ.id] ?? currentQ.min}
                      </span>
                      {currentQ.unit && (
                        <span className="text-xl text-slate-500 dark:text-slate-400 ml-2">{currentQ.unit}</span>
                      )}
                    </div>
                    <Slider
                      value={[answers[currentQ.id] ?? currentQ.min ?? 0]}
                      min={currentQ.min}
                      max={currentQ.max}
                      step={1}
                      onValueChange={(val) => handleAnswer(currentQ.id, val[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>{currentQ.min} {currentQ.unit}</span>
                      <span>{currentQ.max} {currentQ.unit}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!result && !isAnalyzing && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={currentStep === 0}
              className="text-slate-500"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <Button 
              onClick={handleNext} 
              disabled={!canProceed}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
            >
              {currentStep === questions.length - 1 ? 'Get Results' : 'Next'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
