"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
    MapPin, 
    Phone, 
    Mail, 
    MessageSquare, 
    Send, 
    HelpCircle,
    Building,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Message sent successfully! We'll get back to you soon.");
        setIsSubmitting(false);
        (e.target as HTMLFormElement).reset();
    };

    const faq = [
        {
            question: "How do I book an appointment?",
            answer: "You can book an appointment by navigating to the 'Doctors' page, selecting a doctor, and choosing an available time slot. You need to be logged in to confirm the booking."
        },
        {
            question: "Is my medical data secure?",
            answer: "Absolutely. We use enterprise-grade encryption and comply with HIPAA and GDPR standards to ensure your personal health information is always protected."
        },
        {
            question: "Can I cancel an appointment?",
            answer: "Yes, you can cancel or reschedule appointments from your Dashboard up to 24 hours before the scheduled time without any penalty."
        },
        {
            question: "Do you offer telemedicine services?",
            answer: "Yes, many of our doctors offer video consultations. Look for the video icon on the doctor's profile to see if they support remote visits."
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-body pt-24 pb-20">
            {/* Header */}
            <div className="container mx-auto px-4 max-w-7xl mb-16 text-center">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white font-heading mb-6"
                >
                    Get in <span className="text-emerald-600">Touch</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto"
                >
                    Have questions about our platform? We're here to help. Reach out to our team or find answers in our FAQ.
                </motion.p>
            </div>

            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left Column: Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-none shadow-2xl shadow-emerald-900/10 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                            <CardContent className="p-8 md:p-10">
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Send us a message</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mb-8">We usually respond within 24 hours.</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>First Name</Label>
                                            <Input placeholder="John" required className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Name</Label>
                                            <Input placeholder="Doe" required className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input type="email" placeholder="john@example.com" required className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Subject</Label>
                                        <Input placeholder="How can we help?" required className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Message</Label>
                                        <Textarea 
                                            placeholder="Tell us more about your inquiry..." 
                                            className="min-h-[150px] bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 resize-none" 
                                            required
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 h-12 text-lg font-bold"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Sending..." : "Send Message"} <Send className="w-4 h-4 ml-2" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right Column: Info & Map */}
                    <div className="space-y-8">
                        {/* Info Cards */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center hover:border-emerald-500 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                                    <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Call Us</h4>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
                                <a href="tel:+15550000000" className="text-emerald-600 font-bold hover:underline">+1 (555) 000-0000</a>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center hover:border-blue-500 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Email Us</h4>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2">Friendly team is here to help.</p>
                                <a href="mailto:support@curevo.com" className="text-blue-600 font-bold hover:underline">support@curevo.com</a>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center hover:border-purple-500 transition-colors group sm:col-span-2"
                            >
                                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                                    <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Visit Us</h4>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2">Come say hello at our office HQ.</p>
                                <p className="text-zinc-900 dark:text-white font-medium">100 Smith Street, Collingwood VIC 3066 AU</p>
                            </motion.div>
                        </div>

                        {/* Map */}
                        <motion.div 
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: 0.7 }}
                             className="rounded-2xl overflow-hidden h-64 border border-zinc-200 dark:border-zinc-800"
                        >
                            <iframe 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                loading="lazy" 
                                allowFullScreen 
                                className="grayscale hover:grayscale-0 transition-all duration-700"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345093747!2d144.9537353153169!3d-37.817323442021134!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0xb6899234e561db11!2sEnvato!5e0!3m2!1sen!2sus!4v1620242200544!5m2!1sen!2sus"
                            ></iframe>
                        </motion.div>

                        {/* FAQ Quick Links */}
                         <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl p-6">
                             <div className="flex items-center gap-3 mb-4">
                                 <HelpCircle className="w-5 h-5 text-zinc-400" />
                                 <h4 className="font-bold text-zinc-900 dark:text-white">Frequently Asked Questions</h4>
                             </div>
                             <Accordion type="single" collapsible className="w-full">
                                {faq.map((item, i) => (
                                    <AccordionItem key={i} value={`item-${i}`} className="border-zinc-200 dark:border-zinc-800">
                                        <AccordionTrigger className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:no-underline hover:text-emerald-600 dark:hover:text-emerald-400">{item.question}</AccordionTrigger>
                                        <AccordionContent className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                             </Accordion>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
