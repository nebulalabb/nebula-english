'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, X, ChevronDown, Coffee, Focus, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

type Mode = 'focus' | 'short' | 'long';
const MODES: Record<Mode, { label: string; seconds: number; color: string; icon: any }> = {
    focus: { label: 'Tập trung', seconds: 25 * 60, color: 'from-indigo-500 to-purple-600', icon: Focus },
    short: { label: 'Nghỉ ngắn', seconds: 5 * 60, color: 'from-emerald-500 to-teal-500', icon: Coffee },
    long: { label: 'Nghỉ dài', seconds: 15 * 60, color: 'from-rose-500 to-pink-500', icon: Moon },
};

export default function StudyTimer() {
    const [mode, setMode] = useState<Mode>('focus');
    const [secondsLeft, setSecondsLeft] = useState(MODES.focus.seconds);
    const [running, setRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [minimized, setMinimized] = useState(true);
    const intervalRef = useRef<any>(null);

    const total = MODES[mode].seconds;
    const progress = (secondsLeft / total) * 100;
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');

    const circumference = 2 * Math.PI * 36;
    const strokeDash = (progress / 100) * circumference;

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSecondsLeft(s => {
                    if (s <= 1) {
                        clearInterval(intervalRef.current);
                        setRunning(false);
                        if (mode === 'focus') setSessions(n => n + 1);
                        toast.success(mode === 'focus' ? '🎉 Hoàn thành phiên học! Nghỉ ngơi chút nhé.' : '⚡ Hết giờ nghỉ! Sẵn sàng học tiếp?', { duration: 4000 });
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running, mode]);

    const switchMode = (m: Mode) => {
        setMode(m); setRunning(false); setSecondsLeft(MODES[m].seconds);
    };
    const reset = () => { setRunning(false); setSecondsLeft(MODES[mode].seconds); };

    const { color, icon: ModeIcon } = MODES[mode];

    if (minimized) {
        return (
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setMinimized(false)}
                className={`fixed top-20 right-4 z-[140] flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r ${color} text-white shadow-lg border border-white/20 text-sm font-bold`}
            >
                <Timer className="w-4 h-4" />
                {running ? `${mins}:${secs}` : 'Pomodoro'}
                {sessions > 0 && <span className="bg-white/20 rounded-full px-1.5 text-xs">{sessions}🍅</span>}
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed top-20 right-4 z-[140] w-64 bg-slate-900/98 border border-white/12 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
        >
            {/* Header */}
            <div className={`bg-gradient-to-r ${color} p-4 relative`}>
                <button onClick={() => setMinimized(true)} className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors">
                    <ChevronDown className="w-3.5 h-3.5 text-white" />
                </button>
                <div className="flex items-center gap-2 mb-3">
                    <ModeIcon className="w-4 h-4 text-white/80" />
                    <span className="text-white/90 text-xs font-black uppercase tracking-widest">{MODES[mode].label}</span>
                </div>

                {/* SVG Ring Timer */}
                <div className="flex items-center justify-center py-2">
                    <div className="relative w-24 h-24">
                        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                            <motion.circle cx="40" cy="40" r="36" fill="none" stroke="white" strokeWidth="5"
                                strokeLinecap="round" strokeDasharray={`${strokeDash} ${circumference}`}
                                animate={{ strokeDasharray: `${strokeDash} ${circumference}` }}
                                transition={{ duration: 0.5 }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-extrabold text-white tabular-nums">{mins}:{secs}</span>
                            {sessions > 0 && <span className="text-xs text-white/70">{sessions} 🍅</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-1 p-3 border-b border-white/6">
                {(Object.entries(MODES) as [Mode, any][]).map(([key, val]) => (
                    <button key={key} onClick={() => switchMode(key)}
                        className={`flex-1 text-xs font-bold py-1.5 rounded-xl transition-all ${mode === key ? `bg-gradient-to-r ${val.color} text-white` : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                        {key === 'focus' ? '🎯' : key === 'short' ? '☕' : '🌙'}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-4 py-3">
                <button onClick={reset} className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <RotateCcw className="w-4 h-4" />
                </button>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setRunning(r => !r)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r ${color} text-white font-bold text-sm shadow-lg`}
                >
                    {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    {running ? 'Dừng' : secondsLeft < total ? 'Tiếp' : 'Bắt đầu'}
                </motion.button>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-500 text-xs font-black">
                    {sessions}🍅
                </div>
            </div>
        </motion.div>
    );
}
