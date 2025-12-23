"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center pt-24 bg-background transition-colors duration-300">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] opacity-40 animate-pulse-slow delay-1000"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 text-center lg:text-left"
          >
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold font-body tracking-wide"
             >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                LIVE QUEUE V2.0
             </motion.div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-6 font-heading">
              Healthcare <br className="hidden lg:block"/>
              <span className="text-gradient-brand">Without The Wait</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-body">
              Join the 10,000+ patients using SmartQueue to book instantly, track live, and reclaim their time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
              <Link href="/book">
                <Button size="lg" className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:opacity-90 rounded-full transition-all hover:scale-105 active:scale-95 font-heading shadow-xl shadow-primary/25">
                  Start Booking <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                 <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-border hover:border-primary bg-transparent text-foreground rounded-full transition-all hover:bg-muted font-heading">
                    Track Queue
                 </Button>
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-muted-foreground font-body">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>No Login Required</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>Instant SMS Alerts</span>
                </div>
            </div>
          </motion.div>

          {/* Visual Content: Asymmetrical Glass Card */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto lg:ml-auto w-full max-w-lg"
          >
               <motion.div 
                 className="relative z-10"
                 whileHover={{ rotateY: 5, rotateX: 5 }}
                 transition={{ type: "spring", stiffness: 100 }}
               >
                   {/* Main Glass Card */}
                   <div className="relative bg-card/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2rem] shadow-2xl overflow-hidden p-6 dark:shadow-primary/5">
                        
                        {/* Abstract Header */}
                        <div className="flex justify-between items-center mb-8">
                             <div className="text-2xl font-bold font-heading text-foreground">Clinic<span className="text-primary">OS</span></div>
                             <div className="h-8 w-8 rounded-full bg-foreground/5 flex items-center justify-center">
                                 <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                             </div>
                        </div>

                        {/* Central Number */}
                        <div className="bg-gradient-to-br from-primary/90 to-accent/90 rounded-3xl p-8 text-white relative overflow-hidden mb-6 group">
                            <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Your Token</p>
                            <div className="text-8xl font-black tracking-tighter font-heading">04</div>
                            <div className="mt-4 flex items-center gap-2 text-sm font-medium bg-black/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                                <Clock className="h-3 w-3" />
                                <span>~14 mins wait</span>
                            </div>
                        </div>

                        {/* Queue Mini List */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-foreground/5 rounded-xl">
                                <div className="h-10 w-10 bg-secondary/20 text-secondary rounded-full flex items-center justify-center font-bold">03</div>
                                <div>
                                    <div className="text-sm font-bold text-foreground">J. Doe</div>
                                    <div className="text-xs text-muted-foreground">In Consultation</div>
                                </div>
                                <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                <div className="h-10 w-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">04</div>
                                <div>
                                    <div className="text-sm font-bold text-foreground">You</div>
                                    <div className="text-xs text-muted-foreground">Next in line</div>
                                </div>
                            </div>
                        </div>
                   </div>

                   {/* Floating Elements (Decorative) */}
                   <motion.div 
                      animate={{ y: [-10, 10, -10] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-lg border border-border backdrop-blur-md hidden md:block" // Fixed bg-surface
                   > 
                      {/* Fixed bg-surface to bg-card */}
                      <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center">
                               <CheckCircle className="text-green-500 h-5 w-5" />
                           </div>
                           <div>
                               <div className="text-xs font-bold text-muted-foreground uppercase">Status</div>
                               <div className="text-sm font-bold text-foreground">Checked In</div>
                           </div>
                      </div>
                   </motion.div>
               </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
