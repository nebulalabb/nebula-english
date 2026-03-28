'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Hash, ChevronRight } from 'lucide-react';
import axios from '@/lib/axios';
import LessonDialog from '@/components/ui/LessonDialog';

const topicEmojis: Record<string, string> = {
  History: '🏛️', Science: '🔬', Culture: '🎭', Business: '💼', default: '📄',
};
const categories = [
  { id: 'ALL', label: 'Tất cả' }, { id: 'History', label: '🏛️ Lịch sử' },
  { id: 'Science', label: '🔬 Khoa học' }, { id: 'Culture', label: '🎭 Văn hóa' },
  { id: 'Business', label: '💼 Kinh doanh' },
];

const ReadingPage = () => {
  const [passages, setPassages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogLesson, setDialogLesson] = useState<any>(null);

  useEffect(() => { fetchPassages(); }, [activeTab]);
  const fetchPassages = async () => {
    try { setLoading(true); const r = await axios.get('/reading/passages', { params: { topic: activeTab === 'ALL' ? undefined : activeTab } }); setPassages(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = passages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openLesson = (p: any) => setDialogLesson({
    id: p.id, title: p.title,
    description: 'Đọc hiểu văn bản và trả lời câu hỏi để cải thiện kỹ năng đọc của bạn.',
    level: p.level, href: `/reading/${p.id}`,
    emoji: topicEmojis[p.topic] || topicEmojis.default,
    accentColor: 'from-amber-500 to-rose-500',
    badge: p.topic, badgeColor: '#F59E0B',
    stats: [
      { icon: <Clock className="w-4 h-4" />, label: 'Đọc', value: `${p.durationMins || '?'} phút` },
      { icon: <Hash className="w-4 h-4" />, label: 'Câu hỏi', value: p._count?.questions || 0 },
      { icon: <BookOpen className="w-4 h-4" />, label: 'Chủ đề', value: p.topic || 'Tổng hợp' },
    ],
  });

  const c = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const i = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } } };

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden pb-24">
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -top-20 right-0 w-[600px] h-[600px] bg-amber-600/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-10 space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">📚</div>
                <div>
                  <p className="text-amber-400 font-black uppercase tracking-widest text-xs">Thư viện đọc</p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold">Đọc Hiểu <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Sâu Sắc</span></h1>
                </div>
              </div>
              <p className="text-slate-400 italic">"Đọc nhiều — tư duy rộng — vốn từ phong phú."</p>
            </div>
            <div className="relative group w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
              <input placeholder="Tìm bài đọc..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/8 hover:border-amber-500/30 focus:border-amber-500/60 rounded-2xl text-white placeholder:text-slate-600 outline-none transition-all text-sm"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </motion.div>

        {/* Category Row */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === cat.id ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'}`}>
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, k) => (
              <div key={k} className="rounded-3xl bg-white/4 border border-white/6 animate-pulse overflow-hidden">
                <div className="h-44 bg-white/6" /><div className="p-5 space-y-3"><div className="h-5 bg-white/8 rounded-xl w-3/4" /><div className="h-4 bg-white/5 rounded-xl w-full" /></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div variants={c} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(passage => (
              <motion.div key={passage.id} variants={i}>
                <button onClick={() => openLesson(passage)} className="group w-full text-left">
                  <div className="relative overflow-hidden rounded-3xl bg-white/4 border border-white/8 hover:border-amber-500/30 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.2)] flex flex-col h-full">
                    {/* Image */}
                    <div className="h-44 relative overflow-hidden bg-gradient-to-br from-amber-900/20 to-rose-900/20 flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1A]/90 via-[#0D0D1A]/20 to-transparent z-10" />
                      {passage.imageUrl ? (
                        <img src={passage.imageUrl} alt={passage.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl opacity-20">{topicEmojis[passage.topic] || topicEmojis.default}</span>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-4 z-20 flex gap-2 items-center">
                        <span className="px-2.5 py-1 text-xs font-black uppercase bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-xl tracking-wider">{passage.topic}</span>
                        <span className="text-xs font-bold text-white/50 flex items-center gap-1"><Clock className="w-3 h-3" /> {passage.durationMins} phút</span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Level {passage.level}</div>
                      <h3 className="font-extrabold text-xl leading-snug line-clamp-2 mb-3 group-hover:text-amber-300 transition-colors">{passage.title}</h3>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Hash className="w-3.5 h-3.5" /> {passage._count?.questions || 0} câu hỏi</span>
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/8 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 flex items-center justify-center transition-all">
                          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      <LessonDialog isOpen={!!dialogLesson} onClose={() => setDialogLesson(null)} lesson={dialogLesson} />
    </div>
  );
};
export default ReadingPage;
