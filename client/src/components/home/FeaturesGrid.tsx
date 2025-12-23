"use client";

import { Zap, Shield, Smartphone, Clock, Users, Activity } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Real-Time Tracking",
    description: "Track your position in the queue live from your phone. No more guessing when it's your turn.",
    icon: Clock,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Instant Booking",
    description: "Book appointments in seconds. Choose your preferred doctor and time slot with ease.",
    icon: Zap,
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Smart Notifications",
    description: "Get notified when you need to leave for the clinic. We handle the timing for you.",
    icon: Smartphone,
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
  {
    title: "Doctor Dashboard",
    description: "Powerful tools for doctors to manage patient flow and reduce administrative burden.",
    icon: Activity,
    color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  {
    title: "Crowd Management",
    description: "Reduce waiting room congestion and maintain a safer, healthier environment.",
    icon: Users,
    color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  },
  {
    title: "Secure & Private",
    description: "Your health data is encrypted and protected with enterprise-grade security.",
    icon: Shield,
    color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
};

export default function FeaturesGrid() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6"
          >
             Everything you need for a <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Better Clinic Experience</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
          >
            We've streamlined the entire process from booking to consultation, making healthcare accessible, predictable, and stress-free.
          </motion.p>
        </div>

        <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
            {features.map((feature, idx) => (
                <motion.div 
                    key={idx} 
                    variants={item}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all group"
                >
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        {feature.description}
                    </p>
                </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
