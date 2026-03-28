'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Check, X, RotateCcw, ChevronRight } from 'lucide-react';

interface FlipWord {
    word: string;
    phonetic?: string;
    definition: string;
    example?: string;
}

interface Props {
    words: FlipWord[];
    onComplete?: (known: number, unknown: number) => void;
}

export default function QuickFlipCard({ words, onComplete }: Props) {
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [known, setKnown] = useState(0);
    const [unknown, setUnknown] = useState(0);
    const [done, setDone] = useState(false);
    const [direction, setDirection] = useState<1 | -1>(1);

    const current = words[idx];

    const next = (isKnown: boolean) => {
        if (isKnown) setKnown(k => k + 1); else setUnknown(u => u + 1);
        setDirection(isKnown ? 1 : -1);
        setFlipped(false);
        setTimeout(() => {
            if (idx + 1 >= words.length) {
                setDone(true);
                onComplete?.(known + (isKnown ? 1 : 0), unknown + (isKnown ? 0 : 1));
            } else {
                setIdx(i => i + 1);
            }
        }, 150);
    };

    const restart = () => { setIdx(0); setFlipped(false); setKnown(0); setUnknown(0); setDone(false); };

    const progress = ((idx) / words.length) * 100;

    if (!words.length) return null;

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Progress */}
            <div className="w-full flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">{idx}/{words.length}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                        animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                </div>
                <div className="flex gap-2 text-xs font-bold">
                    <span className="text-emerald-400">✓ {known}</span>
                    <span className="text-rose-400">✗ {unknown}</span>
                </div>
            </div>

            {done ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-6">
                    <div className="text-6xl">🎉</div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-white mb-2">Hoàn thành!</h3>
                        <p className="text-slate-400">Thuộc: <span className="text-emerald-400 font-bold">{known}</span> — Chưa thuộc: <span className="text-rose-400 font-bold">{unknown}</span></p>
                    </div>
                    <button onClick={restart}
                        className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold shadow-lg">
                        <RotateCcw className="w-4 h-4" /> Ôn lại
                    </button>
                </motion.div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div key={idx}
                        initial={{ opacity: 0, x: direction * 60 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -direction * 40 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="w-full">
                        {/* 3D Flip Card */}
                        <div className="relative h-52 cursor-pointer" style={{ perspective: 1200 }} onClick={() => setFlipped(f => !f)}>
                            <motion.div
                                animate={{ rotateY: flipped ? 180 : 0 }}
                                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                                style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
                                className="relative"
                            >
                                {/* Front — word */}
                                <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 flex flex-col items-center justify-center p-8 gap-2">
                                    <p className="text-3xl font-extrabold text-white">{current.word}</p>
                                    {current.phonetic && <p className="text-cyan-400 font-mono text-sm">{current.phonetic}</p>}
                                    <p className="text-slate-500 text-xs mt-4 flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Nhấn để xem nghĩa</p>
                                </div>
                                {/* Back — definition */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 flex flex-col items-center justify-center p-8 gap-3"
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                    <p className="text-lg font-extrabold text-white text-center">{current.definition}</p>
                                    {current.example && <p className="text-slate-400 text-sm italic text-center">"{current.example}"</p>}
                                </div>
                            </motion.div>
                        </div>

                        {/* Action buttons — only shown after flip */}
                        <AnimatePresence>
                            {flipped && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-4 mt-4">
                                    <button onClick={() => next(false)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold hover:bg-rose-500/20 transition-all">
                                        <X className="w-5 h-5" /> Chưa thuộc
                                    </button>
                                    <button onClick={() => next(true)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all">
                                        <Check className="w-5 h-5" /> Đã thuộc
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
