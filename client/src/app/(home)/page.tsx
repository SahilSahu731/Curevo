"use client";

import GlobalNavbar from "@/components/home/GlobalNavbar";
import SearchHero from "@/components/home/SearchHero";
import PopularCategories from "@/components/home/PopularCategories";
import BentoGrid from "@/components/home/BentoGrid";
import HowItWorks from "@/components/home/HowItWorks";
import StatsSection from "@/components/home/StatsSection";
import Footer from "@/components/home/Footer";
import TrustedStrip from "@/components/home/TrustedStrip";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black font-body">
       <GlobalNavbar />
       
       <main className="pt-20"> {/* Offset for Fixed Navbar */}
            <SearchHero />
            <TrustedStrip />
            <PopularCategories />
            
            {/* Wider Content Containers */}
            <div className="w-full max-w-[1600px] mx-auto">
                 <BentoGrid />
                 <HowItWorks />
            </div>

            <StatsSection />
       </main>
       
       <Footer />
    </div>
  );
}