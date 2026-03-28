'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BrainCircuit,
    Calculator,
    FileText,
    BookOpen,
    UserCheck,
    Target,
    FileCheck,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

const ageLevels = [
    { id: 'all', label: '🌟 Tất cả', color: '#A78BFA' },
    { id: 'primary', label: '🌱 Tiểu học (6-11)', color: '#6BCB77' },
    { id: 'middle', label: '🚀 THCS (12-15)', color: '#4ECDC4' },
    { id: 'high', label: '🔥 THPT (16-18)', color: '#FF6B35' },
];

const tools = [
    {
        id: 'solver',
        name: 'Giải bài AI',
        description: 'Chụp ảnh hoặc nhập câu hỏi, AI sẽ giải thích từng bước cặn kẽ.',
        icon: <Calculator className="w-8 h-8 text-blue-500" />,
        href: '/learn/solver',
        color: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-500/30',
        badge: 'Phổ biến'
    },
    {
        id: 'flashcard',
        name: 'Flashcard Thông Minh',
        description: 'Tạo thẻ nhớ tự động từ PDF/Text. Học theo thuật toán Spaced Repetition.',
        icon: <BrainCircuit className="w-8 h-8 text-purple-500" />,
        href: '/learn/flashcard',
        color: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple-500/30',
    },
    {
        id: 'notes',
        name: 'AI Ghi chú & Tóm tắt',
        description: 'Dán văn bản dài, AI sẽ tự động tóm tắt và trích xuất từ khoá chuẩn xác.',
        icon: <FileText className="w-8 h-8 text-emerald-500" />,
        href: '/learn/notes',
        color: 'from-emerald-500/20 to-teal-500/20',
        borderColor: 'border-emerald-500/30',
    },
    {
        id: 'quiz',
        name: 'Tạo Quiz tự động',
        description: 'Biến tài liệu học tập thành bộ câu hỏi trắc nghiệm ngay lập tức.',
        icon: <Target className="w-8 h-8 text-rose-500" />,
        href: '/learn/quiz',
        color: 'from-rose-500/20 to-red-500/20',
        borderColor: 'border-rose-500/30',
        badge: 'Mới'
    },
    {
        id: 'microlearn',
        name: 'Học 5 phút mỗi ngày',
        description: 'Các bài học ngắn gọn, dễ hiểu để duy trì thói quen học tập.',
        icon: <BookOpen className="w-8 h-8 text-amber-500" />,
        href: '/learn/microlearn',
        color: 'from-amber-500/20 to-orange-500/20',
        borderColor: 'border-amber-500/30',
    },
    {
        id: 'exams',
        name: 'Luyện đề',
        description: 'Phân tích điểm yếu và gợi ý đề thi dựa trên năng lực của bạn.',
        icon: <FileCheck className="w-8 h-8 text-indigo-500" />,
        href: '/learn/exams',
        color: 'from-indigo-500/20 to-violet-500/20',
        borderColor: 'border-indigo-500/30',
    },
    {
        id: 'tutor',
        name: 'Gia sư Nebula',
        description: 'Kết nối trực tiếp với gia sư 1-kèm-1 để giải đáp mọi thắc mắc.',
        icon: <UserCheck className="w-8 h-8 text-sky-500" />,
        href: '/learn/tutor',
        color: 'from-sky-500/20 to-blue-500/20',
        borderColor: 'border-sky-500/30',
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function LearnHubPage() {
    const [activeAge, setActiveAge] = useState('all');
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-100 p-6 md:p-12 font-sans overflow-hidden relative">
            {/* Decorative background effects */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-10 text-center md:text-left space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-300 font-medium mb-4 shadow-lg backdrop-blur-md"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Khám phá tri thức với NebulaLab AI · Dành cho lứa tuổi 5–18</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-300"
                    >
                        Trung tâm Công cụ Học tập
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 max-w-3xl"
                    >
                        7 công cụ AI được thiết kế riêng cho trẻ em và học sinh từ 5–18 tuổi.
                    </motion.p>

                    {/* Age level selector */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-2 pt-2">
                        {ageLevels.map(level => (
                            <button key={level.id} onClick={() => setActiveAge(level.id)}
                                className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${activeAge === level.id
                                    ? 'text-white scale-105'
                                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                                    }`}
                                style={activeAge === level.id ? { background: level.color + '40', borderColor: level.color, color: level.color } : {}}>
                                {level.label}
                            </button>
                        ))}
                    </motion.div>
                </header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr"
                >
                    {tools.map((tool) => (
                        <Link href={tool.href} key={tool.id} className="group outline-none">
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`h-full relative overflow-hidden rounded-3xl bg-slate-800/50 backdrop-blur-xl border ${tool.borderColor} p-6 md:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-slate-800/80 cursor-pointer`}
                            >
                                {/* Tool Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                {/* Content */}
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 rounded-2xl bg-slate-900/60 shadow-inner inline-flex border border-white/5 group-hover:bg-slate-900 transition-colors">
                                            {tool.icon}
                                        </div>
                                        {tool.badge && (
                                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-100 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                                                {tool.badge}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors">{tool.name}</h3>
                                        <p className="text-slate-400 leading-relaxed text-sm md:text-base group-hover:text-slate-300 transition-colors line-clamp-2">
                                            {tool.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                                        <span>Mở công cụ</span>
                                        <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}

                    {/* Motivational banner */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-2 xl:col-span-3 border border-dashed border-indigo-500/30 rounded-3xl bg-indigo-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">🚀</span>
                            <div>
                                <h3 className="text-lg font-extrabold text-white">7 công cụ AI — hoàn toàn sẵn sàng!</h3>
                                <p className="text-slate-400 text-sm">Học mỗi ngày để duy trì streak và leo hạng bảng xếp hạng 🏆</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <span className="text-indigo-400 font-bold text-sm">Miễn phí để bắt đầu</span>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
}
