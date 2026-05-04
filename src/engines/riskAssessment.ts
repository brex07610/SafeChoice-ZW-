/**
 * SafeChoice ZW - Risk Assessment Engine
 * Based on WHO and Zimbabwe NAC guidelines for youth health.
 */

export enum RiskLevel {
  LOW = "Low",
  MODERATE = "Moderate",
  HIGH = "High",
}

export interface Recommendation {
  text: string;
  icon: string;
}

export const ASSESSMENT_SCHEMA = {
  questions: [
    {
      id: "age_check",
      text: "How old are you?",
      type: "single",
      options: [
        { label: "Under 18", value: "u18", next: "age_warning" },
        { label: "18-24", value: "target", next: "partner_count" },
        { label: "25+", value: "above", next: "partner_count" }
      ]
    },
    {
      id: "partner_count",
      text: "How many sexual partners have you had in the last 6 months?",
      type: "single",
      options: [
        { label: "None", value: "0", next: "condom_use" },
        { label: "One", value: "1", next: "condom_use" },
        { label: "Two or more", value: "2+", next: "condom_use" }
      ]
    },
    {
      id: "condom_use",
      text: "How often do you use condoms?",
      type: "single",
      options: [
        { label: "Always", value: "always", next: "prep_aware" },
        { label: "Sometimes", value: "sometimes", next: "prep_aware" },
        { label: "Never", value: "never", next: "prep_aware" }
      ]
    },
    {
      id: "prep_aware",
      text: "Have you heard of PrEP (Pre-Exposure Prophylaxis)?",
      type: "toggle",
      next: "contraception_type"
    },
    {
      id: "contraception_type",
      text: "What method of pregnancy prevention are you currently using?",
      type: "single",
      options: [
        { label: "None", value: "none", next: "emergency_aware" },
        { label: "Pills / Injection / Implant", value: "hormonal", next: "emergency_aware" },
        { label: "Condoms only", value: "condoms", next: "emergency_aware" },
        { label: "Other", value: "other", next: "emergency_aware" }
      ]
    },
    {
      id: "emergency_aware",
      text: "Do you know where to get emergency contraception (Morning after pill)?",
      type: "toggle",
      next: "end"
    }
  ]
};

export function calculateRisk(answers: Record<string, any>) {
  let hivScore = 0;
  let pregnancyScore = 0;

  // HIV Risk Calculation
  if (answers.partner_count === "2+") hivScore += 2;
  if (answers.condom_use === "never") hivScore += 3;
  if (answers.condom_use === "sometimes") hivScore += 1;

  // Pregnancy Risk Calculation
  if (answers.contraception_type === "none") pregnancyScore += 3;
  if (answers.contraception_type === "condoms" && answers.condom_use !== "always") pregnancyScore += 2;

  const getLevel = (score: number) => {
    if (score >= 3) return RiskLevel.HIGH;
    if (score >= 1) return RiskLevel.MODERATE;
    return RiskLevel.LOW;
  };

  const hivLevel = getLevel(hivScore);
  const pregnancyLevel = getLevel(pregnancyScore);

  const recommendations: Recommendation[] = [];

  if (hivLevel !== RiskLevel.LOW) {
    recommendations.push({
      text: "Consider PrEP — a daily pill to prevent HIV. It's free at many youth clinics in Zimbabwe.",
      icon: "Shield"
    });
    recommendations.push({
      text: "Regular HIV testing every 3-6 months is recommended for sexually active students.",
      icon: "Activity"
    });
  }

  if (pregnancyLevel !== RiskLevel.LOW) {
    recommendations.push({
      text: "Long-acting reversible contraception (LARC) like implants are highly effective and available at VCT centers.",
      icon: "Clock"
    });
  }

  if (answers.emergency_aware === false) {
    recommendations.push({
      text: "Emergency contraception is most effective within 72 hours. Locate your nearest pharmacy or clinic.",
      icon: "Zap"
    });
  }

  return { hivLevel, pregnancyLevel, recommendations };
}
