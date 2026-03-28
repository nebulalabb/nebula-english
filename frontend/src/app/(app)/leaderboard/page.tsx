'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Crown, Flame, Medal, Star, ChevronRight, Users } from 'lucide-react';
import axios from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

// Fallback mock data if API not ready
const MOCK_USERS = [
    { id: '1', name: 'Nguyễn Minh Anh', xp: 4820, streak: 42, level: 'C1', avatar: '👩‍🎓' },
    { id: '2', name: 'Trần Văn Khoa', xp: 3960, streak: 31, level: 'B2', avatar: '🧑‍💻' },
    { id: '3', name: 'Lê Thu Hà', xp: 3410, streak: 28, level: 'B2', avatar: '👩‍🏫' },
    { id: '4', name: 'Phạm Đức Thịnh', xp: 2980, streak: 19, level: 'B1', avatar: '🧑‍🎨' },
    { id: '5', name: 'Hoàng Bảo Châu', xp: 2540, streak: 15, level: 'B1', avatar: '👩‍🔬' },
    { id: '6', name: 'Vũ Quang Huy', xp: 2120, streak: 12, level: 'A2', avatar: '🧑‍🚀' },
    { id: '7', name: 'Đỗ Thị Mai', xp: 1860, streak: 8, level: 'A2', avatar: '👩‍🎤' },
    { id: '8', name: 'Ngô Thanh Tùng', xp: 1540, streak: 5, level: 'A1', avatar: '🧑‍🍳' },
    { id: '9', name: 'Bùi Lan Anh', xp: 1230, streak: 4, level: 'A1', avatar: '👩‍🌾' },
    { id: '10', name: 'Dương Mạnh Cường', xp: 980, streak: 2, level: 'A1', avatar: '🧑‍🏭' },
];

const PERIODS = [
    { id: 'week', label: '🗓️ Tuần này' },
    { id: 'month', label: '📅 Tháng này' },
    { id: 'all', label: '🏆 Mọi thời đại' },
];

const TOP_COLORS = [
    'from-yellow-400 to-amber-500', // 1st
    'from-slate-400 to-slate-500',  // 2nd
    'from-orange-400 to-orange-600', // 3rd
];

export default function LeaderboardPage() {
    const [period, setPeriod] = useState('week');
    const [users, setUsers] = useState(MOCK_USERS);
    const [loading, setLoading] = useState(false);
    const { user: me } = useAuthStore();

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/user/ranking?period=${period}`);
                if (res.data?.length) setUsers(res.data);
            } catch { /* use mock */ }
            finally { setLoading(false); }
        };
        fetchRanking();
    }, [period]);

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
    const item = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

    return (
        <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden pb-24">
            {/* Ambient */}
            <div className="pointer-events-none fixed inset-0 -z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/6 rounded-full blur-[130px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 pt-10 space-y-8">

                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/30">🏆</div>
                        <div>
                            <p className="text-yellow-400 font-black uppercase tracking-widest text-xs">Thành tích xuất sắc</p>
                            <h1 className="text-3xl sm:text-4xl font-extrabold">Bảng <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">Xếp Hạng</span></h1>
                        </div>
                    </div>
                    <p className="text-slate-400 italic">"Học chăm là bạn — luyện đều là vua."</p>
                </motion.div>

                {/* Period Tabs */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                    className="flex bg-white/4 border border-white/8 rounded-2xl p-1 w-full">
                    {PERIODS.map(p => (
                        <button key={p.id} onClick={() => setPeriod(p.id)}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${period === p.id ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                            {p.label}
                        </button>
                    ))}
                </motion.div>

                {/* Top 3 Podium */}
                {users.length >= 3 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
                        className="flex items-end justify-center gap-3 pt-4">
                        {/* 2nd */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-2xl shadow-lg">{users[1].avatar}</div>
                            <div className="text-center">
                                <div className="text-xs font-black text-slate-300 truncate max-w-[80px]">{users[1].name.split(' ').pop()}</div>
                                <div className="text-xs font-bold text-slate-500">{users[1].xp.toLocaleString()} XP</div>
                            </div>
                            <div className="w-20 h-16 rounded-t-2xl bg-gradient-to-b from-slate-600 to-slate-700 border border-white/8 flex items-start justify-center pt-2">
                                <Medal className="w-5 h-5 text-slate-300" />
                            </div>
                        </div>
                        {/* 1st */}
                        <div className="flex flex-col items-center gap-2 -mt-4">
                            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
                                <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                            </motion.div>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl shadow-xl shadow-yellow-500/40 border-2 border-yellow-300/50">{users[0].avatar}</div>
                            <div className="text-center">
                                <div className="text-sm font-extrabold text-white truncate max-w-[90px]">{users[0].name.split(' ').pop()}</div>
                                <div className="text-xs font-bold text-yellow-400">{users[0].xp.toLocaleString()} XP</div>
                            </div>
                            <div className="w-24 h-24 rounded-t-2xl bg-gradient-to-b from-yellow-600/60 to-amber-700/40 border border-yellow-500/30 flex items-start justify-center pt-2">
                                <Trophy className="w-6 h-6 text-yellow-400" />
                            </div>
                        </div>
                        {/* 3rd */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl shadow-lg">{users[2].avatar}</div>
                            <div className="text-center">
                                <div className="text-xs font-black text-slate-300 truncate max-w-[80px]">{users[2].name.split(' ').pop()}</div>
                                <div className="text-xs font-bold text-slate-500">{users[2].xp.toLocaleString()} XP</div>
                            </div>
                            <div className="w-20 h-12 rounded-t-2xl bg-gradient-to-b from-orange-700/60 to-orange-800/40 border border-white/8 flex items-start justify-center pt-2">
                                <Medal className="w-5 h-5 text-orange-400" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Full Ranking List */}
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                    {users.map((u, i) => {
                        const isMe = u.name === me?.name;
                        const isTop3 = i < 3;
                        return (
                            <motion.div key={u.id} variants={item} whileHover={{ x: 4 }}>
                                <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isMe ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-white/4 border-white/8 hover:bg-white/6 hover:border-white/12'}`}>
                                    {/* Rank */}
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${isTop3 ? `bg-gradient-to-br ${TOP_COLORS[i]} text-white shadow-md` : 'bg-white/5 text-slate-400'}`}>
                                        {i + 1}
                                    </div>
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                                        {u.avatar}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-extrabold text-sm truncate ${isMe ? 'text-indigo-300' : 'text-white'}`}>{u.name}</span>
                                            {isMe && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Bạn</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" />{u.streak} ngày</span>
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-purple-400" />{u.level}</span>
                                        </div>
                                    </div>
                                    {/* XP */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="flex items-center gap-1 font-extrabold text-sm text-yellow-400">
                                            <Zap className="w-3.5 h-3.5" />{u.xp.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-600 uppercase tracking-wider">XP</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* My rank if not in top */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="sticky bottom-6 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4">
                    <Users className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <div className="flex-1">
                        <span className="text-sm font-bold text-white">Vị trí của bạn:</span>
                        <span className="text-indigo-400 font-extrabold ml-2">#8</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400">Cần thêm <span className="text-indigo-300 font-extrabold">340 XP</span> lên #7</div>
                </motion.div>
            </div>
        </div>
    );
}
