'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

export default function NewForumPost() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await axios.get('/forum/categories');
                if (res.data.length > 0) {
                    setCategories(res.data);
                    setCategoryId(res.data[0].id);
                }
            } catch (err) { console.error(err); }
        };
        fetchCats();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !categoryId) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setSubmitting(true);
            const res = await axios.post('/forum/posts', { title, content, categoryId });
            toast.success('Đăng bài thành công!');
            router.push(`/forum/${res.data.id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Lỗi khi đăng bài');
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D1A] text-white pt-10 pb-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-8">
                <Link href="/forum" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Quay lại diễn đàn
                </Link>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                    <h1 className="text-3xl font-extrabold mb-2">Tạo bài thảo luận</h1>
                    <p className="text-slate-400 mb-8">Chia sẻ câu hỏi, góc nhìn tài liệu học của bạn cho cộng đồng.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Category selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Chọn chuyên mục</label>
                            <div className="flex flex-wrap gap-3">
                                {categories.map(c => (
                                    <button type="button" key={c.id} onClick={() => setCategoryId(c.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${categoryId === c.id ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                                        {c.icon} {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Tiêu đề bài viết</label>
                            <input
                                value={title} onChange={e => setTitle(e.target.value)}
                                placeholder="Câu hỏi của tôi là..."
                                className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors font-bold text-lg"
                            />
                        </div>

                        {/* Content editor */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-300">Nội dung chi tiết</label>
                                <div className="flex gap-2">
                                    <button type="button" className="p-1.5 rounded flex text-slate-400 hover:text-white transition-colors"><ImageIcon className="w-4 h-4" /></button>
                                    <button type="button" className="p-1.5 rounded flex text-slate-400 hover:text-white transition-colors"><LinkIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <textarea
                                value={content} onChange={e => setContent(e.target.value)}
                                placeholder="Mô tả chi tiết những gì bạn muốn chia sẻ..."
                                className="w-full min-h-[250px] px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors resize-y leading-relaxed"
                            />
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-slate-300">
                                <p className="font-bold text-blue-300 mb-1">Quy tắc cộng đồng</p>
                                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                                    <li>Giữ thái độ tôn trọng với người khác.</li>
                                    <li>Không đăng nội dung quảng cáo spam.</li>
                                    <li>Sử dụng đúng chuyên mục để mọi người dễ tìm kiếm.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button disabled={submitting} type="submit"
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-xl shadow-blue-500/20 disabled:opacity-50 hover:opacity-90 hover:scale-[1.02] transition-all">
                                {submitting ? 'Đang tạo...' : <><Send className="w-5 h-5" /> Đăng bài thảo luận</>}
                            </button>
                        </div>
                    </form>

                </motion.div>
            </div>
        </div>
    );
}
