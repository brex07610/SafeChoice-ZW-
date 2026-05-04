import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Shield, Activity, Clock, Zap, MapPin } from "lucide-react";
import { ASSESSMENT_SCHEMA, calculateRisk, RiskLevel } from "../engines/riskAssessment";
import { colors, typography, spacing } from "../constants";
import { Button, Card, Badge } from "../App";

export default function RiskModule() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);

  const questions = ASSESSMENT_SCHEMA.questions;
  const currentQuestion = questions[step];
  const progress = (step / (questions.length - 1)) * 100;

  const handleAnswer = (value: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentQuestion.id === "age_check" && value === "u18") {
      setResult({ warning: "This app is designed for university students (18-24). Please consult a guardian or visit a youth center for age-appropriate support." });
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setResult(calculateRisk(newAnswers));
    }
  };

  if (result) {
    if (result.warning) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={spacing.safe}>
          <Card className="text-center p-8 border-amber-200 bg-amber-50">
            <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-900 mb-2">Age Notice</h2>
            <p className="text-amber-800">{result.warning}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">Restart</Button>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={spacing.safe}>
        <div className="relative overflow-hidden bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm mb-8">
          <div className="relative z-10">
            <Badge type="Health Check">Health Check</Badge>
            <h2 className="text-3xl font-bold mt-4 leading-tight text-[#1F2937]">Know your status,<br/>take control.</h2>
            <p className="text-gray-500 mt-4 max-w-md text-sm">Private, local-only risk assessment designed for Zimbabwean university life.</p>
          </div>
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#1D9E75] opacity-5 rounded-full"></div>
          <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-[#534AB7] opacity-5 rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="flex flex-col items-center justify-center p-6 text-center border-none shadow-md">
            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">HIV Risk</span>
            <div className="w-4 h-4 rounded-full mb-3" style={{ backgroundColor: colors.risk[result.hivLevel.toLowerCase() as keyof typeof colors.risk] }} />
            <span className="text-xl font-black text-gray-800">{result.hivLevel}</span>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-6 text-center border-none shadow-md">
            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Pregnancy Risk</span>
            <div className="w-4 h-4 rounded-full mb-3" style={{ backgroundColor: colors.risk[result.pregnancyLevel.toLowerCase() as keyof typeof colors.risk] }} />
            <span className="text-xl font-black text-gray-800">{result.pregnancyLevel}</span>
          </Card>
        </div>

        <h3 className="font-bold text-gray-400 uppercase text-[10px] mb-4 tracking-[0.2em] px-2">Recommended Actions</h3>
        <div className="space-y-4 mb-8">
          {result.recommendations.map((rec: any, i: number) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }}
            >
              <Card className="flex gap-4 items-start border-none bg-white">
                <div className="p-3 bg-gray-50 rounded-2xl shrink-0">
                  {rec.icon === 'Shield' && <Shield className="w-5 h-5 text-[#1D9E75]" />}
                  {rec.icon === 'Activity' && <Activity className="w-5 h-5 text-[#1D9E75]" />}
                  {rec.icon === 'Clock' && <Clock className="w-5 h-5 text-[#1D9E75]" />}
                  {rec.icon === 'Zap' && <Zap className="w-5 h-5 text-[#1D9E75]" />}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-semibold pr-2">{rec.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button onClick={() => {}} variant="primary" className="h-16 shadow-xl">
          <MapPin className="w-5 h-5" /> Find Local Clinic
        </Button>
        <button onClick={() => window.location.reload()} className="w-full text-center py-8 text-gray-400 font-bold text-xs uppercase tracking-widest">Clear & Exit</button>
      </motion.div>
    );
  }

  return (
    <div className={spacing.safe}>
      {/* Progress */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-[#1D9E75] uppercase tracking-widest">Progress</span>
          <span className="text-[10px] font-bold text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
               {progress > (i * 33.3) && (
                 <motion.div 
                   className="h-full bg-[#1D9E75]" 
                   initial={{ width: 0 }} 
                   animate={{ width: `${Math.min(100, (progress - (i * 33.3)) * 3)}%` }}
                 />
               )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="min-h-[350px]"
        >
          <h2 className="text-3xl font-bold text-[#1F2937] mb-10 leading-tight">
            {currentQuestion.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion.type === "single" && currentQuestion.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className="w-full p-6 text-left rounded-[24px] bg-white border border-gray-100 shadow-sm hover:border-[#1D9E7533] hover:shadow-md transition-all flex justify-between items-center group font-bold text-gray-700"
              >
                {opt.label}
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1D9E75] transform group-hover:translate-x-1 transition-all" />
              </button>
            ))}

            {currentQuestion.type === "toggle" && (
              <div className="flex flex-col gap-4">
                <Button onClick={() => handleAnswer(true)} variant="primary">Yes</Button>
                <Button onClick={() => handleAnswer(false)} variant="outline">No</Button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {step > 0 && (
        <button 
          onClick={() => setStep(step - 1)} 
          className="mt-8 flex items-center gap-2 text-slate-400 font-bold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Go Back
        </button>
      )}
    </div>
  );
}
