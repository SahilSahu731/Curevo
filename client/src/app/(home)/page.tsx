"use client";

import SearchHero from "@/components/home/SearchHero";
import PopularCategories from "@/components/home/PopularCategories";
import BentoGrid from "@/components/home/BentoGrid";
import HowItWorks from "@/components/home/HowItWorks";
import StatsSection from "@/components/home/StatsSection";
import TrustedStrip from "@/components/home/TrustedStrip";

export default function LandingPage() {
  return (
    <>
        <SearchHero />
        <TrustedStrip />
        <PopularCategories />
        
        {/* Wider Content Containers */}
        <div className="w-full max-w-[1600px] mx-auto">
                <BentoGrid />
                <HowItWorks />
        </div>

        <StatsSection />
    </>
  );
}