'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Search,
    Plus,
    Loader2,
    Sparkles,
    AlignLeft,
    Calendar,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';
import { notesService, NoteItem, NoteSummary } from '@/lib/api/notes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NotesHubPage() {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [selectedNote, setSelectedNote] = useState<any>(null); // NoteDetail includes summaries
    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);

    // Form State
    const [inputTitle, setInputTitle] = useState('');
    const [inputContent, setInputContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setLoadingList(true);
        try {
            const res = await notesService.getNotes(1, 20);
            setNotes(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingList(false);
        }
    };

    const loadNoteDetail = async (id: string) => {
        setLoadingDetail(true);
        setSelectedNote(null);
        try {
            const res = await notesService.getNoteDetail(id);
            setSelectedNote(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleSummarize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputContent.trim()) return;

        setIsSummarizing(true);
        try {
            const res = await notesService.summarize({
                title: inputTitle || 'Trích xuất tự động',
                content: inputContent
            });
            setInputTitle('');
            setInputContent('');
            await fetchNotes();
            loadNoteDetail(res.data.id);
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Có lỗi xảy ra khi tóm tắt.');
        } finally {
            setIsSummarizing(false);
        }
    };

    const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50 font-sans overflow-hidden">

            {/* LSidebar: Notes List */}
            <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-emerald-500" />
                            Ghi chú AI
                        </h2>
                        <button
                            onClick={() => setSelectedNote(null)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                            title="Tạo mới"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm notes..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loadingList ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
                    ) : filteredNotes.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center mt-10">Chưa có ghi chú nào.</p>
                    ) : (
                        filteredNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => loadNoteDetail(note.id)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedNote?.id === note.id
                                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                        : 'bg-white border-slate-100 hover:border-emerald-100 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-slate-800 line-clamp-1">{note.title}</h3>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><AlignLeft className="w-3.5 h-3.5" /> {note.wordCount} chữ</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RMain: Detail or Form */}
            <div className="flex-1 flex flex-col bg-slate-50/50 relative overflow-hidden hidden md:flex">
                {loadingDetail ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : selectedNote ? (
                    // --- Viewer ---
                    <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-8">

                                <header className="border-b border-slate-100 pb-6">
                                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{selectedNote.title}</h1>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span>{new Date(selectedNote.createdAt).toLocaleString('vi-VN')}</span>
                                        <span>•</span>
                                        <span>{selectedNote.wordCount} chữ gốc</span>
                                    </div>
                                </header>

                                {selectedNote.summaries && selectedNote.summaries.length > 0 && (
                                    <div className="space-y-6">
                                        {/* Keywords */}
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNote.summaries[0].keywords.map((kw: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Short Summary */}
                                        <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                                            <h4 className="flex items-center gap-2 font-bold text-emerald-800 mb-3">
                                                <Sparkles className="w-5 h-5" /> Tóm tắt cốt lõi
                                            </h4>
                                            <p className="text-slate-700 leading-relaxed text-lg">
                                                {selectedNote.summaries[0].summaryShort}
                                            </p>
                                        </div>

                                        {/* Bullet Points */}
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                Các ý chính
                                            </h4>
                                            <ul className="space-y-3">
                                                {selectedNote.summaries[0].bulletPoints.map((bp: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs mt-0.5">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-slate-700 leading-relaxed">{bp}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-8 mt-8 border-t border-slate-100">
                                    <h4 className="font-bold text-slate-400 mb-4 text-sm uppercase tracking-wider">Văn bản gốc</h4>
                                    <div className="prose prose-slate max-w-none prose-sm text-slate-600 bg-slate-50 p-6 rounded-2xl">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {selectedNote.sourceContent || '*Không có văn bản gốc được lưu*'}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ) : (
                    // --- Generator Form ---
                    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-2xl text-center mb-8"
                        >
                            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 shadow-inner">
                                <Sparkles className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
                                Biến văn bản dài thành tóm tắt siêu nhanh
                            </h1>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                Chỉ cần dán nội dung bài báo, tài liệu hay sách vào đây, AI sẽ giúp bạn trích xuất ý chính và từ khoá trong tích tắc.
                            </p>
                        </motion.div>

                        <motion.form
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            onSubmit={handleSummarize}
                            className="w-full max-w-3xl bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-200 p-6 focus-within:ring-4 focus-within:ring-emerald-50 focus-within:border-emerald-300 transition-all"
                        >
                            <input
                                type="text"
                                placeholder="Tiêu đề (tuỳ chọn)..."
                                value={inputTitle}
                                onChange={e => setInputTitle(e.target.value)}
                                className="w-full text-xl font-bold text-slate-800 placeholder-slate-300 border-none bg-transparent focus:outline-none mb-4 px-2"
                                disabled={isSummarizing}
                            />
                            <textarea
                                value={inputContent}
                                onChange={e => setInputContent(e.target.value)}
                                placeholder="Dán toàn bộ văn bản dài của bạn vào đây (hỗ trợ tiếng Việt & tiếng Anh)..."
                                className="w-full min-h-[250px] p-4 bg-slate-50 border border-slate-100 rounded-2xl resize-none text-slate-700 text-base placeholder-slate-400 focus:outline-none focus:bg-white"
                                disabled={isSummarizing}
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    type="submit"
                                    disabled={isSummarizing || !inputContent.trim()}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all
                    ${isSummarizing || !inputContent.trim()
                                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                            : 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-emerald-500/25'}
                  `}
                                >
                                    {isSummarizing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Đang phân tích...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Tóm tắt ngay
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </div>
        </div>
    );
}
