'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    emoji: string;
    color: string; // tailwind gradient
    xp: number;
}

interface Props {
    achievement: Achievement | null;
    onClose: () => void;
}

export default function AchievementToast({ achievement, onClose }: Props) {
    useEffect(() => {
        if (achievement) {
            // Fallback: simple console log or you can add framer-motion particles here
            console.log('🎉 Confetti: Achievement Unlocked -', achievement.title);
            const t = setTimeout(onClose, 5000);
            return () => clearTimeout(t);
        }
    }, [achievement, onClose]);

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    initial={{ opacity: 0, y: -60, scale: 0.8, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                    exit={{ opacity: 0, y: -40, scale: 0.9, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="fixed top-6 left-1/2 z-[500] w-full max-w-sm cursor-pointer"
                    onClick={onClose}
                >
                    <div className={`mx-4 bg-slate-900 border border-white/15 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden`}>
                        {/* Gradient top bar */}
                        <div className={`h-1.5 w-full bg-gradient-to-r ${achievement.color}`} />
                        <div className="flex items-center gap-4 p-5">
                            {/* Animated emoji */}
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.3, 1] }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}
                            >
                                {achievement.emoji}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">🏆 Huy hiệu mới!</div>
                                <h3 className="font-extrabold text-white text-lg leading-tight">{achievement.title}</h3>
                                <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{achievement.description}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-xs font-black text-yellow-400">+{achievement.xp} XP</span>
                                    <span className="text-slate-600 text-xs">nhận được</span>
                                </div>
                            </div>
                        </div>
                        {/* Progress bar auto-close */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                            className={`h-0.5 bg-gradient-to-r ${achievement.color}`}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Standalone hook for easy use ──────────────────────────────────────────
export function useAchievement() {
    const [current, setCurrent] = useState<Achievement | null>(null);
    const [queue, setQueue] = useState<Achievement[]>([]);

    const unlock = (a: Achievement) => {
        setQueue(q => [...q, a]);
    };

    useEffect(() => {
        if (!current && queue.length > 0) {
            setCurrent(queue[0]);
            setQueue(q => q.slice(1));
        }
    }, [current, queue]);

    const close = () => setCurrent(null);

    return { current, unlock, close };
}

// ── Predefined achievements library ──────────────────────────────────────
export const ACHIEVEMENTS: Record<string, Achievement> = {
    first_word: { id: 'first_word', title: 'Học từ đầu tiên!', description: 'Chào mừng bạn đến với hành trình từ vựng.', emoji: '🌱', color: 'from-emerald-400 to-teal-500', xp: 10 },
    streak_7: { id: 'streak_7', title: '7 ngày liên tiếp!', description: 'Kiên trì học 7 ngày không nghỉ.', emoji: '🔥', color: 'from-orange-400 to-red-500', xp: 50 },
    streak_30: { id: 'streak_30', title: 'Tháng vàng!', description: 'Học đều đặn suốt 30 ngày.', emoji: '👑', color: 'from-yellow-400 to-amber-500', xp: 200 },
    words_100: { id: 'words_100', title: '100 từ vựng!', description: 'Vốn từ của bạn đang phát triển mạnh mẽ.', emoji: '📚', color: 'from-blue-400 to-indigo-500', xp: 80 },
    words_500: { id: 'words_500', title: 'Bộ từ 500!', description: 'Bạn đã tích lũy 500 từ — thật ấn tượng!', emoji: '🎓', color: 'from-violet-400 to-purple-500', xp: 300 },
    first_ai: { id: 'first_ai', title: 'AI Buddy!', description: 'Lần đầu sử dụng Giải bài AI.', emoji: '🤖', color: 'from-cyan-400 to-sky-500', xp: 20 },
    pomodoro_5: { id: 'pomodoro_5', title: 'Chiến binh Pomodoro!', description: 'Hoàn thành 5 phiên Pomodoro.', emoji: '⏱️', color: 'from-rose-400 to-pink-500', xp: 40 },
};
