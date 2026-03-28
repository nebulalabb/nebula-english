'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit,
    Plus,
    Loader2,
    Sparkles,
    BookOpen,
    ArrowLeft,
    RefreshCw,
    Library,
    ChevronRight,
    MoreVertical
} from 'lucide-react';
import { flashcardService, FlashcardSet, Flashcard } from '@/lib/api/flashcard';

export default function FlashcardHubPage() {
    const [sets, setSets] = useState<FlashcardSet[]>([]);
    const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
    const [loading, setLoading] = useState(false);

    // Create Set Modal State
    const [isCreating, setIsCreating] = useState(false);
    const [createMode, setCreateMode] = useState<'text' | 'manual'>('text');
    const [inputTitle, setInputTitle] = useState('');
    const [inputContent, setInputContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Review Mode State
    const [reviewMode, setReviewMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        fetchSets();
    }, []);

    const fetchSets = async () => {
        setLoading(true);
        try {
            const res = await flashcardService.getSets(1, 20);
            setSets(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadSetDetail = async (id: string) => {
        setLoading(true);
        try {
            const res = await flashcardService.getSetDetail(id);
            setSelectedSet(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputTitle.trim() || !inputContent.trim()) return;

        setIsGenerating(true);
        try {
            const res = await flashcardService.generateFromText({ title: inputTitle, content: inputContent });
            setIsCreating(false);
            setInputTitle('');
            setInputContent('');
            await fetchSets();
            loadSetDetail(res.data.id);
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Có lỗi xảy ra khi tạo flashcard.');
        } finally {
            setIsGenerating(false);
        }
    };

    const startReview = () => {
        if (!selectedSet?.flashcards?.length) return;
        setReviewMode(true);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const nextCard = () => {
        if (!selectedSet || !selectedSet.flashcards) return;
        if (currentCardIndex < selectedSet.flashcards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
        } else {
            setReviewMode(false);
            alert('Tuyệt vời! Bạn đã hoàn thành bộ thẻ này.');
        }
    };

    // ---------------------------------------------------------------------------
    // RENDER REVIEW MODE
    // ---------------------------------------------------------------------------
    if (reviewMode && selectedSet && selectedSet.flashcards) {
        const card = selectedSet.flashcards[currentCardIndex];
        return (
            <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col font-sans">
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
                    <button
                        onClick={() => setReviewMode(false)}
                        className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" /> Thoát
                    </button>
                    <div className="font-semibold text-slate-300">
                        {currentCardIndex + 1} / {selectedSet.flashcards.length}
                    </div>
                    <div className="w-20" /> {/* Spacer */}
                </header>

                <div className="flex-1 flex flex-col items-center justify-center p-8 perspective-1000">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentCardIndex + (isFlipped ? '-flipped' : '')}
                            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="w-full max-w-2xl aspect-[3/2] bg-slate-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-12 cursor-pointer border border-slate-700 hover:border-blue-500/50 transition-colors relative"
                        >
                            <div className="absolute top-6 left-6 text-sm font-bold tracking-widest text-slate-500 uppercase">
                                {isFlipped ? 'Mặt sau (Trả lời)' : 'Mặt trước (Câu hỏi)'}
                            </div>
                            <p className="text-3xl md:text-4xl text-center font-medium leading-relaxed">
                                {isFlipped ? card.back : card.front}
                            </p>
                            <div className="absolute bottom-6 text-slate-500 text-sm flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Bấm để lật thẻ
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 flex gap-4"
                        >
                            <button onClick={nextCard} className="px-8 py-3 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all">Khó</button>
                            <button onClick={nextCard} className="px-8 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-xl font-bold hover:bg-amber-500 hover:text-white transition-all">Bình thường</button>
                            <button onClick={nextCard} className="px-8 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all">Dễ</button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------------------------
    // RENDER MAIN DASHBOARD
    // ---------------------------------------------------------------------------
    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50 font-sans overflow-hidden relative">

            {/* LSidebar: Sets List */}
            <div className="w-full md:w-80 lg:w-[400px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="p-6 border-b border-slate-100 flex flex-col gap-6 bg-gradient-to-b from-purple-50/50 to-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                            <BrainCircuit className="w-7 h-7 text-purple-600" />
                            Flashcards
                        </h2>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="p-2.5 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-0.5 transition-all"
                            title="Tạo bộ thẻ mới"
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="flex bg-slate-100/80 p-1 rounded-lg">
                        <button className="flex-1 py-1.5 text-sm font-semibold bg-white text-slate-800 rounded-md shadow-sm">Tất cả</button>
                        <button className="flex-1 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">Cần ôn (0)</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
                    ) : sets.length === 0 ? (
                        <div className="text-center mt-10 p-6">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Library className="w-8 h-8 text-purple-300" />
                            </div>
                            <p className="text-slate-500 text-sm">Chưa có bộ Flashcard nào. Hãy tạo một bộ để bắt đầu học!</p>
                        </div>
                    ) : (
                        sets.map(set => (
                            <div
                                key={set.id}
                                onClick={() => loadSetDetail(set.id)}
                                className={`group p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${selectedSet?.id === set.id
                                        ? 'bg-purple-50 border-purple-200 shadow-sm ring-1 ring-purple-100'
                                        : 'bg-white border-slate-100 hover:border-purple-200 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-slate-800 line-clamp-2 text-lg group-hover:text-purple-700 transition-colors">
                                        {set.title}
                                    </h3>
                                    <button className="text-slate-400 hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                                        <Library className="w-3.5 h-3.5" /> {set.cardCount} thẻ
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium tracking-wide">
                                        {new Date(set.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RMain: Detail or Creation Form */}
            <div className="flex-1 bg-slate-50/50 hidden md:flex flex-col relative">
                {/* Background blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />

                {isCreating ? (
                    // CREATE MODE
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-slate-800">Tạo bộ Flashcard mới</h1>
                                    <p className="text-slate-500 mt-2">Dùng AI để trích xuất tự động từ văn bản, hoặc tạo thủ công do chính bạn biên soạn.</p>
                                </div>
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full border border-slate-200 shadow-sm"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="flex border-b border-slate-100">
                                    <button
                                        onClick={() => setCreateMode('text')}
                                        className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${createMode === 'text' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        Tạo bằng AI (Văn bản)
                                    </button>
                                    <button
                                        onClick={() => setCreateMode('manual')}
                                        className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${createMode === 'manual' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        Tạo thủ công
                                    </button>
                                </div>

                                <div className="p-8">
                                    {createMode === 'text' && (
                                        <form onSubmit={handleGenerate} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề bộ thẻ</label>
                                                <input
                                                    type="text"
                                                    value={inputTitle}
                                                    onChange={e => setInputTitle(e.target.value)}
                                                    placeholder="VD: Từ vựng IELTS Unit 1"
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung văn bản gốc</label>
                                                <textarea
                                                    value={inputContent}
                                                    onChange={e => setInputContent(e.target.value)}
                                                    placeholder="Dán nội dung đoạn văn, bài báo, hoặc danh sách từ vựng vào đây. AI sẽ tự động phân tách thành các câu hỏi và câu trả lời..."
                                                    className="w-full min-h-[200px] p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isGenerating || (!inputTitle || !inputContent)}
                                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                          ${isGenerating || (!inputTitle || !inputContent) ? 'bg-slate-300' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/25 hover:-translate-y-0.5'}
                        `}
                                            >
                                                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang dùng phép thuật AI...</> : <><Sparkles className="w-5 h-5" /> Trích xuất Flashcard</>}
                                            </button>
                                        </form>
                                    )}
                                    {createMode === 'manual' && (
                                        <div className="text-center py-12 text-slate-500">
                                            Tính năng tạo thủ công đang được phát triển. Tạm thời hãy dùng AI nhé!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : selectedSet ? (
                    // VIEW DETAIL MODE
                    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
                        {/* Set Header */}
                        <div className="bg-white px-8 py-6 border-b border-slate-200 flex flex-col justify-end shrink-0 min-h-[160px] relative z-10 shadow-sm">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{selectedSet.title}</h1>
                                    <p className="text-slate-500">{selectedSet.cardCount} thẻ • Tạo ngày {new Date(selectedSet.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <button
                                    onClick={startReview}
                                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg shadow-purple-200 flex items-center gap-2 transition-transform hover:-translate-y-1"
                                >
                                    <BookOpen className="w-5 h-5" /> Ôn tập ngay
                                </button>
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="flex-1 p-8 overflow-y-auto z-10">
                            {selectedSet.flashcards && selectedSet.flashcards.length > 0 ? (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-6xl mx-auto pb-12">
                                    {selectedSet.flashcards.map((card, idx) => (
                                        <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                                            <div className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">Thẻ {idx + 1}</div>
                                            <div className="flex-1 border-b border-slate-100 pb-4 mb-4">
                                                <p className="text-slate-800 font-medium text-lg">{card.front}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-slate-600">{card.back}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center mt-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // EMPTY STATE
                    <div className="flex-1 flex items-center justify-center p-8 z-10">
                        <div className="text-center max-w-md">
                            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6 border border-slate-100 rotate-12">
                                <BrainCircuit className="w-10 h-10 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">Sức mạnh của trí nhớ dài hạn</h2>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                Chọn một bộ thẻ để bắt đầu ôn tập hoặc tạo mới ngay từ mọi tài liệu học tập của bạn nhờ AI.
                            </p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-purple-300 transition-colors"
                            >
                                Tạo bộ thẻ đầu tiên
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
