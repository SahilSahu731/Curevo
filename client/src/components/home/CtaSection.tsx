"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CtaSection() {
    return (
        <section className="py-24 bg-background transition-colors duration-300">
            <div className="container px-4 md:px-6 mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-brand rounded-[2.5rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20"
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none animate-pulse delay-700"></div>
                    
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight font-heading">
                            Ready to transform your healthcare experience?
                        </h2>
                        <p className="text-white/90 text-lg md:text-xl font-light font-body">
                            Join thousands of happy patients who have said goodbye to long waiting hours.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/register">
                                    <Button size="lg" className="h-14 px-8 text-lg bg-background text-foreground hover:bg-background/90 w-full sm:w-auto font-bold border-2 border-transparent font-heading">
                                        Get Started Now
                                    </Button>
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/book">
                                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-white/30 text-white hover:bg-white/10 bg-transparent w-full sm:w-auto font-medium font-heading">
                                        Book First Appointment
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
