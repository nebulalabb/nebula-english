'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Headphones, BookOpen, MessageCircle, Play, Award, Clock, ChevronRight } from 'lucide-react';
import axios from '@/lib/axios';
import LessonDialog from '@/components/ui/LessonDialog';

const cats = [
   { id: 'ALL', label: '🎯 Tất cả', icon: Mic, color: 'from-rose-500 to-pink-600' },
   { id: 'PRONUNCIATION', label: '🔊 Phát âm', icon: Headphones, color: 'from-purple-500 to-violet-600' },
   { id: 'READ_ALOUD', label: '📖 Đọc lớn', icon: BookOpen, color: 'from-blue-500 to-indigo-600' },
   { id: 'QUESTION_ANSWER', label: '💬 Phản xạ', icon: MessageCircle, color: 'from-amber-500 to-orange-600' },
];

const SpeakingPage = () => {
   const [exercises, setExercises] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('ALL');
   const [dialogLesson, setDialogLesson] = useState<any>(null);

   useEffect(() => { fetchEx(); }, [activeTab]);
   const fetchEx = async () => {
      try { setLoading(true); const r = await axios.get('/speaking/exercises', { params: { type: activeTab === 'ALL' ? undefined : activeTab } }); setExercises(r.data); }
      catch (e) { console.error(e); } finally { setLoading(false); }
   };

   const openLesson = (ex: any) => {
      const cat = cats.find(c => c.id === ex.type) || cats[0];
      setDialogLesson({
         id: ex.id, title: ex.title, description: ex.description || 'Luyện phát âm và giao tiếp với AI chấm điểm tức thì.',
         level: ex.level, href: `/speaking/${ex.id}`,
         emoji: '🎙️', accentColor: cat.color, badge: ex.type?.replace(/_/g, ' '), badgeColor: '#F43F5E',
         stats: [
            { icon: <Award className="w-4 h-4" />, label: 'AI Chấm', value: 'Tức thì' },
            { icon: <Clock className="w-4 h-4" />, label: 'Luyện', value: '5–10s' },
            { icon: <Mic className="w-4 h-4" />, label: 'Level', value: ex.level || '?' },
         ],
      });
   };

   const c = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
   const item = { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

   return (
      <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden pb-24">
         <div className="pointer-events-none fixed inset-0 -z-0">
            <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/6 rounded-full blur-[120px]" />
         </div>

         <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-10 space-y-10">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/30">🎙️</div>
                  <div>
                     <p className="text-rose-400 font-black uppercase tracking-widest text-xs">AI chấm điểm phát âm</p>
                     <h1 className="text-3xl sm:text-4xl font-extrabold">Phòng Luyện <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">Nói</span></h1>
                  </div>
               </div>
               <p className="text-slate-400 italic">"Tự tin giao tiếp — làm chủ giọng đọc chuẩn bản xứ."</p>
            </motion.div>

            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
               className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
               {cats.map(cat => (
                  <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                     className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === cat.id ? `bg-gradient-to-r ${cat.color} text-white shadow-lg` : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                     <cat.icon className="w-4 h-4" /> {cat.label}
                  </button>
               ))}
            </motion.div>

            {/* Grid */}
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array(6).fill(0).map((_, k) => <div key={k} className="h-52 rounded-3xl bg-white/4 border border-white/6 animate-pulse" />)}
               </div>
            ) : exercises.length === 0 ? (
               <div className="py-32 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center"><Mic className="w-10 h-10 text-slate-600" /></div>
                  <p className="text-slate-400 font-bold">Chưa có bài luyện nào</p>
               </div>
            ) : (
               <motion.div variants={c} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {exercises.map(ex => {
                     const cat = cats.find(ct => ct.id === ex.type) || cats[0];
                     return (
                        <motion.div key={ex.id} variants={item}>
                           <button onClick={() => openLesson(ex)} className="group w-full text-left">
                              <div className="relative overflow-hidden rounded-3xl bg-white/4 border border-white/8 hover:border-rose-500/30 hover:-translate-y-1.5 transition-all duration-300 p-7 min-h-[200px] flex flex-col cursor-pointer hover:shadow-[0_20px_60px_-15px_rgba(244,63,94,0.25)]">
                                 {/* Watermark icon */}
                                 <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-8 transition-opacity">
                                    <Mic className="w-32 h-32" />
                                 </div>
                                 {/* Type pill + level */}
                                 <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r ${cat.color} text-white shadow-md`}>
                                       {ex.type?.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-xs font-black text-slate-600 uppercase">Lv.{ex.level}</span>
                                 </div>
                                 <h3 className="text-xl font-extrabold mb-2 flex-1 group-hover:text-rose-300 transition-colors leading-snug">{ex.title}</h3>
                                 <p className="text-slate-500 text-sm italic line-clamp-2 mb-4">{ex.description}</p>
                                 <div className="flex items-center justify-between">
                                    <div className="flex gap-3 text-xs font-bold text-slate-600">
                                       <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-rose-400" /> AI Chấm</span>
                                       <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 5–10s</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 group-hover:bg-rose-500 flex items-center justify-center transition-all shadow-md">
                                       <Play className="w-5 h-5 fill-rose-400 group-hover:fill-white text-rose-400 group-hover:text-white transition-colors" />
                                    </div>
                                 </div>
                              </div>
                           </button>
                        </motion.div>
                     );
                  })}
               </motion.div>
            )}
         </div>
         <LessonDialog isOpen={!!dialogLesson} onClose={() => setDialogLesson(null)} lesson={dialogLesson} />
      </div>
   );
};
export default SpeakingPage;
