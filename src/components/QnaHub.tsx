import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MessageSquare, Send, CheckCircle2, ChevronRight, LayoutGrid } from "lucide-react";
import { spacing } from "../constants";
import { Card, Badge, Button } from "../App";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "firebase/firestore";

export default function QnaHub() {
  const [filter, setFilter] = useState("all");
  const [questions, setQuestions] = useState<any[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ content: "", category: "General" });

  useEffect(() => {
    const q = filter === "all" 
      ? query(collection(db, "questions"), where("status", "==", "answered"), orderBy("createdAt", "desc"))
      : query(collection(db, "questions"), where("status", "==", "answered"), where("category", "==", filter), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "questions");
    });

    return () => unsubscribe();
  }, [filter]);

  const handleSubmit = async () => {
    if (!newQuestion.content) return;
    try {
      await addDoc(collection(db, "questions"), {
        content: newQuestion.content,
        category: newQuestion.category,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setNewQuestion({ content: "", category: "General" });
      setIsAsking(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "questions");
    }
  };

  return (
    <div className={spacing.safe}>
      <header className="mb-6 px-1">
        <h2 className="text-3xl font-bold text-[#1F2937] mb-2">Expert Q&A</h2>
        <p className="text-gray-500 text-sm font-medium">Anonymous support from Zimbabwean health experts.</p>
      </header>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {["all", "HIV", "Pregnancy", "General"].map(cat => (
          <button 
            key={cat} 
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${filter === cat ? 'bg-[#1D9E75] text-white border-[#1D9E75] shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <LayoutGrid className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold px-10 leading-relaxed">No answered questions here yet. Be the first to ask!</p>
          </div>
        ) : (
          questions.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <Badge>{q.category}</Badge>
                  <span className="text-[10px] font-bold text-gray-300">REF: {q.id.slice(0, 4).toUpperCase()}</span>
                </div>
                <h3 className="font-bold text-[#1F2937] text-base mb-4 leading-relaxed">{q.content}</h3>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-[#1D9E75]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verified Advice</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {q.answer || "This question is being reviewed by a health professional. Check back soon."}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <button 
        onClick={() => setIsAsking(true)}
        className="fixed bottom-28 right-8 w-16 h-16 bg-[#1D9E75] rounded-[24px] shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Ask Modal */}
      <AnimatePresence>
        {isAsking && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[100] bg-white pt-16 flex flex-col"
          >
            <div className="px-6 flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">Ask a Question</h2>
              <button onClick={() => setIsAsking(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 px-6 space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Topic</label>
                <div className="flex gap-2 flex-wrap">
                  {["General", "HIV", "Pregnancy"].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setNewQuestion({...newQuestion, category: cat})}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${newQuestion.category === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Your Question</label>
                <textarea 
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                  placeholder="Ask anything anonymously..."
                  className="w-full h-40 p-4 bg-slate-50 rounded-2xl border-none outline-none text-slate-800 font-medium placeholder:text-slate-300"
                />
                <p className="mt-2 text-[10px] text-slate-400 font-bold italic">💡 Remember: Do not include your real name or contact details.</p>
              </div>
            </div>

            <div className="p-6 pb-12">
              <Button onClick={handleSubmit} disabled={!newQuestion.content}>Submit Question</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Plus({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>; }
function X({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>; }
