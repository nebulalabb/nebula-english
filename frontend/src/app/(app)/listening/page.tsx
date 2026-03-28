'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Search, Play, Clock, Hash, Mic2, Volume2 } from 'lucide-react';
import axios from '@/lib/axios';
import LessonDialog from '@/components/ui/LessonDialog';

const ListeningPage = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [dialogLesson, setDialogLesson] = useState<any>(null);

  useEffect(() => { fetchExercises(); }, [selectedLevel]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/listening/exercises', { params: { level: selectedLevel || undefined } });
      setExercises(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredExercises = exercises.filter(ex =>
    ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  const openLesson = (ex: any) => setDialogLesson({
    id: ex.id,
    title: ex.title,
    description: ex.description || 'Luyện kỹ năng nghe hiểu với bài tập được thiết kế chuyên sâu.',
    level: ex.level,
    href: `/listening/${ex.id}`,
    emoji: '🎧',
    accentColor: 'from-sky-500 to-blue-600',
    badge: ex.topic,
    badgeColor: '#38BDF8',
    stats: [
      { icon: <Clock className="w-4 h-4" />, label: 'Thời lượng', value: ex.durationSec ? `${Math.floor(ex.durationSec / 60)}:${String(ex.durationSec % 60).padStart(2, '0')}` : '--:--' },
      { icon: <Hash className="w-4 h-4" />, label: 'Câu hỏi', value: ex._count?.questions || 0 },
      { icon: <Volume2 className="w-4 h-4" />, label: 'Giọng đọc', value: 'Bản xứ' },
    ],
  });

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } } };

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden pb-24">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-32 right-0 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-10 space-y-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-sky-500/30">🎧</div>
            <div>
              <p className="text-sky-400 font-black uppercase tracking-widest text-xs">Luyện nghe mỗi ngày</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Kỹ Năng <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">Nghe Hiểu</span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 italic max-w-lg">"Nghe nhiều — hiểu nhanh — phản xạ tự nhiên."</p>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
            <input placeholder="Tìm bài nghe, chủ đề..."
              className="w-full h-13 pl-12 pr-5 py-3.5 bg-white/5 border border-white/8 hover:border-sky-500/30 focus:border-sky-500/60 rounded-2xl text-white placeholder:text-slate-600 outline-none transition-all backdrop-blur-md text-sm"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {[null, ...levels].map(lvl => (
              <button key={lvl ?? 'all'} onClick={() => setSelectedLevel(lvl)}
                className={`px-5 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${selectedLevel === lvl ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg' : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                {lvl ?? 'Tất cả'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-3xl bg-white/4 border border-white/6 animate-pulse overflow-hidden">
                <div className="aspect-video bg-white/6" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-white/8 rounded-lg w-3/4" />
                  <div className="h-4 bg-white/6 rounded-lg w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Headphones className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-400 font-bold">Không tìm thấy bài nghe nào</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExercises.map(ex => (
              <motion.div key={ex.id} variants={item}>
                <button onClick={() => openLesson(ex)} className="group w-full text-left">
                  <div className="relative overflow-hidden rounded-3xl bg-white/4 border border-white/8 hover:border-sky-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer
                    hover:shadow-[0_20px_60px_-15px_rgba(14,165,233,0.2)]">
                    {/* Thumbnail */}
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-sky-900/30 to-blue-900/30">
                      {ex.thumbnail ? (
                        <img src={ex.thumbnail} alt={ex.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Mic2 className="w-16 h-16 text-sky-800/50" />
                        </div>
                      )}
                      {/* Overlay play button */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.div whileHover={{ scale: 1.1 }} className="w-14 h-14 rounded-full bg-sky-500 shadow-xl shadow-sky-500/40 flex items-center justify-center">
                          <Play className="w-6 h-6 fill-white text-white" />
                        </motion.div>
                      </div>
                      {/* Top badges */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-black border border-white/10">{ex.level}</span>
                      </div>
                      {ex.durationSec && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-black text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                          <Clock className="w-3 h-3" /> {Math.floor(ex.durationSec / 60)}:{String(ex.durationSec % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>
                    {/* Body */}
                    <div className="p-5">
                      <h3 className="font-extrabold text-lg leading-snug line-clamp-1 group-hover:text-sky-300 transition-colors mb-1">{ex.title}</h3>
                      <p className="text-slate-500 text-sm italic line-clamp-2 mb-3">{ex.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-sky-500/70">{ex.topic}</span>
                        <span className="text-xs font-bold text-slate-600">{ex._count?.questions || 0} câu hỏi</span>
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

export default ListeningPage;
