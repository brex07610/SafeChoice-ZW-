import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Flag, Send, Plus, Search, ChevronRight, X } from "lucide-react";
import { spacing, colors } from "../constants";
import { Card, Badge, Button } from "../App";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, updateDoc, doc, increment } from "firebase/firestore";

export default function CommunityModule() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", category: "General" });
  
  const [reportedPosts, setReportedPosts] = useState<Set<string>>(new Set());
  
  // Persistent anonymous name per session
  const [myUsername] = useState(() => `SafeUser_${Math.floor(Math.random() * 9000 + 1000)}`);

  useEffect(() => {
    const q = activeTab === "All" 
      ? query(collection(db, "forum_posts"), where("status", "==", "approved"), orderBy("createdAt", "desc"))
      : query(collection(db, "forum_posts"), where("status", "==", "approved"), where("category", "==", activeTab), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "forum_posts");
    });

    return () => unsubscribe();
  }, [activeTab]);

  const upvote = async (id: string) => {
    try {
      const postRef = doc(db, "forum_posts", id);
      await updateDoc(postRef, {
        upvotes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `forum_posts/${id}`);
    }
  };

  const reportPost = async (id: string) => {
    if (reportedPosts.has(id)) return;
    try {
      const postRef = doc(db, "forum_posts", id);
      await updateDoc(postRef, {
        reportCount: increment(1)
      });
      setReportedPosts(prev => new Set(prev).add(id));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `forum_posts/${id}`);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content) return;
    try {
      await addDoc(collection(db, "forum_posts"), {
        content: newPost.content,
        category: newPost.category,
        anonymousUsername: myUsername,
        upvotes: 0,
        status: "approved", // Auto-approved for demo
        createdAt: serverTimestamp()
      });
      setNewPost({ content: "", category: "General" });
      setIsPosting(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "forum_posts");
    }
  };

  if (selectedPost) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={spacing.safe}>
        <button onClick={() => setSelectedPost(null)} className="mb-6 font-bold text-slate-400 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Forum
        </button>
        
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-emerald-600 uppercase">@{selectedPost.user}</span>
            <Badge>{selectedPost.category}</Badge>
          </div>
          <p className="text-slate-800 font-medium leading-relaxed mb-6">{selectedPost.content}</p>
          <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
            <button className="flex items-center gap-1.5 text-slate-400 font-bold text-xs"><Heart className="w-4 h-4" /> {selectedPost.upvotes}</button>
            <button className="flex items-center gap-1.5 text-slate-400 font-bold text-xs"><MessageSquare className="w-4 h-4" /> {selectedPost.comments}</button>
            <button className="flex items-center gap-1.5 text-slate-400 font-bold text-xs ml-auto"><Flag className="w-4 h-4" /></button>
          </div>
        </Card>

        <h3 className="font-bold text-slate-800 mb-4 px-2">Comments</h3>
        <div className="space-y-4 mb-20">
          <div className="p-4 bg-white rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 mb-1">@WiseUser_10</p>
            <p className="text-sm text-slate-700">Yes, it's open from 9:00 to 13:00 on Saturdays. Check the clinic locator tab for the exact address!</p>
          </div>
        </div>

        <div className="fixed bottom-24 left-0 right-0 px-4 max-w-md mx-auto z-40">
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-2">
            <input placeholder="Add a comment..." className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
            <button className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={spacing.safe}>
      <header className="mb-6 px-1">
        <h2 className="text-3xl font-bold text-[#1F2937] mb-2">Peer Talk</h2>
        <p className="text-gray-500 text-sm font-medium">Connect anonymously with students like you.</p>
      </header>

      {/* Trending Bento Card */}
      <Card className="bg-[#534AB7] text-white border-none shadow-xl mb-8 overflow-hidden relative p-8 h-64 flex flex-col justify-between group">
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
               <span className="bg-[#ffffff22] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">Trending Now</span>
               <span className="text-[10px] opacity-70 font-bold">124 Online</span>
            </div>
            <h3 className="text-xl font-bold leading-tight line-clamp-2 pr-4 italic font-serif">"Is it weird to go to the campus clinic for PrEP? My partner is asking questions..."</h3>
         </div>
         <div className="relative z-10 flex items-center gap-3">
            <div className="flex -space-x-2">
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-6 h-6 rounded-full border-2 border-[#534AB7] bg-slate-200 text-[8px] flex items-center justify-center font-bold text-slate-500">U{i}</div>
               ))}
            </div>
            <span className="text-[10px] font-bold opacity-80">Join conversation →</span>
         </div>
         <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
      </Card>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {["All", "Support", "HIV", "Pregnancy"].map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveTab(cat)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${activeTab === cat ? 'bg-[#534AB7] text-white border-[#534AB7] shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <Search className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold px-10 leading-relaxed">No posts yet. Start the conversation!</p>
          </div>
        ) : (
          posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="active:scale-[0.98] transition-all cursor-pointer border-none shadow-sm hover:shadow-md">
                <div onClick={() => setSelectedPost(post)}>
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[14px] bg-gray-50 flex items-center justify-center font-bold text-[#534AB7] text-[11px] border border-gray-100 shadow-inner">
                        {post.anonymousUsername.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-bold text-[#1F2937] leading-none">@{post.anonymousUsername}</p>
                          {post.reportCount > 0 && (
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" title="Under Review" />
                          )}
                        </div>
                        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mt-1">
                          {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "Just now"}
                        </p>
                      </div>
                    </div>
                    <Badge>{post.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-4 mb-5 pr-2">{post.content}</p>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                  <button 
                    onClick={(e) => { e.stopPropagation(); upvote(post.id); }}
                    className="flex items-center gap-2 text-gray-400 font-bold text-xs hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" /> {post.upvotes}
                  </button>
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-xs"><MessageSquare className="w-4 h-4" /> {post.comments || 0}</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); reportPost(post.id); }}
                    className={`flex items-center gap-2 font-bold text-xs ml-auto transition-colors ${reportedPosts.has(post.id) ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <button 
        onClick={() => setIsPosting(true)}
        className="fixed bottom-28 right-8 w-16 h-16 bg-[#534AB7] rounded-[24px] shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform z-40 shadow-[#534ab733]"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Post Modal */}
      <AnimatePresence>
        {isPosting && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[100] bg-white pt-16 flex flex-col"
          >
            <div className="px-6 flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">Start Discussion</h2>
              <button onClick={() => setIsPosting(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 px-6 space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {["General", "Support", "HIV", "Pregnancy"].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setNewPost({...newPost, category: cat})}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${newPost.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Your Post</label>
                <textarea 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="Share something with the community..."
                  className="w-full h-40 p-4 bg-slate-50 rounded-2xl border-none outline-none text-slate-800 font-medium placeholder:text-slate-300"
                />
                <Card className="mt-4 bg-slate-50 border-none">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic">
                    💡 Peer Community Guidelines: Be respectful. No insults. No sharing of PII. Posts are moderated for safety.
                  </p>
                </Card>
              </div>
            </div>

            <div className="p-6 pb-12">
              <Button onClick={handleCreatePost} disabled={!newPost.content} className="bg-indigo-600 shadow-indigo-100">Post Anonymously</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
