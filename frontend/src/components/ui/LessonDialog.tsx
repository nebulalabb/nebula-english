'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, BookOpen, Zap, Play, ArrowRight, Star, ChevronRight, Users, Trophy } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface LessonDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lesson: {
        id: string | number;
        title: string;
        description?: string;
        level?: string;
        duration?: string;
        topics?: string[];
        exercises?: number;
        href: string;
        emoji?: string;
        accentColor?: string; // tailwind gradient like 'from-indigo-500 to-purple-500'
        badge?: string;
        badgeColor?: string;
        stats?: { icon: ReactNode; label: string; value: string | number }[];
    } | null;
}

export default function LessonDialog({ isOpen, onClose, lesson }: LessonDialogProps) {
    if (!lesson) return null;
    const accent = lesson.accentColor || 'from-indigo-500 to-purple-600';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                        className="relative w-full sm:max-w-lg bg-slate-900 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl z-10"
                    >
                        {/* Hero gradient top */}
                        <div className={`h-3 w-full bg-gradient-to-r ${accent}`} />

                        {/* Content */}
                        <div className="p-6 sm:p-8">
                            {/* Close */}
                            <button onClick={onClose}
                                className="absolute top-6 right-6 w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all z-10">
                                <X className="w-4 h-4" />
                            </button>

                            {/* Emoji + Level */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center text-3xl shadow-lg`}>
                                    {lesson.emoji || '📖'}
                                </div>
                                <div>
                                    {lesson.badge && (
                                        <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block"
                                            style={{ background: lesson.badgeColor ? `${lesson.badgeColor}20` : 'rgba(99,102,241,0.2)', color: lesson.badgeColor || '#818CF8' }}>
                                            {lesson.badge}
                                        </span>
                                    )}
                                    {lesson.level && (
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Level {lesson.level}</div>
                                    )}
                                </div>
                            </div>

                            {/* Title & Desc */}
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">{lesson.title}</h2>
                            {lesson.description && (
                                <p className="text-slate-400 text-sm leading-relaxed mb-6">{lesson.description}</p>
                            )}

                            {/* Stats Row */}
                            {lesson.stats && lesson.stats.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {lesson.stats.map((stat, i) => (
                                        <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center">
                                            <div className="flex justify-center mb-1 text-slate-400">{stat.icon}</div>
                                            <div className="font-extrabold text-white text-lg">{stat.value}</div>
                                            <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Topics chips */}
                            {lesson.topics && lesson.topics.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {lesson.topics.map((t, i) => (
                                        <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* CTA */}
                            <Link href={lesson.href} onClick={onClose}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full py-4 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r ${accent} shadow-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity`}
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Bắt đầu ngay
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
