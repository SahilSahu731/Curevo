import { jsPDF } from "jspdf";

export interface AssessmentResult {
  toolId: string;
  toolTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: "excellent" | "good" | "average" | "poor";
  statusLabel: string;
  date: string;
  summary: string;
  metrics: { label: string; value: string | number; unit?: string; status?: "good" | "warning" | "bad" }[];
  recommendations: string[];
  detailedAnalysis?: string;
}

// BMI Calculator
export const calculateBMI = (weight: number, height: number): { bmi: number; category: string; status: AssessmentResult["status"] } => {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  
  let category: string;
  let status: AssessmentResult["status"];
  
  if (bmi < 18.5) {
    category = "Underweight";
    status = "average";
  } else if (bmi < 25) {
    category = "Normal Weight";
    status = "excellent";
  } else if (bmi < 30) {
    category = "Overweight";
    status = "average";
  } else {
    category = "Obese";
    status = "poor";
  }
  
  return { bmi: parseFloat(bmi.toFixed(1)), category, status };
};

// Calculate BMR (Basal Metabolic Rate)
export const calculateBMR = (weight: number, height: number, age: number, isMale: boolean): number => {
  if (isMale) {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  }
  return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
};

// Stress Score Calculator (PSS-based)
export const calculateStressScore = (answers: Record<string, number>): { score: number; level: string; status: AssessmentResult["status"] } => {
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxPossible = Object.keys(answers).length * 4;
  const normalized = (total / maxPossible) * 40; // PSS scale is 0-40
  
  let level: string;
  let status: AssessmentResult["status"];
  
  if (normalized <= 13) {
    level = "Low Stress";
    status = "excellent";
  } else if (normalized <= 26) {
    level = "Moderate Stress";
    status = "average";
  } else {
    level = "High Stress";
    status = "poor";
  }
  
  return { score: Math.round(normalized), level, status };
};

// Heart Risk Calculator
export const calculateHeartRisk = (answers: Record<string, number>): { score: number; riskLevel: string; status: AssessmentResult["status"] } => {
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxPossible = Object.keys(answers).length * 4;
  const percentage = (total / maxPossible) * 100;
  
  let riskLevel: string;
  let status: AssessmentResult["status"];
  
  if (percentage < 25) {
    riskLevel = "Low Risk";
    status = "excellent";
  } else if (percentage < 50) {
    riskLevel = "Moderate Risk";
    status = "good";
  } else if (percentage < 75) {
    riskLevel = "Elevated Risk";
    status = "average";
  } else {
    riskLevel = "High Risk";
    status = "poor";
  }
  
  return { score: Math.round(100 - percentage), riskLevel, status };
};

// Sleep Quality Calculator
export const calculateSleepQuality = (answers: Record<string, number>): { score: number; quality: string; status: AssessmentResult["status"] } => {
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxPossible = Object.keys(answers).length * 3;
  const percentage = 100 - (total / maxPossible) * 100;
  
  let quality: string;
  let status: AssessmentResult["status"];
  
  if (percentage >= 80) {
    quality = "Excellent";
    status = "excellent";
  } else if (percentage >= 60) {
    quality = "Good";
    status = "good";
  } else if (percentage >= 40) {
    quality = "Fair";
    status = "average";
  } else {
    quality = "Poor";
    status = "poor";
  }
  
  return { score: Math.round(percentage), quality, status };
};

// Generic Score Calculator for other assessments
export const calculateGenericScore = (answers: Record<string, number>, maxPerQuestion: number = 4): { score: number; percentage: number; status: AssessmentResult["status"] } => {
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxPossible = Object.keys(answers).length * maxPerQuestion;
  const percentage = 100 - (total / maxPossible) * 100;
  
  let status: AssessmentResult["status"];
  if (percentage >= 75) status = "excellent";
  else if (percentage >= 50) status = "good";
  else if (percentage >= 25) status = "average";
  else status = "poor";
  
  return { score: Math.round(percentage), percentage, status };
};

