"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Smartphone, Clock, Users, Activity, BarChart, Bell } from "lucide-react";

export default function BentoGrid() {
  return (
    <section className="py-32 bg-background transition-colors duration-300">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="mb-20 max-w-2xl">
           <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-6">
               More than just <span className="text-gradient-brand">queueing</span>.
           </h2>
           <p className="text-lg text-muted-foreground font-body">
               We built an operating system for modern clinics. Every pixel serves a purpose.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-[auto] gap-6">
            
            {/* L1: Large Feature*/}
            <motion.div 
               whileHover={{ scale: 1.02 }}
               className="md:col-span-2 row-span-2 rounded-3xl p-8 bg-card border border-border shadow-xl overflow-hidden relative group"
            >
                <div className="relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2 font-heading">Real-time Live Sync</h3>
                    <p className="text-muted-foreground max-w-xs font-body">
                        Don't refresh. Positions update instantly via WebSockets across all devices.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 top-1/2 w-1/2 bg-muted/50 rounded-tl-3xl p-6 transition-transform group-hover:translate-x-2 translate-y-4">
                     <div className="space-y-3 opacity-60">
                         <div className="flex items-center justify-between p-2 bg-card rounded-lg shadow-sm border border-border">
                             <span className="text-xs font-bold text-foreground">#4 Sarah</span>
                             <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                         </div>
                         <div className="flex items-center justify-between p-2 bg-card rounded-lg shadow-sm scale-105 border-l-4 border-primary">
                             <span className="text-xs font-bold text-foreground">#5 You</span>
                             <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                         </div>
                         <div className="flex items-center justify-between p-2 bg-card rounded-lg shadow-sm border border-border">
                             <span className="text-xs font-bold text-foreground">#6 Mike</span>
                             <span className="h-2 w-2 bg-muted-foreground rounded-full"></span>
                         </div>
                     </div>
                </div>
            </motion.div>

            {/* S1: Smart Notifs */}
            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-1 rounded-3xl p-6 bg-gradient-brand text-white shadow-lg flex flex-col justify-between">
                <Bell className="h-8 w-8 text-white/90" />
                <div>
                    <h3 className="text-xl font-bold font-heading mb-1">Smart Alerts</h3>
                    <p className="text-sm text-white/90 font-body">"Leave via Taxi now to arrive on time."</p>
                </div>
            </motion.div>

            {/* S2: Analytics */}
            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-1 rounded-3xl p-6 bg-card border border-border shadow-sm">
                 <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                     <BarChart className="h-5 w-5 text-secondary" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground font-heading">Clinic Analytics</h3>
                 <p className="text-xs text-muted-foreground mt-2 font-body">Optimize flow with data.</p>
            </motion.div>

            {/* M1: Security */}
            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-1 md:row-span-2 rounded-3xl p-6 bg-foreground text-background border border-border shadow-2xl overflow-hidden relative">
                 <div className="relative z-10 h-full flex flex-col justify-between">
                     <Shield className="h-8 w-8 text-muted-foreground" />
                     <div className="mt-8">
                         <h3 className="text-xl font-bold font-heading mb-2">Enterprise Grade</h3>
                         <p className="text-sm text-muted-foreground font-body">HIPAA compliant architecture. Your health data is encrypted at rest.</p>
                     </div>
                 </div>
                 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            </motion.div>

            {/* M2: Instant Booking */}
            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-1 rounded-3xl p-6 bg-card border border-border shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                     <Zap className="h-24 w-24 text-foreground" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground font-heading mb-2">Instant Booking</h3>
                 <p className="text-sm text-muted-foreground font-body">Book in 3 clicks. No phone calls.</p>
                 <div className="mt-4 flex gap-2">
                     <div className="h-8 w-16 bg-muted rounded-lg animate-pulse"></div>
                     <div className="h-8 w-16 bg-primary/20 rounded-lg"></div>
                 </div>
            </motion.div>

            {/* M3: Doctor Dashboard */}
             <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2 rounded-3xl p-6 bg-card border border-border shadow-sm flex items-center justify-between gap-4">
                 <div className="space-y-2">
                     <h3 className="text-xl font-bold text-foreground font-heading">For Doctors</h3>
                     <p className="text-sm text-muted-foreground font-body">Manage your day with our powerful dashboard.</p>
                 </div>
                 <div className="flex -space-x-3">
                     {[1,2,3].map(i => (
                         <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">D{i}</div>
                     ))}
                 </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
