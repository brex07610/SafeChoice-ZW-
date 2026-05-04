import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Activity, 
  MapPin, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { colors, spacing, typography } from "./constants";

// -- Components --

export const Button = ({ children, onClick, variant = "primary", className = "" }: any) => {
  const base = "w-full py-4 rounded-[16px] font-bold transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants: any = {
    primary: `bg-[#1D9E75] text-white shadow-lg shadow-[#1d9e7533]`,
    secondary: `bg-[#534AB7] text-white shadow-lg shadow-[#534ab722]`,
    outline: `border-2 border-slate-200 text-slate-700`,
    ghost: `text-slate-500 font-medium`
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, type = "general" }: any) => {
  const styles: any = {
    HIV: "bg-red-50 text-red-600 border-red-100",
    Pregnancy: "bg-purple-50 text-purple-600 border-purple-100",
    General: "bg-blue-50 text-blue-600 border-blue-100",
    Support: "bg-green-50 text-green-600 border-green-100",
    "Health Check": "bg-[#E8F5F1] text-[#1D9E75] border-[#1D9E7522]",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[children] || styles.General}`}>
      {children}
    </span>
  );
};

export const Card = ({ children, className = "" }: any) => (
  <div className={`${spacing.card} ${className}`}>
    {children}
  </div>
);

import QnaHub from "./components/QnaHub";
import RiskModule from "./components/RiskAssessment";
import ClinicModule from "./components/ClinicLocator";
import CommunityModule from "./components/CommunityForum";

// -- Main Navigation & State --

export default function App() {
  const [activeTab, setActiveTab] = useState("qna");
  const [onboarded, setOnboarded] = useState(false);

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#F0F4F2] max-w-md mx-auto relative overflow-hidden font-sans border-x border-gray-200">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 bg-white border-b border-gray-200 shrink-0 flex items-center justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1D9E75] rounded-xl flex items-center justify-center text-white">
            <div className="w-5 h-5 border-2 border-white rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1D9E75]">
            SafeChoice <span className="text-[#534AB7]">ZW</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
             <div className="w-1.5 h-1.5 bg-[#534AB7] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-[#534AB7] uppercase">Anon</span>
          </div>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`p-2 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "qna" && <QnaHub key="qna" />}
          {activeTab === "risk" && <RiskModule key="risk" />}
          {activeTab === "clinics" && <ClinicModule key="clinics" />}
          {activeTab === "community" && <CommunityModule key="community" />}
          {activeTab === "settings" && <SettingsModule key="settings" onBack={() => setActiveTab("qna")} />}
        </AnimatePresence>
      </main>

      {/* Bottom Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-gray-200 px-8 py-5 flex justify-between items-center z-[70] shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
        <TabItem icon={MessageCircle} label="Q&A" active={activeTab === "qna"} onClick={() => setActiveTab("qna")} />
        <TabItem icon={Activity} label="Risk" active={activeTab === "risk"} onClick={() => setActiveTab("risk")} />
        <TabItem icon={MapPin} label="Clinics" active={activeTab === "clinics"} onClick={() => setActiveTab("clinics")} />
        <TabItem icon={Users} label="Peer" active={activeTab === "community"} onClick={() => setActiveTab("community")} />
      </nav>
    </div>
  );
}


function TabItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group relative">
      <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-[#E8F5F1] text-[#1D9E75]' : 'text-gray-400 hover:bg-gray-50'}`}>
        <Icon className={`w-6 h-6 ${active ? 'fill-[#1D9E75]/10' : ''}`} />
      </div>
      <span className={`text-[10px] font-bold tracking-tight ${active ? 'text-[#1D9E75]' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
}

// -- Module Stubs (To be expanded) --

function Onboarding({ onComplete }: any) {
  const slides = [
    { title: "Safe & Anonymous", desc: "Access health info and support without ever revealing your identity.", icon: "🤫" },
    { title: "Know Your Risk", desc: "Confidentially assess your HIV and pregnancy risks based on your lifestyle.", icon: "📋" },
    { title: "Find Support", desc: "Locate youth-friendly clinics and connect with a monitored peer community.", icon: "🤝" }
  ];
  const [step, setStep] = useState(0);

  return (
    <div className="h-screen bg-white flex flex-col p-8 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div className="text-8xl mb-8 transform hover:scale-110 transition-transform cursor-default">{slides[step].icon}</div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">{slides[step].title}</h2>
        <p className="text-slate-500 leading-relaxed text-lg px-4">{slides[step].desc}</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-200'}`} />
          ))}
        </div>
        <Button onClick={() => step < 2 ? setStep(step + 1) : onComplete()}>
          {step < 2 ? "Next" : "Get Started"}
        </Button>
        <button onClick={onComplete} className="text-slate-400 font-bold py-2">Skip</button>
      </div>
    </div>
  );
}

function SettingsModule({ onBack }: any) { 
  const [lang, setLang] = useState("EN");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={spacing.safe}>
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-sm">
        <ChevronLeft className="w-4 h-4" /> Back to App
      </button>
      
      <h2 className={typography.h2 + " mb-8"}>Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Language (Chirungu/Shona)</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setLang("EN")}
              className={`py-3 rounded-xl font-bold transition-all ${lang === 'EN' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLang("SN")}
              className={`py-3 rounded-xl font-bold transition-all ${lang === 'SN' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
            >
              Shona
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">About SafeChoice ZW</label>
          <Card className="space-y-4">
            <div className="flex justify-between items-center group cursor-pointer">
              <span className="text-sm font-bold text-slate-700">Privacy Promise</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex justify-between items-center group cursor-pointer pt-4 border-t border-slate-50">
              <span className="text-sm font-bold text-slate-700">Community Guidelines</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex justify-between items-center group cursor-pointer pt-4 border-t border-slate-50">
              <span className="text-sm font-bold text-slate-700">Contact Support</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </Card>
        </div>

        <div className="pt-10 text-center">
          <p className="text-[10px] text-slate-300 font-bold uppercase">SafeChoice ZW v1.0.0</p>
          <p className="text-[9px] text-slate-300 font-medium px-10 mt-2 italic">A collaboration for Zimbabwean youth health.</p>
        </div>
      </div>
    </motion.div>
  ); 
}

