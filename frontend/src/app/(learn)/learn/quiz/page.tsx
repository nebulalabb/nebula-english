'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, Zap } from 'lucide-react';
import Link from 'next/link';

const subjects = [
    { id: 'english', label: 'Tiếng Anh', emoji: '🇬🇧', color: '#4ECDC4' },
    { id: 'math', label: 'Toán học', emoji: '🔢', color: '#FF6B35' },
    { id: 'science', label: 'Khoa học', emoji: '🔬', color: '#A78BFA' },
    { id: 'history', label: 'Lịch sử', emoji: '📜', color: '#FFD93D' },
    { id: 'vietnamese', label: 'Tiếng Việt', emoji: '📖', color: '#6BCB77' },
];

const difficulties = [
    { id: 'easy', label: 'Dễ 😊', color: '#6BCB77', bg: 'rgba(107,203,119,.15)' },
    { id: 'medium', label: 'Trung bình 🤔', color: '#FFD93D', bg: 'rgba(255,217,61,.15)' },
    { id: 'hard', label: 'Khó 🔥', color: '#FF6B35', bg: 'rgba(255,107,53,.15)' },
];

const questionCounts = [5, 10, 15, 20];

const mockQuestions: Record<string, { q: string; opts: string[]; ans: number }[]> = {
    english: [
        { q: 'What is the plural of "child"?', opts: ['childs', 'children', 'childen', 'childrens'], ans: 1 },
        { q: 'Choose the correct form: "She ___ to school every day."', opts: ['go', 'goes', 'going', 'gone'], ans: 1 },
        { q: 'What does "ubiquitous" mean?', opts: ['Rare', 'Everywhere', 'Beautiful', 'Dangerous'], ans: 1 },
        { q: 'Which sentence is correct?', opts: ['I am go home', 'I goes home', 'I am going home', 'I be going home'], ans: 2 },
        { q: 'The opposite of "ancient" is:', opts: ['Old', 'Historic', 'Modern', 'Classic'], ans: 2 },
    ],
    math: [
        { q: 'What is 15 × 8?', opts: ['110', '120', '115', '130'], ans: 1 },
        { q: 'Solve: 2x + 6 = 14. What is x?', opts: ['3', '4', '5', '6'], ans: 1 },
        { q: 'What is √144?', opts: ['11', '12', '13', '14'], ans: 1 },
        { q: '35% of 200 = ?', opts: ['60', '65', '70', '75'], ans: 2 },
        { q: 'What is the area of a rectangle 8m × 5m?', opts: ['30m²', '35m²', '40m²', '45m²'], ans: 2 },
    ],
};

type Phase = 'setup' | 'playing' | 'result';

