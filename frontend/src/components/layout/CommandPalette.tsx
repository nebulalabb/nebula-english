'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search, LayoutDashboard, BookOpen, Library, FileText, Headphones,
    Mic2, PenTool, BookOpenCheck, Calculator, BrainCircuit, Target,
    Trophy, Map, Settings, User, Zap, Command, ArrowRight, Clock, Hash
} from 'lucide-react';

const ALL_ITEMS = [
    // Navigation
    { id: 'dash', label: 'Dashboard', description: 'Tổng quan tiến trình học', href: '/dashboard', icon: LayoutDashboard, group: 'Trang chính', shortcut: 'D' },
    { id: 'courses', label: 'Khóa học', description: 'Khám phá khoá học tiếng Anh', href: '/courses', icon: BookOpen, group: 'Trang chính' },
    { id: 'path', label: 'Lộ trình học', description: 'Bản đồ hành trình học tập', href: '/learning-path', icon: Map, group: 'Trang chính' },
    { id: 'vocab', label: 'Từ vựng', description: 'Ôn tập và học từ vựng mới', href: '/vocabulary', icon: Library, group: 'Học tập', shortcut: 'V' },
    { id: 'grammar', label: 'Ngữ pháp', description: 'Luyện cấu trúc ngữ pháp', href: '/grammar', icon: FileText, group: 'Học tập' },
    { id: 'listen', label: 'Luyện nghe', description: 'Bài nghe từ cơ bản đến nâng cao', href: '/listening', icon: Headphones, group: 'Học tập' },
    { id: 'speak', label: 'Luyện nói', description: 'Phát âm chuẩn với AI', href: '/speaking', icon: Mic2, group: 'Học tập' },
    { id: 'write', label: 'Kỹ năng viết', description: 'Viết luận và nhận feedback AI', href: '/writing', icon: PenTool, group: 'Học tập' },
    { id: 'read', label: 'Đọc hiểu', description: 'Bài đọc theo trình độ', href: '/reading', icon: BookOpenCheck, group: 'Học tập' },
    { id: 'solver', label: 'Giải bài AI', description: 'AI giải thích bài tập chi tiết', href: '/learn/solver', icon: Calculator, group: 'Công cụ AI', badge: 'HOT' },
    { id: 'flash', label: 'Flashcard AI', description: 'Thẻ ghi nhớ thông minh', href: '/learn/flashcard', icon: BrainCircuit, group: 'Công cụ AI' },
    { id: 'quiz', label: 'Quiz tự động', description: 'Bài kiểm tra tự động hóa', href: '/learn/quiz', icon: Target, group: 'Công cụ AI', badge: 'Mới' },
    { id: 'rank', label: 'Bảng xếp hạng', description: 'Top người dùng theo XP', href: '/leaderboard', icon: Trophy, group: 'Cộng đồng' },
    { id: 'profile', label: 'Hồ sơ cá nhân', description: 'Xem và chỉnh sửa hồ sơ', href: '/profile', icon: User, group: 'Tài khoản' },
    { id: 'settings', label: 'Cài đặt', description: 'Tùy chỉnh giao diện & thông báo', href: '/settings', icon: Settings, group: 'Tài khoản' },
];

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const [recent, setRecent] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Listen for Ctrl+K / Cmd+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(o => !o);
                setQuery('');
                setActiveIdx(0);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    const filtered = query.trim()
        ? ALL_ITEMS.filter(i =>
            i.label.toLowerCase().includes(query.toLowerCase()) ||
            i.description.toLowerCase().includes(query.toLowerCase()) ||
            i.group.toLowerCase().includes(query.toLowerCase())
        )
        : ALL_ITEMS;

    // Group items
    const groups = filtered.reduce<Record<string, typeof ALL_ITEMS>>((acc, item) => {
        (acc[item.group] = acc[item.group] || []).push(item);
        return acc;
    }, {});

    const flatFiltered = filtered;

    const navigate = useCallback((item: typeof ALL_ITEMS[0]) => {
        router.push(item.href);
        setRecent(r => [item.id, ...r.filter(x => x !== item.id)].slice(0, 5));
        setOpen(false);
        setQuery('');
    }, [router]);

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flatFiltered.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && flatFiltered[activeIdx]) navigate(flatFiltered[activeIdx]);
    };

    let globalIdx = 0;

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                        className="relative w-full max-w-xl bg-slate-900/98 border border-white/12 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
                            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
                                onKeyDown={handleKey}
                                placeholder="Tìm kiếm bài học, trang, tính năng..."
                                className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-base"
                            />
                            <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-500 text-xs font-mono">
                                ESC
                            </kbd>
                        </div>

                        {/* Results */}
                        <div className="max-h-[60vh] overflow-y-auto py-2">
                            {Object.entries(groups).length === 0 ? (
                                <div className="py-12 text-center text-slate-500 text-sm">Không tìm thấy kết quả nào</div>
                            ) : (
                                Object.entries(groups).map(([groupName, items]) => (
                                    <div key={groupName}>
                                        <div className="px-4 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{groupName}</div>
                                        {items.map(item => {
                                            const idx = globalIdx++;
                                            const isActive = idx === activeIdx;
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => navigate(item)}
                                                    onMouseEnter={() => setActiveIdx(idx)}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${isActive ? 'bg-indigo-500/20' : 'hover:bg-white/5'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-indigo-500' : 'bg-white/8 border border-white/8'}`}>
                                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-sm font-bold truncate ${isActive ? 'text-indigo-300' : 'text-white'}`}>{item.label}</div>
                                                        <div className="text-xs text-slate-500 truncate">{item.description}</div>
                                                    </div>
                                                    {item.badge && (
                                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {isActive && <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-white/8 px-4 py-2 flex items-center gap-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> di chuyển</span>
                            <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> chọn</span>
                            <span className="flex items-center gap-1"><kbd className="font-mono">ESC</kbd> đóng</span>
                            <span className="ml-auto flex items-center gap-1"><Command className="w-3 h-3" /> Ctrl+K</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
