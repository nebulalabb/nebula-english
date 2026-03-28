'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, ThumbsUp, Check, ShieldCheck, Share2, MoreVertical, Send, Reply, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function ForumPostDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`/forum/posts/${params.id}`);
                setPost(res.data);
            } catch (err: any) {
                toast.error('Không tải được bài viết. Hoặc bài đã bị xóa.');
                router.push('/forum');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [params.id, router]);

    const toggleLike = async () => {
        if (!post) return;
        try {
            const res = await axios.post(`/forum/posts/${params.id}/like`);
            const incr = res.data.liked ? 1 : -1;
            setPost({ ...post, userLiked: res.data.liked, upvotes: post.upvotes + incr });
        } catch { toast.error('Lỗi khi thích bài viết'); }
    };

    const submitComment = async () => {
        if (!commentText.trim()) return;
        try {
            setSubmitting(true);
            const res = await axios.post(`/forum/posts/${params.id}/comments`, { content: commentText });
            setPost({ ...post, comments: [...post.comments, res.data] });
            setCommentText('');
            toast.success('Đã gửi bình luận');
        } catch { toast.error('Lỗi khi gửi bình luận'); }
        finally { setSubmitting(false); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 animate-spin border-white/10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0D1A] text-white pt-10 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-8">
                <Link href="/forum" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Quay lại diễn đàn
                </Link>

                {/* Post Container */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md mb-8">

                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                            {post.category?.name || 'Tổng hợp'}
                        </span>
                        <span className="text-sm text-slate-400 font-medium">
                            Đăng {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-8">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white/4 border border-white/8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl font-bold shadow-lg">
                            {post.author.fullName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-lg">{post.author.fullName}</span>
                                {post.author.role === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                                {post.author.role === 'tutor' && <Award className="w-4 h-4 text-rose-400" />}
                            </div>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{post.author.role}</span>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none mb-10 text-slate-300 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <button onClick={toggleLike}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${post.userLiked ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'}`}>
                                <ThumbsUp className={`w-5 h-5 ${post.userLiked ? 'fill-current' : ''}`} /> {post.upvotes}
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition-all">
                                <MessageSquare className="w-5 h-5" /> Trả lời
                            </button>
                        </div>
                        <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                    Hôm nay có <span className="text-blue-400">{post.comments.length}</span> bình luận
                </h3>

                <div className="space-y-6 mb-12">
                    {post.comments.map((cmd: any) => (
                        <div key={cmd.id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 flex-shrink-0">
                                {cmd.author.fullName.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-bold text-white">{cmd.author.fullName}</span>
                                            {cmd.author.role === 'tutor' && <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-1.5 rounded border border-rose-500/20">Tutor</span>}
                                            {cmd.author.role === 'admin' && <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 rounded border border-emerald-500/20">Admin</span>}
                                            <span className="text-slate-500 text-xs ml-1">{formatDistanceToNow(new Date(cmd.createdAt), { addSuffix: true, locale: vi })}</span>
                                        </div>
                                        {cmd.isSolution && <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><Check className="w-3.5 h-3.5" /> Giải pháp</span>}
                                    </div>
                                    <p className="text-slate-300">{cmd.content}</p>
                                </div>
                                <div className="flex gap-4 mt-2 ml-2 text-xs font-bold text-slate-500">
                                    <button className="hover:text-blue-400 transition-colors">Upvote ({cmd.upvotes})</button>
                                    <button className="hover:text-white transition-colors">Trả lời</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Write Comment */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-end gap-4 shadow-xl">
                    <textarea
                        value={commentText} onChange={e => setCommentText(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                        className="w-full h-32 bg-slate-900 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                    <button onClick={submitComment} disabled={submitting || !commentText.trim()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold disabled:opacity-50 transition-all hover:scale-105">
                        {submitting ? 'Đang gửi...' : <><Send className="w-4 h-4" /> Đăng bình luận</>}
                    </button>
                </div>

            </div>
        </div>
    );
}
