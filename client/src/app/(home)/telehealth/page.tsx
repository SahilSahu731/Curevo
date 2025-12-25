'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Video, 
  Stethoscope, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Thermometer, 
  MessageSquare, 
  ArrowRight,
  CheckCircle2,
  Wifi,
  Clock,
  Heart,
  Brain,
  Baby,
  Pill,
  Microscope,
  Star
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"

// --- Components for Widgets ---

const BMICalculator = () => {
    const [weight, setWeight] = useState([70]) // kg
    const [height, setHeight] = useState([170]) // cm
    
    const bmi = (weight[0] / ((height[0]/100) ** 2)).toFixed(1)
    
    let status = ""
    let color = ""
    
    const bmiNum = parseFloat(bmi)
    if (bmiNum < 18.5) { status = "Underweight"; color = "text-blue-500"; }
    else if (bmiNum < 25) { status = "Normal"; color = "text-green-500"; }
    else if (bmiNum < 30) { status = "Overweight"; color = "text-yellow-500"; }
    else { status = "Obese"; color = "text-red-500"; }

    return (
        <Card className="border-border/50 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    BMI Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Weight (kg)</span>
                        <span className="font-bold">{weight[0]} kg</span>
                    </div>
                    <Slider value={weight} onValueChange={setWeight} min={30} max={150} step={1} className="py-2" />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Height (cm)</span>
                        <span className="font-bold">{height[0]} cm</span>
                    </div>
                    <Slider value={height} onValueChange={setHeight} min={100} max={220} step={1} className="py-2" />
                </div>
                
                <div className="bg-muted/50 p-4 rounded-xl text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your BMI</div>
                    <div className="text-4xl font-extrabold font-heading">{bmi}</div>
                    <div className={`text-sm font-bold mt-1 ${color}`}>{status}</div>
                </div>
            </CardContent>
        </Card>
    )
}

