"use client";

import { motion } from "framer-motion";

export default function StatsSection() {
    return (
      <section className="py-24 bg-foreground py-24 text-background relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-background/10">
                {[
                    { val: "10k+", label: "Patients Served" },
                    { val: "500+", label: "Doctors" },
                    { val: "99.9%", label: "Uptime" },
                    { val: "15m", label: "Avg Wait Time" },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="p-4"
                    >
                        <p className="text-4xl md:text-6xl font-extrabold mb-2 font-heading text-background">{stat.val}</p>
                        <p className="text-background/60 text-sm md:text-base uppercase tracking-widest font-medium font-body">{stat.label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>
    );
}
