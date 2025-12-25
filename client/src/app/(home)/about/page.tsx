"use client";

import { motion } from "framer-motion";
import { Users, Heart, Globe, Award, Trophy, ArrowRight, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
    const stats = [
        { label: "Active Patients", value: "2M+", icon: Users },
        { label: "Qualified Doctors", value: "15k+", icon: Heart },
        { label: "Partner Clinics", value: "500+", icon: Globe },
        { label: "Awards Won", value: "25+", icon: Award },
    ];

    const team = [
        {
            name: "Dr. Sarah Mitchell",
            role: "Chief Medical Officer",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            bio: "Former Head of Cardiology at Mayo Clinic with 20 years of experience."
        },
        {
            name: "David Chen",
            role: "CTO & Co-Founder",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
            bio: "Tech visionary with a background in AI and machine learning from Stanford."
        },
        {
            name: "Elena Rodriguez",
            role: "Head of Patient Experience",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
            bio: "Passionate advocate for patient rights and healthcare accessibility."
        },
        {
            name: "James Wilson",
            role: "VP of Operations",
            image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
            bio: "Expert in scaling healthcare infrastructure and logistics."
        }
    ];

    const timeline = [
        { year: "2020", title: "Inception", description: "Curevo was founded with a simple mission: to make healthcare accessible to everyone, everywhere." },
        { year: "2021", title: "First Milestone", description: "Launched our beta platform reaching 10,000 active users and 50 partner clinics." },
        { year: "2022", title: "Expansion", description: "Expanded operations to 5 major cities and introduced telemedicine features." },
        { year: "2023", title: "AI Integration", description: "Integrated advanced AI for symptom checking and smart scheduling." },
        { year: "2024", title: "Global Reach", description: "Partnered with international health organizations to bring Curevo to a global stage." },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-body overflow-x-hidden">
            {/* --- Hero Section --- */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900 rounded-b-[4rem] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-black/60 z-10" />
                    <img 
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070" 
                        alt="Medical Team" 
                        className="w-full h-full object-cover opacity-50"
                    />
                </div>
                
                <div className="container mx-auto px-4 relative z-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge className="bg-emerald-500 text-white mb-6 px-4 py-1 text-base rounded-full border-none">Our Mission</Badge>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading tracking-tight leading-tight">
                            Redefining Healthcare <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">For The Modern World</span>
                        </h1>
                        <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-10">
                            We are bridging the gap between patients and providers with cutting-edge technology, ensuring that quality care is just a click away.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                             <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 text-lg h-14 shadow-lg shadow-emerald-900/20">
                                Join Our Journey
                             </Button>
                             <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 text-lg h-14 backdrop-blur-sm">
                                Read Our Story
                             </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- Stats Section --- */}
            <section className="py-20 -mt-20 relative z-30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-100 dark:border-zinc-800 text-center group hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-500 transition-colors duration-300">
                                    <stat.icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">{stat.value}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Story Timeline --- */}
            <section className="py-32 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white font-heading mb-4">Our Journey</h2>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                            From a small garage startup to a global healthcare platform, here is how we got here.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

                        <div className="space-y-24">
                            {timeline.map((item, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ margin: "-100px" }}
                                    className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                                >
                                    <div className="flex-1 text-center md:text-right">
                                        {index % 2 === 0 && (
                                            <div className="md:pr-12">
                                                <div className="text-5xl font-black text-emerald-100 dark:text-emerald-900/20 mb-2">{item.year}</div>
                                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">{item.title}</h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed md:ml-auto max-w-md">{item.description}</p>
                                            </div>
                                        )}
                                        {index % 2 !== 0 && (
                                           <div className="md:pl-12 text-center md:text-left visible md:invisible">
                                               {/* Placeholder for layout balance */}
                                           </div>
                                        )}
                                    </div>

                                    <div className="relative z-10 w-12 h-12 bg-white dark:bg-zinc-950 border-4 border-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center shrink-0">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                         {index % 2 !== 0 && (
                                            <div className="md:pl-12">
                                                <div className="text-5xl font-black text-emerald-100 dark:text-emerald-900/20 mb-2">{item.year}</div>
                                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">{item.title}</h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed md:mr-auto max-w-md">{item.description}</p>
                                            </div>
                                        )}
                                         {index % 2 === 0 && (
                                           <div className="md:pr-12 text-center md:text-right visible md:invisible">
                                               {/* Placeholder for layout balance */}
                                           </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

             {/* --- Team Section --- */}
             <section className="py-32 bg-zinc-50 dark:bg-black">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-20">
                        <Badge variant="outline" className="border-emerald-500 text-emerald-600 mb-4 px-4 py-1">The Brains</Badge>
                        <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white font-heading mb-6">Meet The Leadership</h2>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                            A diverse team of medical experts, engineers, and creatives working together.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="border-none shadow-none bg-transparent hover:bg-white dark:hover:bg-zinc-900 transition-colors duration-300 rounded-2xl overflow-hidden group">
                                     <div className="aspect-square relative overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 mb-6 mx-4 mt-4">
                                         <img 
                                            src={member.image} 
                                            alt={member.name} 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" 
                                         />
                                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6 gap-4">
                                             <a href="#" className="p-2 bg-white/20 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-sm transition-all"><Linkedin className="w-5 h-5"/></a>
                                             <a href="#" className="p-2 bg-white/20 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-sm transition-all"><Twitter className="w-5 h-5"/></a>
                                         </div>
                                     </div>
                                     <CardContent className="text-center px-4 pb-8">
                                         <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{member.name}</h3>
                                         <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-4">{member.role}</p>
                                         <p className="text-zinc-500 text-sm leading-relaxed">{member.bio}</p>
                                     </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <div className="p-12 bg-emerald-600 rounded-3xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                             <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
                             
                             <div className="relative z-10 max-w-2xl mx-auto">
                                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to make a difference?</h2>
                                 <p className="text-emerald-100 text-lg mb-8">
                                     We are always looking for talented individuals to join our mission. Check out our open positions.
                                 </p>
                                 <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 h-12 rounded-full">
                                     View Careers <ArrowRight className="w-4 h-4 ml-2" />
                                 </Button>
                             </div>
                        </div>
                    </div>
                </div>
             </section>
        </div>
    );
}
