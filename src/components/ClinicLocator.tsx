import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, ExternalLink, ShieldCheck, Search, Filter } from "lucide-react";
import { spacing, colors } from "../constants";
import { Card, Badge, Button } from "../App";

export default function ClinicModule() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/clinics")
      .then(res => res.json())
      .then(data => {
        setClinics(data);
        setLoading(data.length === 0);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredClinics = clinics.filter(c => {
    if (filter === "All") return true;
    if (filter === "Youth Friendly") return c.is_youth_friendly;
    return c.services.includes(filter);
  });

  return (
    <div className={spacing.safe}>
      <header className="mb-6 px-1">
        <h2 className="text-3xl font-bold text-[#1F2937] mb-2">Nearby Services</h2>
        <p className="text-gray-500 text-sm font-medium">Verified youth-friendly clinics in Harare & beyond.</p>
      </header>

      {/* Map Bento Card */}
      <div className="w-full h-56 bg-white rounded-[32px] mb-8 relative overflow-hidden border border-gray-100 shadow-sm">
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/31.05,-17.83,12,0/600x400?access_token=pk.ey')] bg-cover opacity-60 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Your Location</span>
            <p className="text-sm font-bold text-gray-800">Harare, Zimbabwe</p>
          </div>
          <button className="bg-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-sm border border-gray-100 uppercase tracking-tight">Expand Map</button>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 bg-[#1D9E75] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#1d9e7544] animate-bounce">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {["All", "Youth Friendly", "HIV_testing", "Family_Planning", "PrEP"].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all ${filter === f ? 'bg-[#1D9E75] text-white border-[#1D9E75] shadow-lg shadow-[#1d9e7522]' : 'bg-white text-gray-400 border-gray-100'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)
        ) : (
          filteredClinics.map((clinic, i) => (
            <motion.div 
              key={clinic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-md transition-all cursor-pointer border-none group px-6 py-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-[#1F2937] text-base group-hover:text-[#1D9E75] transition-colors">{clinic.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-1">{clinic.city}, Zimbabwe</p>
                  </div>
                  {clinic.is_youth_friendly && (
                    <div className="p-2 bg-[#E8F5F1] text-[#1D9E75] rounded-xl flex items-center gap-1 shadow-sm shadow-[#1d9e7511]">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase tracking-tighter">Safe Space</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {clinic.services.map((s: string) => (
                    <span key={s} className="text-[9px] font-bold px-3 py-1 bg-gray-50 text-gray-500 rounded-lg border border-gray-100">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 mb-6 text-[11px] font-bold text-gray-400">
                  <div className="flex items-center gap-1.5 opacity-70">
                    <Clock className="w-4 h-4 text-[#1D9E75]" />
                    <span>{clinic.hours?.mon || "Closed"}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a 
                    href={`tel:${clinic.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-gray-100 active:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <button className="flex-1 py-3 bg-[#1F2937] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:bg-black transition-all shadow-md">
                    <ExternalLink className="w-3.5 h-3.5" /> Directions
                  </button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
