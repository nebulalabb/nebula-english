'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Flame, TrendingUp, Search, Plus, ThumbsUp, MessageCircle, MoreHorizontal, ChevronRight, Pin, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import axios from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Post {
    id: string;
    title: string;
    content: string;
    viewCount: number;
    upvotes: number;
    isPinned: boolean;
    isResolved: boolean;
    createdAt: string;
    author: { id: string; fullName: string; avatarUrl: string | null; role: string };
    category: { id: string; name: string; color: string };
    _count: { comments: number; likes: number };
}

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string | null;
    _count: { posts: number };
}

export default function ForumPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [sort, setSort] = useState('latest');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await axios.get('/forum/categories');
                setCategories(res.data);
            } catch (err) { console.error(err); }
        };
        fetchCats();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (selectedTopic) params.append('category', selectedTopic);
                if (sort) params.append('sort', sort);
                if (search) params.append('search', search);

                const res = await axios.get(`/forum/posts?${params.toString()}`);
                setPosts(res.data.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        const t = setTimeout(fetchPosts, 300);
        return () => clearTimeout(t);
    }, [selectedTopic, sort, search]);

    const TABS = [
        { id: 'latest', label: '🔥 Mới nhất' },
        { id: 'popular', label: '⭐ Phổ biến' },
        { id: 'unanswered', label: '💬 Chưa trả lời' },
    ];

    return (
        <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden pb-24">
            {/* Ambience */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-blue-400 font-black uppercase tracking-widest text-xs">Cộng Đồng</p>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Thảo Luận & Hỏi Đáp</h1>
                            </div>
                        </div>
                        <p className="text-slate-400 italic">"Nơi giải đáp mọi thắc mắc và chia sẻ kinh nghiệm học tập."</p>
                    </motion.div>

                    <Link href="/forum/new">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-xl shadow-blue-500/20 w-full md:w-auto">
                            <Plus className="w-5 h-5" /> Tạo bài viết mới
                        </motion.button>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">

                    {/* Main Feed */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
                                {TABS.map(t => (
                                    <button key={t.id} onClick={() => setSort(t.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${sort === t.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Tìm kiếm bài viết..."
                                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-colors text-sm"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            </div>
                        </div>

                        {/* Post List */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-32 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center bg-white/3 border border-dashed border-white/10 rounded-3xl">
                                <MessageSquare className="w-16 h-16 text-slate-700 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy bài viết nào</h3>
                                <p className="text-slate-400">Hãy là người đầu tiên đặt câu hỏi cho chủ đề này!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <Link key={post.id} href={`/forum/${post.id}`}>
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }}
                                            className="group bg-white/5 border border-white/10 hover:border-blue-500/30 rounded-3xl p-5 sm:p-6 transition-all backdrop-blur-md cursor-pointer flex gap-4 sm:gap-6">

                                            {/* Upvote side */}
                                            <div className="hidden sm:flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-blue-500/10 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                                                    <ThumbsUp className="w-5 h-5" />
                                                </div>
                                                <span className="font-extrabold text-sm">{post.upvotes}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    {post.isPinned && <span className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20"><Pin className="w-3 h-3" /> Pinned</span>}
                                                    {post.isResolved && <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">✅ Đã giải quyết</span>}
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                                                        {post.category?.name || 'Chung'}
                                                    </span>
                                                    <span className="text-xs text-slate-500 ml-auto">
                                                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg sm:text-xl font-extrabold group-hover:text-blue-400 transition-colors mb-2 leading-tight">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                                                    {post.content.replace(/<[^>]*>?/gm, '')}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                                                            {post.author.fullName.charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-300">{post.author.fullName}</span>
                                                        {post.author.role === 'tutor' && <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-1.5 rounded">Tutor</span>}
                                                        {post.author.role === 'admin' && <span className="text-[10px] font-black text-yellow-400 bg-yellow-500/20 px-1.5 rounded">Admin</span>}
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                                        <span className="sm:hidden flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {post.upvotes}</span>
                                                        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post._count.comments} trả lời</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-indigo-400" /> Chuyên mục</h3>
                            <div className="space-y-2">
                                <button onClick={() => setSelectedTopic(null)}
                                    className={`w-full flex justify-between items-center p-3 rounded-2xl transition-all ${!selectedTopic ? 'bg-indigo-500/20 text-white font-bold border border-indigo-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
                                    <span>🌟 Tất cả bài viết</span>
                                </button>
                                {categories.map(c => (
                                    <button key={c.id} onClick={() => setSelectedTopic(c.id)}
                                        className={`w-full flex justify-between items-center p-3 rounded-2xl transition-all ${selectedTopic === c.id ? 'bg-indigo-500/20 text-white font-bold border border-indigo-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
                                        <span className="flex items-center gap-2">{c.icon} {c.name}</span>
                                        <span className="text-xs font-black bg-white/10 px-2 py-0.5 rounded-lg">{c._count.posts}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-rose-400"><Flame className="w-5 h-5" /> Nổi bật trong tuần</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="group cursor-pointer">
                                        <h4 className="text-sm font-bold text-slate-300 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">Làm sao để nhớ từ vựng hiệu quả mà không mau quên?</h4>
                                        <p className="text-xs text-slate-500 mt-1">12 trả lời · 45 upvotes</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
