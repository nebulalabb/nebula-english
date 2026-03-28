'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, XCircle, BarChart2, BookOpen, Filter } from 'lucide-react';
import Link from 'next/link';

const exams = [
    {
        id: 1, title: 'Đề Toán Lớp 6 — HKI', subject: 'Toán', grade: 'Lớp 6', duration: 45, questions: 10,
        difficulty: 'Dễ', color: '#FF6B35', emoji: '🔢',
        items: [
            { q: 'Tính: 125 × 8 = ?', opts: ['1000', '900', '1100', '1050'], ans: 0 },
            { q: 'Ước chung lớn nhất của 12 và 18 là?', opts: ['4', '6', '8', '9'], ans: 1 },
            { q: 'Số nào là số nguyên tố?', opts: ['9', '15', '17', '21'], ans: 2 },
            { q: '3/4 + 1/2 = ?', opts: ['4/6', '5/4', '4/4', '7/4'], ans: 1 },
            { q: 'Diện tích hình vuông cạnh 7cm?', opts: ['28cm²', '42cm²', '49cm²', '56cm²'], ans: 2 },
        ]
    },
    {
        id: 2, title: 'Đề Tiếng Anh Lớp 8 — Grammar', subject: 'Tiếng Anh', grade: 'Lớp 8', duration: 30, questions: 10,
        difficulty: 'Trung bình', color: '#4ECDC4', emoji: '🇬🇧',
        items: [
            { q: 'She ___ (study) English for 3 years.', opts: ['studies', 'has studied', 'studied', 'is studying'], ans: 1 },
            { q: 'The movie ___ (release) yesterday.', opts: ['released', 'was released', 'has released', 'is released'], ans: 1 },
            { q: 'If I ___ rich, I would travel the world.', opts: ['am', 'was', 'were', 'be'], ans: 2 },
            { q: 'She asked me where ___.', opts: ['I live', 'do I live', 'I lived', 'did I live'], ans: 2 },
            { q: '"Magnificent" means:', opts: ['Tiny', 'Impressive', 'Dangerous', 'Quiet'], ans: 1 },
        ]
    },
    {
        id: 3, title: 'Đề Khoa Học Lớp 5 — Tự nhiên', subject: 'Khoa học', grade: 'Lớp 5', duration: 20, questions: 5,
        difficulty: 'Dễ', color: '#6BCB77', emoji: '🌿',
        items: [
            { q: 'Quá trình nào giúp cây tạo ra thức ăn?', opts: ['Hô hấp', 'Quang hợp', 'Tiêu hóa', 'Lọc máu'], ans: 1 },
            { q: 'Hành tinh nào gần Mặt Trời nhất?', opts: ['Sao Kim', 'Trái Đất', 'Sao Thủy', 'Sao Hỏa'], ans: 2 },
            { q: 'Nước sôi ở nhiệt độ bao nhiêu?', opts: ['80°C', '90°C', '100°C', '110°C'], ans: 2 },
            { q: 'Loài nào là động vật máu lạnh?', opts: ['Chó', 'Cá sấu', 'Chim', 'Mèo'], ans: 1 },
            { q: 'Đơn vị đo lực là gì?', opts: ['Kg', 'Lít', 'Newton', 'Mét'], ans: 2 },
        ]
    },
    {
        id: 4, title: 'Đề Lịch Sử Lớp 10 — Thế giới cổ đại', subject: 'Lịch sử', grade: 'Lớp 10', duration: 45, questions: 10,
        difficulty: 'Khó', color: '#A78BFA', emoji: '📜',
        items: [
            { q: 'Nền văn minh nào xây dựng Kim Tự Tháp?', opts: ['Hy Lạp', 'La Mã', 'Ai Cập', 'Trung Quốc'], ans: 2 },
            { q: 'Triết gia nào viết "Cộng hòa"?', opts: ['Socrates', 'Aristotle', 'Plato', 'Thales'], ans: 2 },
        ]
    },
];

const diffColors: Record<string, string> = { 'Dễ': '#6BCB77', 'Trung bình': '#FFD93D', 'Khó': '#FF6B35' };
type Phase = 'list' | 'exam' | 'result';

