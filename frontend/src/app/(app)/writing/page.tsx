'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Search, Mail, FileText, BookOpen, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import axios from '@/lib/axios';
import LessonDialog from '@/components/ui/LessonDialog';

const typeCats = [
  { id: 'ALL', label: '✍️ Tất cả', color: 'from-violet-500 to-fuchsia-600' },
  { id: 'EMAIL', label: '📧 Email', color: 'from-blue-500 to-sky-600' },
  { id: 'ESSAY', label: '📃 Essay', color: 'from-emerald-500 to-teal-600' },
  { id: 'IELTS_TASK_1', label: '📊 Task 1', color: 'from-amber-500 to-orange-600' },
  { id: 'IELTS_TASK_2', label: '✒️ Task 2', color: 'from-rose-500 to-pink-600' },
];

const WritingPage = () => {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogLesson, setDialogLesson] = useState<any>(null);

  useEffect(() => { fetchPrompts(); }, [activeTab]);
  const fetchPrompts = async () => {
    try { setLoading(true); const r = await axios.get('/writing/prompts', { params: { type: activeTab === 'ALL' ? undefined : activeTab } }); setPrompts(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = prompts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openLesson = (p: any) => {
    const cat = typeCats.find(c => c.id === p.type) || typeCats[0];
    setDialogLesson({
      id: p.id, title: p.title, description: p.description || 'AI sẽ chấm và nhận xét bài viết của bạn ngay lập tức.',
      level: p.level, href: `/writing/${p.id}`,
      emoji: '✍️', accentColor: cat.color, badge: p.topic, badgeColor: '#A78BFA',
      stats: [
        { icon: <Clock className="w-4 h-4" />, label: 'Số từ', value: `~${p.targetWords || 250}` },
        { icon: <CheckCircle className="w-4 h-4" />, label: 'AI Review', value: 'Tức thì' },
        { icon: <PenTool className="w-4 h-4" />, label: 'Dạng bài', value: p.type?.replace(/_/g, ' ') || '?' },
      ],
    });
  };

  const c = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } } };

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden pb-24">
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -top-20 right-0 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-10 space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/30">✍️</div>
                <div>
                  <p className="text-violet-400 font-black uppercase tracking-widest text-xs">AI Review tức thì</p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold">Trung Tâm <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Viết</span></h1>
                </div>
              </div>
              <p className="text-slate-400 italic">"Chinh phục IELTS Writing — AI nhận xét sâu, chi tiết."</p>
            </div>
            <div className="relative group w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              <input placeholder="Tìm chủ đề..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/8 hover:border-violet-500/30 focus:border-violet-500/60 rounded-2xl text-white placeholder:text-slate-600 outline-none transition-all text-sm"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {typeCats.map(cat => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === cat.id ? `bg-gradient-to-r ${cat.color} text-white shadow-lg` : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'}`}>
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{Array(4).fill(0).map((_, k) => <div key={k} className="h-64 rounded-3xl bg-white/4 border border-white/6 animate-pulse" />)}</div>
        ) : (
          <motion.div variants={c} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map(prompt => {
              const cat = typeCats.find(ct => ct.id === prompt.type) || typeCats[0];
              return (
                <motion.div key={prompt.id} variants={item}>
                  <button onClick={() => openLesson(prompt)} className="group w-full text-left">
                    <div className="relative overflow-hidden rounded-3xl bg-white/4 border border-white/8 hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 p-7 flex flex-col gap-4 cursor-pointer hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.25)]">
                      {/* Top gradient bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className="flex items-start justify-between">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r ${cat.color} text-white shadow-md`}>
                          {prompt.type?.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                          <span>Lv.{prompt.level}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span>{prompt.topic}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold mb-1.5 group-hover:text-violet-300 transition-colors line-clamp-1">{prompt.title}</h3>
                        <p className="text-slate-500 text-sm italic line-clamp-2 leading-relaxed">{prompt.description}</p>
                      </div>
                      <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-4 text-xs text-slate-500 italic line-clamp-2">
                        "{prompt.requirements}"
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4 text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> ~{prompt.targetWords || 250} từ</span>
                          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> AI Feedback</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 group-hover:bg-violet-500/20 group-hover:border-violet-500/40 text-slate-400 group-hover:text-violet-300 font-bold text-sm transition-all">
                          Viết ngay <ChevronRight className="w-4 h-4" />
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
export default WritingPage;
