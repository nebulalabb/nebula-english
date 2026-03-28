'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookOpen, Repeat, LayoutGrid, Clock, Volume2, Star, Zap, Target, ChevronRight, Sparkles } from 'lucide-react';
import axios from '@/lib/axios';
import ReviewSession from '@/components/vocabulary/ReviewSession';
import WordDetailModal from '@/components/vocabulary/WordDetailModal';
import QuickFlipCard from '@/components/vocabulary/QuickFlipCard';

const VocabularyPage = () => {
  const [topics, setTopics] = useState<string[]>([]);
  const [words, setWords] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [showQuickReview, setShowQuickReview] = useState(false);
  const [sets, setSets] = useState<any[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewWords, setReviewWords] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'topics' | 'sets' | 'review'>('topics');

  useEffect(() => { fetchInitialData(); }, []);
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [tr, sr, rr] = await Promise.all([axios.get('/vocabulary/topics'), axios.get('/vocabulary/sets'), axios.get('/vocabulary/review')]);
      setTopics(tr.data); setSets(sr.data); setReviewCount(rr.data.length); setReviewWords(rr.data);
      const wr = await axios.get('/vocabulary/words');
      setWords(wr.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const r = await axios.get('/vocabulary/words', { params: { topic: selectedTopic || undefined, search: searchTerm || undefined } });
        setWords(r.data);
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(t);
  }, [selectedTopic, searchTerm]);

  if (showReview) {
    return <ReviewSession words={reviewWords} onComplete={() => { setShowReview(false); fetchInitialData(); }} onClose={() => setShowReview(false)} />;
  }

  const tabs = [
    { id: 'topics' as const, label: 'Chủ đề', icon: LayoutGrid },
    { id: 'sets' as const, label: 'Flashcards', icon: BookOpen },
    { id: 'review' as const, label: 'Ôn tập', icon: Repeat },
  ];

  const wc = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const wi = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden pb-24">
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -top-20 right-0 w-[600px] h-[600px] bg-cyan-600/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-10 space-y-8">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30">🧠</div>
                <div>
                  <p className="text-cyan-400 font-black uppercase tracking-widest text-xs">Spaced Repetition AI</p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold">Học <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Từ Vựng</span></h1>
                </div>
              </div>
              <p className="text-slate-400 italic">"Học thông minh — nhớ lâu — dùng chuẩn."</p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 font-extrabold text-white shadow-xl shadow-cyan-500/25 whitespace-nowrap">
              <Plus className="w-5 h-5" /> Tạo Flashcard
            </motion.button>
          </div>
        </motion.div>

        {/* Tab bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="flex bg-white/4 border border-white/8 rounded-2xl p-1 w-full max-w-sm h-14">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all relative ${activeTab === tab.id ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
              {tab.id === 'review' && reviewCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-[#0D0D1A] animate-pulse">
                  {reviewCount}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ─── Topics Tab ─── */}
          {activeTab === 'topics' && (
            <motion.div key="topics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input placeholder="Tìm từ vựng..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/8 hover:border-cyan-500/30 focus:border-cyan-500/60 rounded-2xl text-white placeholder:text-slate-600 outline-none transition-all text-sm"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {[null, ...topics].map(topic => (
                    <button key={topic ?? 'all'} onClick={() => setSelectedTopic(topic ?? null)}
                      className={`px-4 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap capitalize transition-all ${selectedTopic === (topic ?? null) ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md' : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white'}`}>
                      {topic ?? 'Tất cả'}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array(10).fill(0).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-white/4 border border-white/6 animate-pulse" />)}
                </div>
              ) : words.length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center"><Search className="w-10 h-10 text-slate-700" /></div>
                  <p className="text-slate-500 italic">Không tìm thấy từ nào...</p>
                </div>
              ) : (
                <motion.div variants={wc} initial="hidden" animate="show"
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {words.map(word => (
                    <motion.div key={word.id} variants={wi} whileHover={{ y: -4 }}
                      onClick={() => { setSelectedWord(word); setIsWordModalOpen(true); }}
                      className="group bg-white/4 border border-white/8 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_-6px_rgba(6,182,212,0.25)] rounded-2xl p-4 cursor-pointer transition-all backdrop-blur-md">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-400 text-[10px] font-black uppercase tracking-wider">{word.level}</span>
                        <Volume2 className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <h4 className="text-lg font-extrabold mt-1 group-hover:text-cyan-300 transition-colors">{word.word}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{word.definition}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── Flashcard Sets Tab ─── */}
          {activeTab === 'sets' && (
            <motion.div key="sets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sets.map((set, i) => (
                  <motion.div key={set.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }} whileHover={{ y: -4 }}
                    className="group bg-white/4 border border-white/8 hover:border-cyan-500/40 rounded-3xl p-7 hover:shadow-[0_16px_40px_-12px_rgba(6,182,212,0.2)] transition-all flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                      </div>
                      <Star className="w-5 h-5 text-slate-700 group-hover:text-yellow-400 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-extrabold group-hover:text-cyan-300 transition-colors mb-1">{set.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2">{set.description || 'Bộ từ vựng được tuyển chọn'}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {set._count?.setWords || 0} từ</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Mới cập nhật</span>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold shadow-md hover:opacity-90 transition-opacity">Học ngay</button>
                      <button className="w-12 rounded-2xl bg-white/5 border border-white/8 text-slate-400 hover:text-white font-bold transition-all text-sm">✏️</button>
                    </div>
                  </motion.div>
                ))}
                {/* Create new */}
                <motion.button whileHover={{ y: -4 }}
                  className="flex flex-col items-center justify-center p-12 bg-white/3 border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-3xl group transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 flex items-center justify-center mb-4 transition-all">
                    <Plus className="w-8 h-8 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <p className="font-extrabold text-lg group-hover:text-cyan-300 transition-colors">Tạo bộ mới</p>
                  <p className="text-sm text-slate-600 mt-1">Nhóm từ để dễ nhớ hơn</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Review Tab ─── */}
          {activeTab === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center py-16 text-center">
              {showQuickReview ? (
                <div className="w-full max-w-lg mx-auto bg-slate-900/50 p-6 rounded-3xl border border-white/10 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 justify-center"><Sparkles className="text-cyan-400 w-5 h-5" /> Luyện tập siêu tốc</h3>
                  <QuickFlipCard
                    words={reviewWords.slice(0, 10).map(w => ({ word: w.word, phonetic: w.level, definition: w.definition, example: w.word }))}
                    onComplete={() => setShowQuickReview(false)}
                  />
                  <button onClick={() => setShowQuickReview(false)} className="mt-6 text-sm text-slate-500 hover:text-white underline">Thoát ôn tập</button>
                </div>
              ) : (
                <div className="relative max-w-md w-full">
                  {/* Glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
                  {/* Big icon */}
                  <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="w-36 h-36 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border-2 border-cyan-500/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(6,182,212,0.2)]">
                    <Repeat className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                  </motion.div>
                  <p className="text-cyan-400 font-black uppercase tracking-widest text-sm mb-2">Spaced Repetition</p>
                  <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-3">
                    Ôn <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">{reviewCount}</span> từ
                  </h2>
                  <p className="text-slate-400 italic text-lg leading-relaxed mb-10">"Lặp lại đúng lúc — kiến thức in sâu vào trí nhớ dài hạn mãi mãi."</p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                    <motion.button onClick={() => setShowReview(true)} disabled={reviewCount === 0} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-extrabold text-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-2xl shadow-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed">
                      <Repeat className="w-6 h-6" /> Bắt đầu ngay
                    </motion.button>
                    <motion.button onClick={() => setShowQuickReview(true)} whileHover={{ scale: 1.02 }} disabled={reviewWords.length === 0}
                      className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold text-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30">
                      Ôn lật thẻ <Target className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: <Zap className="w-5 h-5 text-yellow-400" />, label: 'Ngày liên tiếp', val: '5', color: 'text-yellow-400' },
                      { icon: <Star className="w-5 h-5 text-cyan-400" />, label: 'Từ đã thuộc', val: '120', color: 'text-cyan-400' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/4 border border-white/8 rounded-2xl p-5">
                        <div className="flex justify-center mb-2">{s.icon}</div>
                        <div className={`text-3xl font-extrabold ${s.color} mb-1`}>{s.val}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WordDetailModal word={selectedWord} isOpen={isWordModalOpen} onClose={() => setIsWordModalOpen(false)} onAddToSet={(id: string) => console.log('add:', id)} />
    </div>
  );
};
export default VocabularyPage;
