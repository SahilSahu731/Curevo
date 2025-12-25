"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, User, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function BlogPage() {
    const featuredPost = {
        title: "The Future of AI in Modern Healthcare Diagnosis",
        excerpt: "How machine learning models are assisting doctors in early detection of chronic diseases and improving patient outcomes globally.",
        category: "Technology",
        author: "Dr. Sarah Mitchell",
        date: "Oct 24, 2024",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2000"
    };

    const posts = [
        {
            id: 1,
            title: "5 Tips for Maintaining Heart Health in Your 30s",
            excerpt: "Simple lifestyle changes that can significantly reduce your risk of cardiovascular issues later in life.",
            category: "Wellness",
            author: "Dr. James Wilson",
            date: "Oct 22, 2024",
            readTime: "5 min read",
            image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 2,
            title: "Understanding Telemedicine: A Patient's Guide",
            excerpt: "Everything you need to know about remote consultations, prescriptions, and follow-ups.",
            category: "Guides",
            author: "Elena Rodriguez",
            date: "Oct 20, 2024",
            readTime: "6 min read",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 3,
            title: "Curevo raises Series B to expand nationwide",
            excerpt: "We are excited to announce our latest funding round led by major healthcare venture partners.",
            category: "Company News",
            author: "David Chen",
            date: "Oct 15, 2024",
            readTime: "3 min read",
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 4,
            title: "The Impact of Sleep on Mental Health",
            excerpt: "New research suggests a direct correlation between sleep quality and anxiety levels.",
            category: "Research",
            author: "Dr. Emily Wong",
            date: "Oct 10, 2024",
            readTime: "7 min read",
            image: "https://images.unsplash.com/photo-1541781777621-af1a94294086?auto=format&fit=crop&q=80&w=800"
        },
         {
            id: 5,
            title: "Dietary Myths Debunked by Experts",
            excerpt: "Separating fact from fiction when it comes to nutrition and healthy eating habits.",
            category: "Nutrition",
            author: "Lisa Ray",
            date: "Oct 05, 2024",
            readTime: "4 min read",
            image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800"
        },
         {
            id: 6,
            title: "Managing Stress in High-Pressure Jobs",
            excerpt: "Practical strategies for professionals to avoid burnout and maintain work-life balance.",
            category: "Mental Health",
            author: "Mark Davis",
            date: "Oct 01, 2024",
            readTime: "5 min read",
            image: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&q=80&w=800"
        }
    ];

    const categories = ["All", "Technology", "Wellness", "Company News", "Guides", "Research", "Nutrition"];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-body pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* --- Header --- */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white font-heading mb-4">The Curevo <span className="text-emerald-600">Journal</span></h1>
                    <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                        Insights, updates, and expert advice for a healthier life.
                    </p>
                </div>

                {/* --- Featured Post --- */}
                <div className="mb-20">
                    <div className="group relative rounded-3xl overflow-hidden bg-zinc-900 h-[500px] shadow-2xl shadow-zinc-200/50 dark:shadow-none cursor-pointer">
                        <img 
                            src={featuredPost.image} 
                            alt={featuredPost.title} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                        
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                            <Badge className="bg-emerald-600 border-none text-white mb-4 px-3 py-1 text-sm">{featuredPost.category}</Badge>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-emerald-300 transition-colors">
                                {featuredPost.title}
                            </h2>
                            <p className="text-lg text-zinc-300 mb-6 line-clamp-2 md:line-clamp-none">
                                {featuredPost.excerpt}
                            </p>
                            
                            <div className="flex items-center gap-6 text-sm text-zinc-400 font-medium">
                                <span className="flex items-center gap-2"><User className="w-4 h-4" /> {featuredPost.author}</span>
                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {featuredPost.date}</span>
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {featuredPost.readTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Categories --- */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                     {categories.map((cat, i) => (
                         <Button 
                            key={i} 
                            variant="outline" 
                            className={`rounded-full border-zinc-200 dark:border-zinc-800 ${i === 0 ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                        >
                             {cat}
                         </Button>
                     ))}
                </div>

                {/* --- Grid --- */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {posts.map((post) => (
                         <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * post.id }}
                        >
                             <Card className="h-full border-none shadow-sm hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-zinc-900 group overflow-hidden cursor-pointer rounded-2xl">
                                 <div className="h-48 overflow-hidden relative">
                                     <img 
                                        src={post.image} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                     />
                                     <div className="absolute top-4 left-4">
                                         <Badge className="bg-white/90 text-zinc-900 backdrop-blur-sm border-none shadow-sm">{post.category}</Badge>
                                     </div>
                                 </div>
                                 <CardContent className="p-6">
                                     <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-3 font-medium">
                                         <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                                         <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                     </div>
                                     <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                         {post.title}
                                     </h3>
                                     <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                                         {post.excerpt}
                                     </p>
                                 </CardContent>
                                 <CardFooter className="p-6 pt-0 mt-auto">
                                     <div className="w-full pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                                                  {post.author[0]}
                                              </div>
                                              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{post.author}</span>
                                          </div>
                                          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                              Read <ArrowRight className="w-3 h-3" />
                                          </span>
                                     </div>
                                 </CardFooter>
                             </Card>
                         </motion.div>
                     ))}
                </div>

                <div className="mt-20 text-center">
                    <Button variant="outline" size="lg" className="rounded-full px-8 h-12 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                        Load More Articles
                    </Button>
                </div>
            </div>
        </div>
    );
}
