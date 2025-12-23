"use client"

import React, { useEffect } from 'react'
import { useAuthStore, useIsAuthenticated } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HeartPulse, Check, Shield, Zap, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useIsAuthenticated();
    const _hydrated = useAuthStore((state) => state._hydrated);
    const router = useRouter();

    useEffect(() => {
        if (_hydrated && isAuthenticated) {
            router.push('/');
        }
    }, [_hydrated, isAuthenticated, router]);

    if (!_hydrated) return null;

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background font-body transition-colors duration-300">
            {/* Left Side: Dark Aesthetic Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden text-white border-r border-border/10">
                 
                 {/* Image Background with Overlay */}
                 <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-60 dark:opacity-40 transition-opacity duration-300"
                    />
                    {/* Dark aesthetic overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-950/80 to-black/90 mix-blend-multiply transition-colors duration-300"></div>
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
                 </div>

                 {/* Brand Content */}
                 <div className="relative z-10 h-full flex flex-col justify-between">
                     <Link href="/" className="flex items-center gap-3 font-bold text-2xl font-heading group w-fit">
                         <div className="h-10 w-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:scale-105 transition-transform duration-300 shadow-xl shadow-indigo-500/10">
                             <HeartPulse className="h-6 w-6 text-indigo-300" />
                         </div>
                         <span className="tracking-tight text-indigo-50 group-hover:text-white transition-colors">SmartQueue</span>
                     </Link>

                     <div className="space-y-10">
                         <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="space-y-4 max-w-lg"
                         >
                             <h2 className="text-5xl font-extrabold font-heading leading-[1.1] tracking-tight text-white drop-shadow-md">
                                 The new standard for <br/>
                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-indigo-300 animate-pulse-slow">
                                     modern clinics.
                                 </span>
                             </h2>
                             <p className="text-lg text-slate-300 font-light leading-relaxed border-l-2 border-indigo-400/30 pl-4">
                                 Join thousands of providers and patients experiencing the future of effortless healthcare scheduling.
                             </p>
                         </motion.div>

                         {/* Aesthetic Feature Grid */}
                         <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Zap, label: "Instant Booking", desc: "No phone calls needed" },
                                { icon: Shield, label: "HIPAA Secure", desc: "Enterprise protection" },
                                { icon: Check, label: "Real-time Sync", desc: "Live queue updates" },
                                { icon: UserCheck, label: "Verified Doctors", desc: "Top rated specialists" }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm group cursor-default"
                                >
                                    <item.icon className="h-5 w-5 text-indigo-300 mb-2 group-hover:text-white transition-colors" />
                                    <h3 className="font-bold text-slate-100 text-sm">{item.label}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1">{item.desc}</p>
                                </motion.div>
                            ))}
                         </div>
                     </div>

                     <div className="flex items-center gap-6 text-xs font-medium text-slate-400">
                         <span>&copy; SmartQueue Inc.</span>
                         <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
                         <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                         <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                     </div>
                 </div>
            </div>

            {/* Right Side: Form Container - Optimized for Dark/Light Mode */}
            <div className="relative flex flex-col justify-center items-center p-6 md:p-12 bg-background transition-colors duration-300">
                <div className="absolute top-6 right-6 z-20">
                     <ThemeToggle />
                </div>
                
                {/* Mobile Header (Only visible on small screens) */}
                <div className="lg:hidden w-full absolute top-0 left-0 p-6 flex justify-between items-center bg-background/80 backdrop-blur-md border-b border-border z-10">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl font-heading text-foreground">
                         <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                             <HeartPulse className="h-5 w-5 text-primary" />
                         </div>
                         <span>SmartQueue</span>
                    </Link>
                </div>

                <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
                     {/* The form background needs to be clean in both modes. 
                         We rely on 'bg-background' of the parent, but we can wrap form content 
                         if we want a card look, or keep it clean. Keeping it clean is more modern. */}
                    {children}
                </div>
            </div>
        </div>
    )
}
