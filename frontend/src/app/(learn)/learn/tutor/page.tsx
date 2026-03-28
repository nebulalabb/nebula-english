'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Search, Filter, BookOpen, Award } from 'lucide-react';
import Link from 'next/link';

const tutors = [
    {
        id: 1, name: 'Nguyễn Thị Lan', avatar: 'L', subject: 'Tiếng Anh',
        rating: 4.9, reviews: 128, price: 150000, level: 'IELTS 8.0',
        bio: 'Giảng viên 5 năm kinh nghiệm, chuyên luyện IELTS & giao tiếp cho học sinh cấp 2-3.',
        tags: ['IELTS', 'Giao tiếp', 'Ngữ pháp'],
        gradient: 'from-teal-500 to-cyan-400', available: true,
    },
    {
        id: 2, name: 'Trần Minh Hoàng', avatar: 'H', subject: 'Toán học',
        rating: 4.8, reviews: 95, price: 120000, level: 'Thạc sĩ Toán',
        bio: 'Giáo viên Toán chuyên luyện thi vào 10, THPT Quốc gia và Olympic.',
        tags: ['Đại số', 'Hình học', 'Luyện đề'],
        gradient: 'from-orange-500 to-yellow-400', available: true,
    },
    {
        id: 3, name: 'Lê Phương Anh', avatar: 'A', subject: 'Tiếng Anh',
        rating: 4.9, reviews: 210, price: 180000, level: 'CELTA certified',
        bio: 'Native-level speaking trainer. Chuyên phát âm, hội thoại và luyện phỏng vấn.',
        tags: ['Phát âm', 'Speaking', 'Phỏng vấn'],
        gradient: 'from-purple-500 to-pink-400', available: false,
    },
    {
        id: 4, name: 'Phạm Quang Khải', avatar: 'K', subject: 'Khoa học',
        rating: 4.7, reviews: 61, price: 100000, level: 'Kỹ sư Vật lý',
        bio: 'Dạy Lý, Hóa cấp THCS-THPT. Giải thích dễ hiểu, học sinh nắm vững kiến thức.',
        tags: ['Vật lý', 'Hóa học', 'Thí nghiệm'],
        gradient: 'from-green-500 to-emerald-400', available: true,
    },
    {
        id: 5, name: 'Vũ Thị Mai', avatar: 'M', subject: 'Văn học',
        rating: 4.8, reviews: 77, price: 90000, level: 'Cử nhân Sư phạm Văn',
        bio: 'Luyện văn nghị luận, phân tích tác phẩm cho học sinh cấp 2-3 ôn thi tuyển sinh.',
        tags: ['Nghị luận', 'Phân tích', 'Thi tuyển'],
        gradient: 'from-red-500 to-rose-400', available: true,
    },
    {
        id: 6, name: 'Đặng Hùng Cường', avatar: 'C', subject: 'Toán học',
        rating: 4.6, reviews: 44, price: 80000, level: 'Sinh viên SP Toán — top 5%',
        bio: 'Gia sư trẻ năng động, kiên nhẫn, phù hợp học sinh tiểu học và cấp 2.',
        tags: ['Tiểu học', 'Cấp 2', 'Vui học'],
        gradient: 'from-blue-500 to-indigo-400', available: true,
    },
];

const subjects = ['Tất cả', 'Tiếng Anh', 'Toán học', 'Khoa học', 'Văn học'];

export default function TutorPage() {
    const [filter, setFilter] = useState('Tất cả');
    const [search, setSearch] = useState('');
    const [booked, setBooked] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<typeof tutors[0] | null>(null);

    const filtered = tutors.filter(t =>
        (filter === 'Tất cả' || t.subject === filter) &&
        (search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()))
    );

    const handleBook = (id: number) => {
        setBooked(id);
        setShowModal(null);
        setTimeout(() => setBooked(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 text-white p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/learn" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors inline-flex">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold flex items-center gap-2">👨‍🏫 Gia Sư Nebula</h1>
                        <p className="text-slate-400 text-sm">Kết nối với gia sư 1-kèm-1 uy tín</p>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-bold">
                        {tutors.filter(t => t.available).length} gia sư online
                    </div>
                </div>

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm gia sư theo tên, môn học..."
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-sky-400 transition-colors text-sm" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {subjects.map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${filter === s ? 'border-sky-400 bg-sky-500/20 text-sky-300' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Success toast */}
                {booked !== null && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-4 p-4 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-300 font-bold text-center">
                        ✅ Đã gửi yêu cầu đặt lịch thành công! Gia sư sẽ liên hệ bạn sớm.
                    </motion.div>
                )}

                {/* Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((tutor, i) => (
                        <motion.div key={tutor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
                            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/8 transition-all group">
                            {/* Header gradient */}
                            <div className={`h-20 bg-gradient-to-r ${tutor.gradient} relative flex items-end p-4`}>
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${tutor.available ? 'bg-green-500/30 text-green-300' : 'bg-slate-500/30 text-slate-400'}`}>
                                        {tutor.available ? '● Online' : '○ Offline'}
                                    </span>
                                </div>
                            </div>

                            {/* Avatar */}
                            <div className="px-5 relative">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tutor.gradient} flex items-center justify-center text-2xl font-black text-white shadow-lg -mt-8 mb-3`}>
                                    {tutor.avatar}
                                </div>
                            </div>

                            <div className="px-5 pb-5">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-extrabold text-base">{tutor.name}</h3>
                                    <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                                        <Star className="w-4 h-4 fill-current" /> {tutor.rating}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-slate-400">{tutor.subject}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                    <span className="text-xs text-sky-400 font-bold">{tutor.level}</span>
                                </div>
                                <p className="text-slate-400 text-xs mb-3 line-clamp-2">{tutor.bio}</p>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {tutor.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">{tag}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="text-lg font-extrabold text-white">{tutor.price.toLocaleString('vi-VN')}₫</span>
                                        <span className="text-xs text-slate-400">/giờ</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Award className="w-3 h-3" /> {tutor.reviews} đánh giá
                                    </div>
                                </div>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowModal(tutor)}
                                    disabled={!tutor.available}
                                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${tutor.available ? 'text-white' : 'bg-white/10 text-slate-500 cursor-not-allowed'}`}
                                    style={tutor.available ? { background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' } : {}}>
                                    {tutor.available ? '📅 Đặt lịch học' : 'Hiện không có sẵn'}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">Không tìm thấy gia sư phù hợp</p>
                        <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-extrabold mb-1">📅 Đặt lịch với {showModal.name}</h2>
                        <p className="text-slate-400 text-sm mb-5">{showModal.subject} · {showModal.price.toLocaleString('vi-VN')}₫/giờ</p>
                        <div className="space-y-3 mb-5">
                            {['Sáng mai 9:00', 'Chiều mai 15:00', 'Tối mai 19:00'].map(slot => (
                                <button key={slot} onClick={() => handleBook(showModal.id)}
                                    className="w-full p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-sky-400 hover:bg-sky-500/10 transition-all text-left font-semibold flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-sky-400" /> {slot}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowModal(null)} className="w-full py-3 rounded-2xl border border-white/20 text-slate-400 font-bold hover:bg-white/5 transition-colors">
                            Huỷ
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
