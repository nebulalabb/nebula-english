'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Search, Clock, Sparkles, ChevronRight } from 'lucide-react';
import axios from '@/lib/axios';
import LessonDialog from '@/components/ui/LessonDialog';

const levelMeta: Record<string, { gradient: string; glow: string; bg: string; label: string }> = {
  A1: { gradient: 'from-emerald-400 to-teal-500', glow: 'rgba(52,211,153,0.25)', bg: 'bg-emerald-500/10', label: '🌱 Sơ cấp' },
  A2: { gradient: 'from-sky-400 to-blue-500', glow: 'rgba(56,189,248,0.25)', bg: 'bg-sky-500/10', label: '📘 Cơ bản' },
  B1: { gradient: 'from-violet-400 to-purple-600', glow: 'rgba(167,139,250,0.25)', bg: 'bg-violet-500/10', label: '⚡ Trung cấp' },
  B2: { gradient: 'from-fuchsia-400 to-pink-600', glow: 'rgba(232,121,249,0.25)', bg: 'bg-fuchsia-500/10', label: '🔥 Khá' },
  C1: { gradient: 'from-rose-400 to-orange-500', glow: 'rgba(251,113,133,0.25)', bg: 'bg-rose-500/10', label: '👑 Nâng cao' },
};

const GrammarPage = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [dialogLesson, setDialogLesson] = useState<any>(null);

  useEffect(() => { fetchTopics(); }, [selectedLevel]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/grammar/topics', { params: { level: selectedLevel || undefined } });
      setTopics(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = topics.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openLesson = (topic: any) => {
    const meta = levelMeta[topic.level] || levelMeta['B1'];
    setDialogLesson({
      id: topic.id,
      title: topic.title,
      description: topic.description || 'Nắm vững cấu trúc ngữ pháp quan trọng này và tự tin sử dụng trong mọi tình huống.',
      level: topic.level,
      href: `/grammar/${topic.id}`,
      emoji: '📖',
      accentColor: meta.gradient,
      badge: meta.label,
      badgeColor: '#818CF8',
      stats: [
        { icon: <Book className="w-4 h-4" />, label: 'Bài tập', value: topic._count?.exercises || 0 },
        { icon: <Clock className="w-4 h-4" />, label: 'Thời gian', value: '20 phút' },
        { icon: <Sparkles className="w-4 h-4" />, label: 'AI Quiz', value: 'Có' },
      ],
    });
  };

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };
  const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden pb-24">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-10 space-y-10">

        {/* ─── Hero Header ─── */}
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/30">📖</div>
            <div>
              <p className="text-violet-400 font-black uppercase tracking-widest text-xs">Khám phá ngữ pháp</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Ngữ Pháp <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Tiếng Anh</span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 italic max-w-lg">"Nắm vững cấu trúc — nói tự tin, viết chính xác."</p>
        </motion.div>

        {/* ─── Search + Filter ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
            <input
              placeholder="Tìm chủ điểm ngữ pháp..."
              className="w-full h-13 pl-12 pr-5 py-3.5 bg-white/5 border border-white/8 hover:border-violet-500/30 focus:border-violet-500/60 rounded-2xl text-white placeholder:text-slate-600 outline-none transition-all backdrop-blur-md shadow-inner text-sm"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {[null, ...levels].map(lvl => {
              const meta = lvl ? levelMeta[lvl] : null;
              const active = selectedLevel === lvl;
              return (
                <button key={lvl ?? 'all'} onClick={() => setSelectedLevel(lvl)}
                  className={`px-5 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-200 ${active
                    ? `bg-gradient-to-r ${meta?.gradient ?? 'from-violet-500 to-purple-600'} text-white shadow-lg`
                    : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                  {lvl ?? 'Tất cả'}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Grid ─── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-white/4 border border-white/6 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-32 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Book className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-400 font-bold">Không tìm thấy chủ điểm nào</p>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(topic => {
              const meta = levelMeta[topic.level] || levelMeta['B1'];
              return (
                <motion.div key={topic.id} variants={item}>
                  <button onClick={() => openLesson(topic)} className="group w-full text-left">
                    <div className="relative overflow-hidden rounded-3xl bg-white/4 border border-white/8
                      hover:border-white/20 transition-all duration-300 p-6
                      hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]
                      hover:-translate-y-1 will-change-transform cursor-pointer">
                      {/* Glow blob */}
                      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${meta.gradient}`}
                        style={{ opacity: 0.08 }} />

                      {/* Top row */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r ${meta.gradient} text-white shadow-md`}>
                          {topic.level}
                        </span>
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 20 phút
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-pink-300 transition-all duration-300 leading-snug">
                        {topic.title}
                      </h3>
                      <p className="text-slate-500 text-sm italic line-clamp-2 mb-4">{topic.description}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl ${meta.bg} flex items-center justify-center`}>
                            <Book className="w-4 h-4 text-slate-300" />
                          </div>
                          <span className="text-sm font-bold text-slate-400">{topic._count?.exercises || 0} bài tập</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 group-hover:border-violet-500/50 group-hover:bg-violet-500/10 flex items-center justify-center transition-all">
                          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
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

      {/* Lesson Preview Dialog */}
      <LessonDialog isOpen={!!dialogLesson} onClose={() => setDialogLesson(null)} lesson={dialogLesson} />
    </div>
  );
};

export default GrammarPage;
