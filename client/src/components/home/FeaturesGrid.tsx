"use client";

import { CalendarClock, Info, Smartphone, Clock, Users, Activity } from "lucide-react";
import { motion, Variants } from "framer-motion";

const features = [
  {
    title: "Real-Time Tracking",
    description: "View queue updates sent by the clinic workflow. Displayed times remain estimates.",
    icon: Clock,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Appointment Requests",
    description: "Select a listed clinician and available slot. A request does not guarantee care or availability.",
    icon: CalendarClock,
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Smart Notifications",
    description: "View prototype queue notifications when the server emits an appointment update.",
    icon: Smartphone,
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
  {
    title: "Doctor Dashboard",
    description: "Role-restricted views demonstrate appointment and queue management.",
    icon: Activity,
    color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  {
    title: "Crowd Management",
    description: "Review a proposed queue order and update appointment status.",
    icon: Users,
    color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  },
  {
    title: "Know the Limitations",
    description: "Review privacy and safety notices before entering data or joining a video visit.",
    icon: Info,
    color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
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
            These are prototype workflows for evaluation. They do not promise access, timing, availability, or clinical outcomes.
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