export default function ExamsPage() {
    const [phase, setPhase] = useState<Phase>('list');
    const [selectedExam, setSelectedExam] = useState<typeof exams[0] | null>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [filterSubject, setFilterSubject] = useState('Tất cả');

    useEffect(() => {
        if (phase !== 'exam' || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { handleSubmit(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    const handleStart = (exam: typeof exams[0]) => {
        setSelectedExam(exam);
        setAnswers(new Array(exam.items.length).fill(null));
        setTimeLeft(exam.duration * 60);
        setPhase('exam');
    };

    const handleAnswer = (qIdx: number, aIdx: number) => {
        setAnswers(prev => prev.map((a, i) => i === qIdx ? aIdx : a));
    };

    const handleSubmit = () => setPhase('result');

    const score = selectedExam ? selectedExam.items.filter((item, i) => answers[i] === item.ans).length : 0;
    const pct = selectedExam ? Math.round((score / selectedExam.items.length) * 100) : 0;

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const subjects = ['Tất cả', ...Array.from(new Set(exams.map(e => e.subject)))];
    const filtered = filterSubject === 'Tất cả' ? exams : exams.filter(e => e.subject === filterSubject);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/8 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => phase !== 'list' ? setPhase('list') : undefined}>
                        <Link href={phase === 'list' ? '/learn' : '#'} onClick={e => { if (phase !== 'list') { e.preventDefault(); setPhase('list'); } }}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors inline-flex">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold flex items-center gap-2">
                            <span>📋</span> Luyện Đề Thi
                        </h1>
                        <p className="text-slate-400 text-sm">Kho đề kiểm tra từ lớp 1 đến lớp 12</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">

                    {/* LIST */}
                    {phase === 'list' && (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Filter */}
                            <div className="flex gap-2 flex-wrap mb-6">
                                <Filter className="w-5 h-5 text-slate-400 self-center" />
                                {subjects.map(s => (
                                    <button key={s} onClick={() => setFilterSubject(s)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${filterSubject === s ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {filtered.map((exam, i) => (
                                    <motion.div key={exam.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                        className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/8 transition-all group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="text-3xl">{exam.emoji}</div>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${diffColors[exam.difficulty]}20`, color: diffColors[exam.difficulty] }}>
                                                {exam.difficulty}
                                            </span>
                                        </div>
                                        <h3 className="font-extrabold text-base mb-1">{exam.title}</h3>
                                        <p className="text-slate-400 text-sm mb-4">{exam.grade} · {exam.subject}</p>
                                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{exam.duration} phút</span>
                                            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{exam.items.length} câu</span>
                                        </div>
                                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleStart(exam)}
                                            className="w-full py-3 rounded-2xl font-bold text-sm text-white transition-all"
                                            style={{ background: `linear-gradient(135deg, ${exam.color}99, ${exam.color})` }}>
                                            Bắt đầu làm bài →
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* EXAM */}
                    {phase === 'exam' && selectedExam && (
                        <motion.div key="exam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Timer bar */}
                            <div className="sticky top-4 z-20 bg-slate-900/90 backdrop-blur border border-white/10 rounded-2xl p-3 mb-6 flex items-center justify-between">
                                <span className="font-bold text-slate-300">{selectedExam.title}</span>
                                <div className={`flex items-center gap-2 font-extrabold text-xl ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                    <Clock className="w-5 h-5" />{formatTime(timeLeft)}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {selectedExam.items.map((item, qi) => (
                                    <motion.div key={qi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: qi * 0.06 } }}
                                        className="bg-white/5 border border-white/10 rounded-3xl p-5">
                                        <p className="font-bold mb-4 text-base"><span className="text-indigo-400 mr-2">Câu {qi + 1}.</span>{item.q}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {item.opts.map((opt, ai) => (
                                                <button key={ai} onClick={() => handleAnswer(qi, ai)}
                                                    className={`p-3 rounded-xl border-2 text-left text-sm font-semibold transition-all flex items-center gap-2 ${answers[qi] === ai ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300' : 'border-white/10 bg-white/3 text-slate-300 hover:border-white/30'}`}>
                                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border border-current flex-shrink-0">
                                                        {['A', 'B', 'C', 'D'][ai]}
                                                    </span>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.button onClick={handleSubmit} whileTap={{ scale: 0.97 }}
                                className="w-full mt-8 py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                                <CheckCircle2 className="w-6 h-6" /> Nộp bài
                            </motion.button>
                        </motion.div>
                    )}

                    {/* RESULT */}
                    {phase === 'result' && selectedExam && (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                            <div className="text-8xl mb-4">{pct >= 80 ? '🏆' : pct >= 60 ? '🌟' : '📚'}</div>
                            <h2 className="text-3xl font-extrabold mb-2">{pct >= 80 ? 'Xuất sắc!' : pct >= 60 ? 'Khá tốt!' : 'Cố lên nhé!'}</h2>
                            <div className="text-6xl font-black my-6 text-indigo-400">{score}/{selectedExam.items.length}</div>
                            <p className="text-slate-400 mb-8">Tỉ lệ đúng: <strong className="text-white">{pct}%</strong></p>

                            {/* Answer review */}
                            <div className="text-left space-y-3 mb-8">
                                {selectedExam.items.map((item, i) => {
                                    const isCorrect = answers[i] === item.ans;
                                    return (
                                        <div key={i} className={`p-4 rounded-2xl border-2 ${isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                                            <div className="flex items-start gap-2">
                                                {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                                                <div>
                                                    <p className="font-semibold text-sm mb-1">{item.q}</p>
                                                    <p className={`text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                        {isCorrect ? '✓ Đúng rồi!' : `✗ Sai. Đáp án đúng: ${item.opts[item.ans]}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setPhase('list')} className="flex-1 py-4 rounded-2xl font-bold border-2 border-white/20 hover:bg-white/5 transition-colors">
                                    ← Kho đề
                                </button>
                                <button onClick={() => handleStart(selectedExam)} className="flex-1 py-4 rounded-2xl font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                                    🔄 Làm lại
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