// Generate detailed result based on tool type
export const generateDetailedResult = (
  toolId: string,
  toolTitle: string,
  answers: Record<string, number>
): AssessmentResult => {
  const date = new Date().toLocaleDateString("en-IN", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  switch (toolId) {
    case "bmi": {
      const weight = answers["b1"] || 70;
      const height = answers["b2"] || 170;
      const age = answers["b3"] || 25;
      const isMale = answers["b4"] === 0;
      
      const { bmi, category, status } = calculateBMI(weight, height);
      const bmr = calculateBMR(weight, height, age, isMale);
      const tdee = bmr * (1.2 + (answers["b5"] || 0) * 0.175); // Activity multiplier
      
      const idealWeightLow = 18.5 * Math.pow(height / 100, 2);
      const idealWeightHigh = 24.9 * Math.pow(height / 100, 2);
      
      return {
        toolId,
        toolTitle,
        score: bmi,
        maxScore: 40,
        percentage: Math.max(0, 100 - Math.abs(bmi - 22) * 5),
        status,
        statusLabel: category,
        date,
        summary: `Your BMI is ${bmi} kg/m², which falls in the "${category}" category.`,
        metrics: [
          { label: "BMI", value: bmi, unit: "kg/m²", status: status === "excellent" ? "good" : status === "average" ? "warning" : "bad" },
          { label: "Weight", value: weight, unit: "kg" },
          { label: "Height", value: height, unit: "cm" },
          { label: "BMR", value: Math.round(bmr), unit: "kcal/day" },
          { label: "Daily Calories (TDEE)", value: Math.round(tdee), unit: "kcal/day" },
          { label: "Ideal Weight Range", value: `${Math.round(idealWeightLow)} - ${Math.round(idealWeightHigh)}`, unit: "kg" },
        ],
        recommendations: bmi < 18.5 
          ? ["Increase caloric intake with nutrient-dense foods", "Include strength training to build muscle", "Consult a dietitian for a personalized meal plan"]
          : bmi < 25 
          ? ["Maintain your current healthy lifestyle", "Continue regular physical activity", "Focus on balanced nutrition"]
          : ["Aim for a moderate caloric deficit", "Increase physical activity to 150+ min/week", "Reduce processed foods and sugars", "Consider consulting a healthcare provider"],
        detailedAnalysis: `Based on your height of ${height}cm and weight of ${weight}kg, your Body Mass Index (BMI) is ${bmi}. Your Basal Metabolic Rate (BMR) is approximately ${Math.round(bmr)} calories per day, which is the energy your body needs at rest. With your activity level, your Total Daily Energy Expenditure (TDEE) is around ${Math.round(tdee)} calories.`
      };
    }

    case "stress": {
      const { score, level, status } = calculateStressScore(answers);
      return {
        toolId,
        toolTitle,
        score,
        maxScore: 40,
        percentage: Math.max(0, 100 - (score / 40) * 100),
        status,
        statusLabel: level,
        date,
        summary: `Your Perceived Stress Score (PSS) is ${score}/40, indicating ${level.toLowerCase()}.`,
        metrics: [
          { label: "Stress Score", value: score, unit: "/40", status: status === "excellent" ? "good" : status === "average" ? "warning" : "bad" },
          { label: "Stress Level", value: level },
          { label: "Control Perception", value: score < 20 ? "Good" : "Needs Work", status: score < 20 ? "good" : "warning" },
          { label: "Emotional State", value: score < 15 ? "Stable" : score < 25 ? "Fluctuating" : "Unstable" },
        ],
        recommendations: score <= 13 
          ? ["Continue your current stress management practices", "Maintain work-life balance", "Keep up regular exercise and sleep routines"]
          : score <= 26

          ? ["Practice daily mindfulness or meditation (10-15 min)", "Establish a consistent sleep schedule", "Limit caffeine and alcohol intake", "Consider talking to someone you trust"]
          : ["Seek professional mental health support", "Practice deep breathing exercises daily", "Reduce workload if possible", "Prioritize self-care activities", "Consider stress management therapy"],
        detailedAnalysis: `Your responses indicate a ${level.toLowerCase()} level. The PSS measures the degree to which situations in your life are appraised as stressful. Scores ranging from 0-13 indicate low stress, 14-26 indicate moderate stress, and 27-40 indicate high stress.`
      };
    }

    case "heart": {
      const { score, riskLevel, status } = calculateHeartRisk(answers);
      const age = answers["h1"] || 30;
      return {
        toolId,
        toolTitle,
        score,
        maxScore: 100,
        percentage: score,
        status,
        statusLabel: riskLevel,
        date,
        summary: `Your cardiovascular health score is ${score}/100, indicating ${riskLevel.toLowerCase()}.`,
        metrics: [
          { label: "Heart Health Score", value: score, unit: "/100", status: status === "excellent" ? "good" : status === "good" ? "good" : status === "average" ? "warning" : "bad" },
          { label: "Risk Category", value: riskLevel },
          { label: "Age Factor", value: age < 45 ? "Low" : age < 60 ? "Moderate" : "Elevated" },
          { label: "Lifestyle Score", value: Math.round(score * 0.7), unit: "/70" },
        ],
        recommendations: score >= 75 
          ? ["Maintain your heart-healthy lifestyle", "Continue regular cardiovascular exercise", "Keep monitoring blood pressure annually"]
          : score >= 50 
          ? ["Increase aerobic exercise to 150 min/week", "Reduce sodium intake", "Monitor cholesterol levels", "Maintain healthy weight"]
          : ["Consult a cardiologist for detailed assessment", "Quit smoking if applicable", "Adopt the DASH or Mediterranean diet", "Monitor blood pressure regularly", "Consider medication if advised"],
        detailedAnalysis: `This assessment evaluates key cardiovascular risk factors including smoking status, family history, exercise habits, blood pressure, diet, and cholesterol. Your score of ${score} suggests ${riskLevel.toLowerCase()}. Regular monitoring and lifestyle modifications can significantly improve heart health.`
      };
    }

    case "sleep": {
      const { score, quality, status } = calculateSleepQuality(answers);
      const sleepHours = answers["sl1"] || 7;
      return {
        toolId,
        toolTitle,
        score,
        maxScore: 100,
        percentage: score,
        status,
        statusLabel: `${quality} Sleep Quality`,
        date,
        summary: `Your sleep quality score is ${score}/100, rated as "${quality}".`,
        metrics: [
          { label: "Sleep Quality Score", value: score, unit: "/100", status: status === "excellent" ? "good" : status === "good" ? "good" : "warning" },
          { label: "Average Sleep", value: sleepHours, unit: "hours/night" },
          { label: "Sleep Efficiency", value: score >= 70 ? "Good" : "Needs Improvement" },
          { label: "Sleep Hygiene", value: score >= 60 ? "Adequate" : "Poor" },
        ],
        recommendations: score >= 80 
          ? ["Maintain your consistent sleep schedule", "Continue avoiding screens before bed", "Keep your bedroom cool and dark"]
          : score >= 50 
          ? ["Aim for 7-9 hours of sleep nightly", "Avoid caffeine after 2 PM", "Create a relaxing bedtime routine", "Limit screen time 1 hour before bed"]
          : ["Consult a sleep specialist", "Consider cognitive behavioral therapy for insomnia", "Evaluate for sleep apnea", "Create a strict sleep schedule", "Eliminate bedroom distractions"],
        detailedAnalysis: `Based on your responses, you average ${sleepHours} hours of sleep and your overall sleep quality is ${quality.toLowerCase()}. Quality sleep is essential for cognitive function, immune health, and emotional well-being. Adults typically need 7-9 hours of quality sleep per night.`
      };
    }

    default: {
      const { score, percentage, status } = calculateGenericScore(answers);
      const statusLabels = { excellent: "Excellent", good: "Good", average: "Average", poor: "Needs Attention" };
      return {
        toolId,
        toolTitle,
        score,
        maxScore: 100,
        percentage,
        status,
        statusLabel: statusLabels[status],
        date,
        summary: `Your assessment score is ${score}/100.`,
        metrics: [
          { label: "Overall Score", value: score, unit: "/100", status: status === "excellent" || status === "good" ? "good" : status === "average" ? "warning" : "bad" },
          { label: "Category", value: statusLabels[status] },
        ],
        recommendations: [
          "Review your responses and identify areas for improvement",
          "Consider consulting a healthcare professional for personalized advice",
          "Track your progress by retaking this assessment monthly",
        ],
        detailedAnalysis: `Your responses have been analyzed to generate this health score. This score provides a general indication of your current status in this area.`
      };
    }
  }
};

// PDF Report Generator
export const generatePDFReport = (result: AssessmentResult): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [99, 102, 241]; // Indigo
  const textColor: [number, number, number] = [30, 41, 59]; // Slate 800
  const mutedColor: [number, number, number] = [100, 116, 139]; // Slate 500
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Health Assessment Report", 20, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${result.date}`, 20, 35);
  
  // Assessment Title
  doc.setTextColor(...textColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(result.toolTitle, 20, 55);
  
  // Score Box
  const scoreBoxY = 65;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(20, scoreBoxY, pageWidth - 40, 35, 3, 3, "F");
  
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  const statusColors: Record<string, [number, number, number]> = {
    excellent: [16, 185, 129],
    good: [59, 130, 246],
    average: [245, 158, 11],
    poor: [239, 68, 68]
  };
  doc.setTextColor(...(statusColors[result.status] || textColor));
  doc.text(`${result.score}`, 30, scoreBoxY + 22);
  
  doc.setFontSize(12);
  doc.setTextColor(...mutedColor);
  doc.text(`/ ${result.maxScore}`, 55, scoreBoxY + 22);
  
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "bold");
  doc.text(result.statusLabel, 90, scoreBoxY + 22);
  
  // Summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);
  const summaryLines = doc.splitTextToSize(result.summary, pageWidth - 40);
  doc.text(summaryLines, 20, 115);
  
  // Metrics
  let yPos = 135;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Key Metrics", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  result.metrics.forEach((metric) => {
    doc.setTextColor(...mutedColor);
    doc.text(metric.label + ":", 25, yPos);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.text(`${metric.value}${metric.unit ? " " + metric.unit : ""}`, 90, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
  });
  
  // Recommendations
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textColor);
  doc.text("Recommendations", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  result.recommendations.forEach((rec, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 45);
    doc.text(lines, 25, yPos);
    yPos += lines.length * 6 + 3;
  });
  
  // Detailed Analysis
  if (result.detailedAnalysis) {
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Analysis", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mutedColor);
    const analysisLines = doc.splitTextToSize(result.detailedAnalysis, pageWidth - 40);
    doc.text(analysisLines, 20, yPos);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text("This report is for informational purposes only and does not constitute medical advice.", 20, 280);
  doc.text("Please consult a healthcare professional for medical guidance.", 20, 285);
  
  // Save
  doc.save(`${result.toolTitle.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.pdf`);
};
