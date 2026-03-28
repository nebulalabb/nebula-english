'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, CheckCircle2, Star, Zap, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const lesson = {
    topic: 'Tiếng Anh giao tiếp',
    title: 'Cách chào hỏi tự nhiên như người bản xứ',
    emoji: '👋',
    minutes: 5,
    phrases: [
        { phrase: "What's up?", meaning: 'Có gì mới không? (thân mật)', color: '#4ECDC4' },
        { phrase: "How's it going?", meaning: 'Dạo này thế nào?', color: '#FF6B35' },
        { phrase: "Good to see you!", meaning: 'Vui khi gặp bạn!', color: '#A78BFA' },
    ],
    quiz: {
        q: 'Câu nào tự nhiên nhất khi gặp bạn bè?',
        opts: ["How do you do?", "What's up?", "Are you well?", "How do you feel?"],
        ans: 1,
        explanation: '"What\'s up?" là cách chào thân mật, tự nhiên nhất!'
    }
};

const streakDays = [
    { day: 'T2', done: true }, { day: 'T3', done: true }, { day: 'T4', done: true },
    { day: 'T5', done: true }, { day: 'T6', done: false }, { day: 'T7', done: true }, { day: 'CN', done: true },
];

const topics = [
    { name: 'Tiếng Anh', emoji: '💬', progress: 65, color: '#4ECDC4' },
    { name: 'Toán vui', emoji: '🔢', progress: 30, color: '#FF6B35' },
    { name: 'Kỹ năng mềm', emoji: '🧠', progress: 10, color: '#A78BFA' },
];

type Phase = 'home' | 'reading' | 'quiz' | 'complete';

export default function MicrolearnPage() {
    const [phase, setPhase] = useState<Phase>('home');
    const [selected, setSelected] = useState<number | null>(null);
    const [done, setDone] = useState(false);

    const handlePick = (i: number) => {
        if (done) return;
        setSelected(i);
        setDone(true);
        setTimeout(() => setPhase('complete'), 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 text-white p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <Link href={phase === 'home' ? '/learn' : '#'} onClick={e => { if (phase !== 'home') { e.preventDefault(); setPhase('home'); } }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors inline-flex">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold">⚡ Học 5 Phút Mỗi Ngày</h1>
                        <p className="text-slate-400 text-sm">Kiến thức mini, tác động tối đa</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/30">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span className="font-black text-amber-400">7</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">

                    {phase === 'home' && (
                        <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {/* Streak */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-amber-400" /> Streak <strong className="text-amber-400">7 ngày</strong></span>
                                    <span className="text-sm text-slate-400">Tuần này</span>
                                </div>
                                <div className="flex gap-2 justify-between">
                                    {streakDays.map((d, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${d.done ? 'bg-amber-500/30 border-2 border-amber-500' : 'bg-white/5 border-2 border-white/10'}`}>
                                                {d.done ? '🔥' : '·'}
                                            </div>
                                            <span className="text-xs text-slate-400">{d.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Today's lesson */}
                            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/30 rounded-3xl p-6 mb-5">
                                <div className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-300 text-xs font-bold inline-block mb-3">📅 Bài hôm nay</div>
                                <div className="text-4xl mb-2">{lesson.emoji}</div>
                                <h2 className="text-xl font-extrabold mb-1">{lesson.title}</h2>
                                <p className="text-slate-400 text-sm mb-4">{lesson.topic} · {lesson.minutes} phút</p>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPhase('reading')}
                                    className="w-full py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
                                    Học ngay! <ChevronRight className="w-6 h-6" />
                                </motion.button>
                            </div>

                            {/* Topics progress */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                                <h3 className="font-bold mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-400" /> Chủ đề đang học</h3>
                                <div className="space-y-3">
                                    {topics.map((t, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-2xl">{t.emoji}</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-semibold">{t.name}</span>
                                                    <span className="text-slate-400">{t.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all" style={{ width: `${t.progress}%`, background: t.color }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'reading' && (
                        <motion.div key="reading" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-5">
                                <p className="text-base leading-relaxed mb-4">Bạn đã biết <strong>"How are you?"</strong> nhưng người bản xứ ít dùng câu này! Hãy thử những cách chào tự nhiên hơn 😊</p>
                                <div className="space-y-3">
                                    {lesson.phrases.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                                            <span className="font-mono font-black text-base" style={{ color: p.color }}>"{p.phrase}"</span>
                                            <span className="text-slate-400 text-sm">→ {p.meaning}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-sm">
                                    💡 Tip: "What's up?" → Trả lời: "Not much, you?" hoặc "Pretty good!"
                                </div>
                            </div>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPhase('quiz')}
                                className="w-full py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
                                <Star className="w-5 h-5" /> Làm mini quiz!
                            </motion.button>
                        </motion.div>
                    )}

                    {phase === 'quiz' && (
                        <motion.div key="quiz" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-5">
                                <div className="text-xs font-bold text-amber-400 mb-2">🎯 Mini Quiz</div>
                                <p className="text-xl font-bold">{lesson.quiz.q}</p>
                            </div>
                            <div className="space-y-3 mb-4">
                                {lesson.quiz.opts.map((opt, i) => {
                                    let cls = 'border-white/10 bg-white/5 text-white';
                                    if (done) {
                                        if (i === lesson.quiz.ans) cls = 'border-green-400 bg-green-500/20 text-green-300';
                                        else if (i === selected) cls = 'border-red-400 bg-red-500/20 text-red-300';
                                        else cls = 'border-white/5 bg-white/3 text-slate-500';
                                    }
                                    return (
                                        <motion.button key={i} whileTap={{ scale: done ? 1 : 0.97 }} onClick={() => handlePick(i)}
                                            className={`w-full p-4 rounded-2xl border-2 text-left font-semibold transition-all flex items-center gap-3 ${cls}`}>
                                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm flex-shrink-0">{['A', 'B', 'C', 'D'][i]}</span>
                                            {opt}
                                            {done && i === lesson.quiz.ans && <CheckCircle2 className="ml-auto text-green-400 w-5 h-5" />}
                                        </motion.button>
                                    );
                                })}
                            </div>
                            {done && <div className="bg-indigo-500/15 border border-indigo-500/30 rounded-2xl p-4 text-sm text-indigo-200">💡 {lesson.quiz.explanation}</div>}
                        </motion.div>
                    )}

                    {phase === 'complete' && (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-8xl mb-4">🎉</motion.div>
                            <h2 className="text-3xl font-extrabold mb-2 text-amber-400">Hoàn thành!</h2>
                            <p className="text-slate-400 mb-4">Hôm nay bạn đã học trong <strong className="text-white">{lesson.minutes} phút</strong></p>
                            <div className="flex items-center justify-center gap-2 text-2xl font-black text-amber-400 my-4">
                                <Flame className="w-8 h-8" /> 8 ngày liên tiếp!
                            </div>
                            <div className="grid grid-cols-2 gap-3 my-6">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <div className="text-2xl font-black text-amber-400">+50</div>
                                    <div className="text-xs text-slate-400">XP kiếm được</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <div className="text-2xl font-black text-green-400"><Zap className="inline w-6 h-6" /></div>
                                    <div className="text-xs text-slate-400">Streak duy trì</div>
                                </div>
                            </div>
                            <Link href="/learn" className="inline-flex items-center gap-2 py-4 px-8 rounded-2xl font-extrabold text-lg text-white"
                                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
                                Về trung tâm học tập
                            </Link>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