const LiveWaitTime = () => {
    return (
        <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex justify-between items-center">
                    <span>Avg. Wait Time</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/5 animate-pulse">Live</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-extrabold font-heading flex items-baseline gap-1">
                    2 <span className="text-lg text-muted-foreground font-normal">min</span>
                </div>
                <div className="h-10 mt-4 flex items-end gap-1">
                     {[40, 60, 45, 30, 80, 50, 60, 70, 40, 30].map((h, i) => (
                         <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className="bg-primary/20 flex-1 rounded-t-sm hover:bg-primary transition-colors cursor-pointer"
                         />
                     ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Currently lower than usual</p>
            </CardContent>
        </Card>
    )
}

// --- Main Page Component ---

export default function TelehealthPage() {
  const [symptom, setSymptom] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const symptoms = [
    { id: 'fever', label: 'Fever', icon: Thermometer },
    { id: 'cough', label: 'Cough / Cold', icon: Activity },
    { id: 'headache', label: 'Headache', icon: Activity },
    { id: 'anxiety', label: 'Anxiety', icon: Brain },
  ]

  const handleAnalyze = () => {
    if (!symptom) return
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setResult('We recommend seeing a General Practitioner based on your symptoms.')
    }, 1500)
  }

  return (
    <div className="w-full bg-background min-h-screen">
      
      {/* 1. HERO SECTION (Expanded) */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Animated Orbs Background */}
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-40 left-[-100px] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Badge variant="secondary" className="px-4 py-1 mb-6 rounded-full text-sm font-medium">
                        New: AI-Powered Triage Beta
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-heading tracking-tight text-foreground leading-[1.1] mb-6">
                        Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary animate-gradient-x">healthcare</span> is here.
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                        Experience the most advanced telehealth platform. Connect with top-tier specialists, track your vitals with AI, and manage your health seamlessly.
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-4">
                    <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform bg-primary text-primary-foreground rounded-full">
                        <Video className="mr-2 h-5 w-5" /> Book Consultation
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-primary/20 rounded-full hover:bg-primary/5">
                        Download App
                    </Button>
                </motion.div>

                <div className="flex items-center gap-8 pt-6">
                    <div>
                        <div className="text-3xl font-bold font-heading">10k+</div>
                        <div className="text-sm text-muted-foreground">Consultations</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold font-heading">4.9/5</div>
                        <div className="text-sm text-muted-foreground">User Rating</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold font-heading">15m</div>
                        <div className="text-sm text-muted-foreground">Avg Wait Time</div>
                    </div>
                </div>
            </div>

            {/* Right Interactive Area */}
            <div className="relative">
                {/* Symptom Checker Widget (Improved) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card/80 backdrop-blur-md border border-border/50 p-6 rounded-3xl shadow-2xl relative z-20"
                >
                     <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg">AI Symptom Check</h3>
                            <p className="text-xs text-muted-foreground">Real-time triage</p>
                        </div>
                        <div className="flex gap-2">
                             <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        </div>
                     </div>

                    {!result ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                {symptoms.map((sym) => (
                                <button
                                    key={sym.id}
                                    onClick={() => setSymptom(sym.id)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                                    symptom === sym.id 
                                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' 
                                        : 'border-border/50 hover:bg-muted/50 hover:border-primary/30'
                                    }`}
                                >
                                    <sym.icon className={`h-6 w-6 mb-2 ${symptom === sym.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className="text-xs font-semibold">{sym.label}</span>
                                </button>
                                ))}
                            </div>
                            <Button 
                                className="w-full h-12 text-base font-bold" 
                                disabled={!symptom || analyzing}
                                onClick={handleAnalyze}
                            >
                                {analyzing ? 'Analyzing with AI...' : 'Analyze Symptoms'} 
                                {!analyzing && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 py-8 animate-in fade-in zoom-in duration-300">
                             <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600">
                                 <CheckCircle2 className="h-8 w-8" />
                             </div>
                             <div>
                                 <h4 className="font-bold text-xl">Matches General Practice</h4>
                                 <p className="text-sm text-muted-foreground mt-2">Based on your input, we recommend seeing a GP.</p>
                             </div>
                             <div className="pt-4">
                                 <Button className="w-full" size="lg">Book GP Now</Button>
                                 <Button variant="link" onClick={() => {setResult(null); setSymptom(null)}} className="mt-2 text-xs">Start Over</Button>
                             </div>
                        </div>
                    )}
                </motion.div>

                {/* Floating Widgets Decoration */}
                <div className="absolute -right-12 top-20 hidden lg:block z-10 w-64 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                    <LiveWaitTime />
                </div>
                
                 <div className="absolute -left-12 bottom-10 hidden lg:block z-30 w-72 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <BMICalculator />
                </div>
            </div>
        </div>
      </section>

      {/* 2. SPECIALTIES CAROUSEL */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
             <div className="flex justify-between items-end mb-12">
                 <div>
                    <h2 className="text-4xl font-bold font-heading mb-4">Care for every need</h2>
                    <p className="text-muted-foreground max-w-xl">From urgent matters to ongoing care, we have specialists ready to help.</p>
                 </div>
                 <Button variant="outline">View All Specialties</Button>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                 {[
                     { icon: Stethoscope, label: "General Health", color: "text-blue-500", bg: "bg-blue-500/10" },
                     { icon: Brain, label: "Mental Health", color: "text-purple-500", bg: "bg-purple-500/10" },
                     { icon: Baby, label: "Pediatrics", color: "text-pink-500", bg: "bg-pink-500/10" },
                     { icon: Heart, label: "Cardiology", color: "text-red-500", bg: "bg-red-500/10" },
                     { icon: Microscope, label: "Dermatology", color: "text-amber-500", bg: "bg-amber-500/10" },
                     { icon: Pill, label: "Prescriptions", color: "text-green-500", bg: "bg-green-500/10" },
                 ].map((spec, i) => (
                     <Card key={i} className="hover:border-primary/50 transition-all cursor-pointer hover:-translate-y-1 group border-border/50">
                         <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                             <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${spec.bg} ${spec.color} group-hover:scale-110 transition-transform`}>
                                 <spec.icon className="h-8 w-8" />
                             </div>
                             <span className="font-bold text-sm">{spec.label}</span>
                         </CardContent>
                     </Card>
                 ))}
             </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Tabs) */}
      <section className="py-24 container mx-auto px-4">
          <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-heading mb-4">Healthcare, simplified.</h2>
              <p className="text-muted-foreground">Three simple steps to feeling better.</p>
          </div>

          <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="step1" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-16 p-2 bg-muted/50 rounded-full">
                      <TabsTrigger value="step1" className="rounded-full text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">1. Book</TabsTrigger>
                      <TabsTrigger value="step2" className="rounded-full text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">2. Consult</TabsTrigger>
                      <TabsTrigger value="step3" className="rounded-full text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">3. Recover</TabsTrigger>
                  </TabsList>
                  
                  {[
                      { val: "step1", title: "Choose your specialist", desc: "Browse doctor profiles, read reviews, and select a time that works for you. No referral needed.", icon: Calendar },
                      { val: "step2", title: "Video call from anywhere", desc: "Connect via our secure HD video platform. Explain your symptoms and get a diagnosis in real-time.", icon: Video },
                      { val: "step3", title: "Get treatment plan", desc: "Receive digital prescriptions sent to your pharmacy and a full care plan in your dashboard.", icon: CheckCircle2 }
                  ].map((step) => (
                      <TabsContent key={step.val} value={step.val} className="mt-12">
                          <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-lg flex flex-col md:flex-row items-center gap-12">
                               <div className="flex-1 space-y-6">
                                   <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <step.icon className="h-8 w-8" />
                                   </div>
                                   <h3 className="text-3xl font-bold font-heading">{step.title}</h3>
                                   <p className="text-lg text-muted-foreground">{step.desc}</p>
                                   <Button variant="outline">Learn more</Button>
                               </div>
                               <div className="flex-1 w-full relative">
                                    <div className="bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl w-full aspect-video flex items-center justify-center ring-4 ring-white dark:ring-black">
                                        {/* Placeholder for illustrative image */}
                                        <div className="text-primary/50 font-bold uppercase tracking-widest">Step Visual</div>
                                    </div>
                               </div>
                          </div>
                      </TabsContent>
                  ))}
              </Tabs>
          </div>
      </section>

      {/* 4. HEALTH TOOLS WIDGETS SECTION */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
           {/* Dark Mode Specific Vibe */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
           <div className="container mx-auto px-4 relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                    <div>
                        <h2 className="text-4xl font-bold font-heading">Your Personal Health Dashboard</h2>
                        <p className="text-gray-400 mt-2">More than just video calls. Included with every account.</p>
                    </div>
                    <Button variant="secondary" size="lg" className="rounded-full">Explore Tools</Button>
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                    {/* Widget 1 */}
                    <Card className="bg-white/10 border-white/10 text-white backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Activity /> Vitals Trackers</CardTitle>
                        </CardHeader>
                        <CardContent>
                             Log Blood Pressure, Heart Rate, and Glucose levels. Visualize trends over time.
                        </CardContent>
                        <div className="px-6 pb-6">
                            <div className="h-32 bg-black/20 rounded-xl flex items-end p-4 gap-2">
                                {[40,70,50,90,60,80,95].map((h,i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm opacity-80" style={{height: `${h}%`}}></div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Widget 2 */}
                    <Card className="bg-white/10 border-white/10 text-white backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Pill /> Med Reminders</CardTitle>
                        </CardHeader>
                        <CardContent>
                             Never miss a dose. Smart notifications and refill alerts sent to your phone.
                        </CardContent>
                        <div className="px-6 pb-6 space-y-3">
                             {["Amoxicillin - 8:00 AM", "Vitamin D - 12:00 PM"].map((med, i) => (
                                 <div key={i} className="flex items-center gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                                     <div className={`h-3 w-3 rounded-full ${i===0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                     <span className="text-sm font-medium">{med}</span>
                                 </div>
                             ))}
                        </div>
                    </Card>

                    {/* Widget 3 */}
                    <Card className="bg-white/10 border-white/10 text-white backdrop-blur-md">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShieldCheck /> Insurance Vault</CardTitle>
                        </CardHeader>
                        <CardContent>
                             Store your insurance cards securely. Auto-verified eligibility before every visit.
                        </CardContent>
                        <div className="px-6 pb-6">
                             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 rounded-xl p-4 relative overflow-hidden">
                                  <div className="text-xs opacity-70">INSURANCE MEMBER</div>
                                  <div className="mt-8 text-lg font-mono tracking-widest">**** 8842</div>
                                  <div className="absolute opacity-10 right-[-20px] bottom-[-20px] h-32 w-32 rounded-full border-8 border-white"></div>
                             </div>
                        </div>
                    </Card>
               </div>
           </div>
      </section>

      {/* 5. PRICING */}
      <section className="py-24 container mx-auto px-4">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-heading mb-4">Transparent Pricing</h2>
              <p className="text-muted-foreground">Pay per visit or save with membership.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
               {/* Basic Plan */}
               <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                   <CardHeader className="text-center pb-2">
                       <Badge variant="outline" className="mx-auto mb-4">Pay-as-you-go</Badge>
                       <CardTitle className="text-3xl font-bold">$79</CardTitle>
                       <p className="text-muted-foreground">per visit</p>
                   </CardHeader>
                   <CardContent className="pt-6">
                       <ul className="space-y-4">
                           {["General Medical Consult", "Prescriptions Included", "Sick Notes", "24/7 Access"].map((feat, i) => (
                               <li key={i} className="flex items-center gap-3 text-sm">
                                   <CheckCircle2 className="h-5 w-5 text-green-500" />
                                   {feat}
                               </li>
                           ))}
                       </ul>
                   </CardContent>
                   <CardFooter>
                       <Button variant="outline" className="w-full">Book One-Time Visit</Button>
                   </CardFooter>
               </Card>

               {/* Pro Plan */}
               <Card className="border-primary shadow-2xl relative overflow-hidden bg-primary/5">
                   <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                   <CardHeader className="text-center pb-2">
                       <Badge className="mx-auto mb-4 px-4 bg-primary text-primary-foreground hover:bg-primary">Curevo+</Badge>
                       <CardTitle className="text-3xl font-bold">$0</CardTitle>
                       <p className="text-muted-foreground">visit fee with membership</p>
                   </CardHeader>
                   <CardContent className="pt-6">
                       <div className="text-center mb-6">
                           <span className="text-2xl font-bold">$19</span><span className="text-muted-foreground">/mo</span>
                       </div>
                       <ul className="space-y-4">
                           {["Unlimited Primary Care", "$0 Copay", "Mental Health Discounts", "Free Annual Checkup", "Priority Support"].map((feat, i) => (
                               <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                   <div className="bg-primary/20 p-1 rounded-full">
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                   </div>
                                   {feat}
                               </li>
                           ))}
                       </ul>
                   </CardContent>
                   <CardFooter>
                       <Button className="w-full shadow-lg shadow-primary/20">Start Free Trial</Button>
                   </CardFooter>
               </Card>
           </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold font-heading text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
                {[
                    { q: "Can I get a prescription online?", a: "Yes. Our doctors can prescribe medications for a wide range of conditions if medically necessary. Prescriptions are sent electronically to your local pharmacy." },
                    { q: "Do you accept insurance?", a: "We accept most major insurance plans including Aetna, Cigna, BlueCross, and UnitedHealthcare. You can also pay out-of-pocket using our transparent pricing." },
                    { q: "Is my data secure?", a: "Absolutely. We are fully HIPAA compliant and use bank-grade encryption to protect your personal health information." },
                    { q: "Can I see the same doctor again?", a: "Yes! You can choose to book with the same provider for continuity of care, subject to their availability." }
                ].map((item, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border/50 rounded-xl px-4">
                        <AccordionTrigger className="font-bold text-left">{item.q}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {item.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </section>

      {/* 7. FINAL BANNER */}
      <section className="py-24 px-4 container mx-auto">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-[2.5rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight">Your health comes first.</h2>
                    <p className="text-indigo-200 text-xl">Join 50,000+ members who have switched to smarter healthcare.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold h-14 px-8 rounded-full">Get Started</Button>
                        <Button size="lg" variant="outline" className="border-indigo-400 text-indigo-100 hover:bg-indigo-800/50 hover:text-white h-14 px-8 rounded-full">Contact Sales</Button>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          </div>
      </section>

    </div>
  )
}
