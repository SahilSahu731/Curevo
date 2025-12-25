"use client";

import { useState } from "react";
import { HealthHero } from "@/components/health-check/HealthHero";
import { ToolGrid, HealthTool } from "@/components/health-check/ToolGrid";
import { AssessmentModal } from "@/components/health-check/AssessmentModal";
import { FeaturesSection } from "@/components/health-check/FeaturesSection";

export default function HealthCheckPage() {
  const [selectedTool, setSelectedTool] = useState<HealthTool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectTool = (tool: HealthTool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTool(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <HealthHero />
      <ToolGrid onSelect={handleSelectTool} />
      <FeaturesSection />
      
      <AssessmentModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        tool={selectedTool}
      />
    </div>
  );
}
