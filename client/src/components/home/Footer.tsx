import Link from "next/link";
import { HeartPulse } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-card border-t border-border pt-16 pb-8 text-muted-foreground transition-colors duration-300">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1 space-y-6">
                        <Link href="/" className="flex items-center gap-2 text-foreground font-bold text-2xl font-heading">
                            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                                <HeartPulse className="h-6 w-6 text-primary-foreground" />
                            </div>
                            SmartQueue
                        </Link>
                        <p className="text-base leading-relaxed max-w-xs font-body">
                             Revolutionizing healthcare access with intelligent queue management and real-time scheduling.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-foreground font-bold mb-6 font-heading">Product</h4>
                        <ul className="space-y-4 text-sm font-medium font-body">
                            <li><Link href="/book" className="hover:text-primary transition-colors">Book Appointment</Link></li>
                            <li><Link href="/dashboard" className="hover:text-primary transition-colors">Track Queue</Link></li>
                            <li><Link href="/doctors" className="hover:text-primary transition-colors">Find Doctors</Link></li>
                            <li><Link href="/clinics" className="hover:text-primary transition-colors">Clinics</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-foreground font-bold mb-6 font-heading">Company</h4>
                        <ul className="space-y-4 text-sm font-medium font-body">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-foreground font-bold mb-6 font-heading">Legal</h4>
                        <ul className="space-y-4 text-sm font-medium font-body">
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>
                
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 font-body text-sm">
                    <p>&copy; {new Date().getFullYear()} SmartQueue Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
                        <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
                        <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
