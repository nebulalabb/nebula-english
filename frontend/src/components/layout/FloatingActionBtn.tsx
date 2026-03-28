'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, X, Library, Mic2, Calculator, StickyNote, BookOpen, Zap } from 'lucide-react';

const ACTIONS = [
    { icon: Library, label: 'Ôn từ vựng', href: '/vocabulary', color: 'from-cyan-500 to-teal-500', angle: -90 },
    { icon: Mic2, label: 'Luyện nói', href: '/speaking', color: 'from-rose-500 to-pink-500', angle: -45 },
    { icon: Calculator, label: 'Giải bài AI', href: '/learn/solver', color: 'from-indigo-500 to-purple-500', angle: 0 },
    { icon: StickyNote, label: 'Ghi chú', href: '/learn/notes', color: 'from-amber-500 to-orange-500', angle: 45 },
    { icon: BookOpen, label: 'Đọc hiểu', href: '/reading', color: 'from-emerald-500 to-green-500', angle: 90 },
];

export default function FloatingActionBtn() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const R = 80; // radius in px

    return (
        <div className="fixed bottom-8 right-8 z-[150]">
            {/* Action buttons */}
            <AnimatePresence>
                {open && ACTIONS.map((action, i) => {
                    const rad = ((action.angle - 90) * Math.PI) / 180;
                    const x = Math.cos(rad) * R;
                    const y = Math.sin(rad) * R;
                    const Icon = action.icon;
                    return (
                        <motion.div
                            key={action.href}
                            initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                            animate={{ opacity: 1, x, y: -Math.abs(y) - 60, scale: 1 }}
                            exit={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25, delay: i * 0.04 }}
                            className="absolute bottom-0 right-0 flex flex-col items-center gap-1"
                        >
                            <button
                                onClick={() => { router.push(action.href); setOpen(false); }}
                                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform`}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                            <span className="text-[10px] font-black text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full whitespace-nowrap">
                                {action.label}
                            </span>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Backdrop when open */}
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)} />
                )}
            </AnimatePresence>

            {/* Main FAB button */}
            <motion.button
                onClick={() => setOpen(o => !o)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/20"
            >
                <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Plus className="w-6 h-6" />
                </motion.div>
                {/* Pulse ring when closed */}
                {!open && (
                    <span className="absolute inset-0 rounded-2xl border-2 border-indigo-400/40 animate-ping" />
                )}
            </motion.button>

            {/* Quick tip label */}
            <AnimatePresence>
                {!open && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="absolute right-full mr-3 bottom-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-400 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-xl border border-white/8">
                            Học nhanh
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
