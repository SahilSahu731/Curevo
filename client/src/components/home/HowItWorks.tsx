"use client";

import { motion } from "framer-motion";

export default function HowItWorks() {
    const steps = [
        { num: 1, title: "Book Online", desc: "Choose your doctor and preferred slot from home." },
        { num: 2, title: "Check In", desc: "Mark your arrival digitally when you reach." },
        { num: 3, title: "Track Queue", desc: "Watch your position move live on your phone." },
        { num: 4, title: "Consult", desc: "Walk in exactly when it's your turn." }
    ];

    return (
        <section className="py-24 bg-background transition-colors duration-300">
            <div className="container px-4 md:px-6 mx-auto">
                 <div className="text-center mb-16 max-w-2xl mx-auto">
                     <h2 className="text-3xl font-bold font-heading text-foreground mb-4">How It Works</h2>
                     <p className="text-muted-foreground font-body">Simple steps to a hassle-free visit</p>
                 </div>

                 <div className="grid md:grid-cols-4 gap-8 relative">
                     {/* Connector Line (Desktop) */}
                     <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-border -z-10"></div>
                     
                     {steps.map((step, i) => (
                         <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="text-center bg-transparent group"
                         >
                             <div className="w-16 h-16 mx-auto bg-card border-4 border-muted rounded-full flex items-center justify-center text-xl font-bold text-primary shadow-md mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300 group-hover:border-primary/30">
                                 {step.num}
                             </div>
                             <h3 className="text-xl font-bold text-foreground mb-2 font-heading">{step.title}</h3>
                             <p className="text-muted-foreground text-sm px-4 font-body">{step.desc}</p>
                         </motion.div>
                     ))}
                 </div>
            </div>
        </section>
    );
}