export default function QuizPage() {
    const [phase, setPhase] = useState<Phase>('setup');
    const [subject, setSubject] = useState('english');
    const [difficulty, setDifficulty] = useState('easy');
    const [count, setCount] = useState(5);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answers, setAnswers] = useState<boolean[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);

    const questions = (mockQuestions[subject] || mockQuestions.english).slice(0, count);
    const score = answers.filter(Boolean).length;

    const handleStart = () => {
        setPhase('playing');
        setCurrent(0);
        setAnswers([]);
        setSelected(null);
        setShowAnswer(false);
    };

    const handleSelect = (idx: number) => {
        if (showAnswer) return;
        setSelected(idx);
        setShowAnswer(true);
        const isCorrect = idx === questions[current].ans;
        setAnswers(prev => [...prev, isCorrect]);
    };

    const handleNext = () => {
        if (current + 1 >= questions.length) {
            setPhase('result');
        } else {
            setCurrent(c => c + 1);
            setSelected(null);
            setShowAnswer(false);
        }
    };

    const handleReset = () => {
        setPhase('setup');
        setAnswers([]);
        setSelected(null);
        setShowAnswer(false);
        setCurrent(0);
    };

    const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const getRating = () => {
        if (scorePercent >= 90) return { emoji: '🏆', msg: 'Xuất sắc! Bạn là thiên tài!', color: '#FFD93D' };
        if (scorePercent >= 70) return { emoji: '🌟', msg: 'Giỏi lắm! Tiếp tục phát huy!', color: '#6BCB77' };
        if (scorePercent >= 50) return { emoji: '💪', msg: 'Ổn đấy! Luyện thêm nhé!', color: '#4ECDC4' };
        return { emoji: '📚', msg: 'Cố lên! Học thêm là được!', color: '#A78BFA' };
    };
    const rating = getRating();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-8 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/learn" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold flex items-center gap-2">
                            <span>🎯</span> Quiz Generator
                        </h1>
                        <p className="text-slate-400 text-sm">AI tạo câu hỏi tức thì cho bạn</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">

                    {/* === SETUP PHASE === */}
                    {phase === 'setup' && (
                        <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {/* Subject */}
                            <div className="mb-6">
                                <h2 className="text-lg font-bold mb-3 text-slate-300">📚 Chọn môn học</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {subjects.map(s => (
                                        <motion.button key={s.id} whileTap={{ scale: 0.95 }}
                                            onClick={() => setSubject(s.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm flex items-center gap-2 ${subject === s.id ? 'border-white/60 bg-white/10 scale-[1.02]' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
                                            style={{ borderColor: subject === s.id ? s.color : undefined }}>
                                            <span className="text-2xl">{s.emoji}</span>
                                            <span>{s.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="mb-6">
                                <h2 className="text-lg font-bold mb-3 text-slate-300">⚡ Độ khó</h2>
                                <div className="flex gap-3">
                                    {difficulties.map(d => (
                                        <motion.button key={d.id} whileTap={{ scale: 0.95 }}
                                            onClick={() => setDifficulty(d.id)}
                                            className="flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all"
                                            style={{
                                                background: difficulty === d.id ? d.bg : 'rgba(255,255,255,0.03)',
                                                borderColor: difficulty === d.id ? d.color : 'rgba(255,255,255,0.1)',
                                                color: difficulty === d.id ? d.color : '#9CA3AF'
                                            }}>
                                            {d.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Number of questions */}
                            <div className="mb-8">
                                <h2 className="text-lg font-bold mb-3 text-slate-300">🔢 Số câu hỏi</h2>
                                <div className="flex gap-3">
                                    {questionCounts.map(n => (
                                        <motion.button key={n} whileTap={{ scale: 0.95 }}
                                            onClick={() => setCount(n)}
                                            className={`flex-1 py-3 rounded-2xl border-2 font-extrabold text-lg transition-all ${count === n ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                                            {n}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <motion.button onClick={handleStart} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                className="w-full py-4 rounded-2xl font-extrabold text-xl flex items-center justify-center gap-2 shadow-2xl"
                                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                                <Sparkles className="w-6 h-6" />
                                Bắt đầu Quiz!
                                <ArrowRight className="w-6 h-6" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* === PLAYING PHASE === */}
                    {phase === 'playing' && questions[current] && (
                        <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span>Câu {current + 1} / {questions.length}</span>
                                    <span className="text-indigo-400 font-bold">{answers.filter(Boolean).length} ✅ đúng</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #6366F1, #A78BFA)' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((current) / questions.length) * 100}%` }}
                                        transition={{ duration: 0.4 }} />
                                </div>
                            </div>

                            {/* Question */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
                                <p className="text-xl font-bold leading-relaxed">{questions[current].q}</p>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 gap-3 mb-6">
                                {questions[current].opts.map((opt, i) => {
                                    let style = 'bg-white/5 border-white/10 text-white';
                                    if (showAnswer) {
                                        if (i === questions[current].ans) style = 'bg-green-500/20 border-green-400 text-green-300';
                                        else if (i === selected && i !== questions[current].ans) style = 'bg-red-500/20 border-red-400 text-red-300';
                                        else style = 'bg-white/3 border-white/5 text-slate-500';
                                    }
                                    return (
                                        <motion.button key={i} whileTap={{ scale: showAnswer ? 1 : 0.97 }}
                                            onClick={() => handleSelect(i)}
                                            className={`p-4 rounded-2xl border-2 text-left font-semibold transition-all flex items-center gap-3 ${style}`}>
                                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {['A', 'B', 'C', 'D'][i]}
                                            </span>
                                            {opt}
                                            {showAnswer && i === questions[current].ans && <CheckCircle2 className="ml-auto w-5 h-5 text-green-400" />}
                                            {showAnswer && i === selected && i !== questions[current].ans && <XCircle className="ml-auto w-5 h-5 text-red-400" />}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {showAnswer && (
                                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    onClick={handleNext}
                                    className="w-full py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                                    {current + 1 >= questions.length ? '🏆 Xem kết quả' : 'Câu tiếp theo →'}
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {/* === RESULT PHASE === */}
                    {phase === 'result' && (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                className="text-8xl mb-4">{rating.emoji}</motion.div>
                            <h2 className="text-3xl font-extrabold mb-2" style={{ color: rating.color }}>{rating.msg}</h2>
                            <div className="text-6xl font-black my-6" style={{ color: rating.color }}>{score}/{questions.length}</div>
                            <p className="text-slate-400 mb-2">Tỉ lệ đúng: <strong style={{ color: rating.color }}>{scorePercent}%</strong></p>

                            <div className="grid grid-cols-3 gap-4 my-8">
                                {[
                                    { label: 'Đúng', val: score, color: '#6BCB77' },
                                    { label: 'Sai', val: questions.length - score, color: '#FF6B35' },
                                    { label: 'XP kiếm được', val: `+${score * 10}`, color: '#FFD93D' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <div className="text-2xl font-black" style={{ color: item.color }}>{item.val}</div>
                                        <div className="text-xs text-slate-400">{item.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={handleReset}
                                    className="flex-1 py-4 rounded-2xl font-bold border-2 border-white/20 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                                    <RotateCcw className="w-5 h-5" /> Thử lại
                                </button>
                                <Link href="/learn" className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white"
                                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                                    <Zap className="w-5 h-5" /> Công cụ khác
                                </Link>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
