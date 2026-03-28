'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    Image as ImageIcon,
    Send,
    History,
    Loader2,
    ArrowLeft,
    Sparkles,
    Trash2,
    Bot,
    UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { solverService, SolveHistory } from '@/lib/api/solver';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function SolverChatPage() {
    const [question, setQuestion] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<SolveHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize history on mount
    useEffect(() => {
        fetchHistory();
    }, []);

    // Auto scroll to bottom when new message arrives or loading
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    const fetchHistory = async () => {
        try {
            const res = await solverService.getHistory(1, 50);
            setHistory(res.data.reverse()); // Reverse to show oldest first like a chat
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() && !file) return;

        setLoading(true);

        try {
            let result;
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                if (question.trim()) formData.append('question', question);
                result = await solverService.solveImage(formData);
            } else {
                result = await solverService.solve({ question });
            }

            // Immediately reflect the new message in UI
            setHistory(prev => [...prev, result.data]);
            setQuestion('');
            setFile(null);
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Có lỗi xảy ra khi giải bài.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await solverService.deleteHistory(id);
            setHistory(history.filter(h => h.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    // UI Variants for animations
    const messageVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-900 text-slate-100 font-sans overflow-hidden">
            {/* Sidebar History (Desktop) */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-80 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                ${showHistory ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-400" />
                            Đoạn chat trước
                        </h2>
                        <button className="lg:hidden text-slate-400 hover:text-white transition" onClick={() => setShowHistory(false)}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {history.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center mt-10">Chưa có bài giải nào.</p>
                        ) : (
                            history.map(item => (
                                <div
                                    key={"sidebar-" + item.id}
                                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700/60 hover:border-indigo-500/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-slate-300 line-clamp-2 leading-relaxed">
                                            {item.questionText || 'Giải bài bằng hình ảnh'}
                                        </p>
                                        <button
                                            onClick={(e) => handleDeleteHistory(e, item.id)}
                                            className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                        <span className="uppercase tracking-wider font-semibold text-indigo-400">
                                            {item.subject}
                                        </span>
                                        <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
                {/* Header */}
                <header className="h-16 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.1)] z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/learn" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div className="h-6 w-px bg-slate-700 hidden md:block" />
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center w-10 h-10 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white leading-tight">Nebula AI Solver</h1>
                                <p className="text-xs text-indigo-300 font-medium">✨ Powered by Gemini 1.5 Pro</p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-lg transition"
                        onClick={() => setShowHistory(true)}
                    >
                        <History className="w-5 h-5" />
                    </button>
                </header>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8 pb-10">
                        {history.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center min-h-[50vh] text-center mt-10"
                            >
                                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(99,102,241,0.1)] border border-indigo-500/10">
                                    <Bot className="w-12 h-12 text-indigo-400" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
                                    Giải Bài Cùng AI
                                </h2>
                                <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                                    Nhập đề bài Toán, Lý, Hoá hoặc Tiếng Anh. Tải ảnh lên nếu phương trình quá phức tạp, mình sẽ giải thích từng bước cho bạn nhé!
                                </p>
                            </motion.div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {history.map((item, idx) => (
                                    <div key={item.id} className="space-y-6">
                                        {/* User Bubble */}
                                        <motion.div
                                            variants={messageVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="flex justify-end items-end gap-3"
                                        >
                                            <div className="max-w-[85%] md:max-w-[75%] bg-indigo-600 text-white rounded-3xl rounded-br-sm px-6 py-4 shadow-lg shadow-indigo-600/20 order-1">
                                                {item.questionImageUrl && (
                                                    <img src={item.questionImageUrl} alt="Question" className="w-full max-w-sm rounded-xl mb-3 border border-indigo-400/30" />
                                                )}
                                                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                                                    {item.questionText}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center order-2 shrink-0 border border-slate-600">
                                                <UserCircle className="w-5 h-5 text-slate-300" />
                                            </div>
                                        </motion.div>

                                        {/* AI Bubble */}
                                        <motion.div
                                            variants={messageVariants}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ delay: 0.1 }}
                                            className="flex justify-start items-end gap-3"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                                <Sparkles className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="max-w-[90%] md:max-w-[80%] bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-slate-200 rounded-3xl rounded-bl-sm px-6 py-5 shadow-xl">
                                                <div className="prose prose-invert prose-indigo max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {item.answerText}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </AnimatePresence>
                        )}

                        {/* Loading State Bubble */}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start items-end gap-3 pt-4"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 border border-indigo-400/50">
                                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                                </div>
                                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-3xl rounded-bl-sm px-6 py-4 flex items-center gap-2">
                                    <div className="flex gap-1.5 align-middle">
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-400 ml-2">Đang suy nghĩ...</span>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/80 z-20">
                    <div className="max-w-4xl mx-auto">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500"
                        >
                            {file && (
                                <div className="px-4 pt-4 pb-2">
                                    <div className="relative inline-block rounded-xl overflow-hidden border border-slate-700 bg-slate-800/50 p-1">
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="h-20 object-contain rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => setFile(null)}
                                            className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white p-1 rounded-full hover:bg-rose-500 transition-colors backdrop-blur-sm"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-end gap-2 p-2">
                                <label className="shrink-0 p-3 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 rounded-full cursor-pointer transition-colors border border-slate-700/50 group ml-1 mb-1">
                                    <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        disabled={loading}
                                    />
                                </label>

                                <textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Nhắn tin cho Nebula AI..."
                                    className="flex-1 max-h-[200px] min-h-[50px] py-3.5 px-2 bg-transparent resize-none text-slate-200 text-[15px] placeholder-slate-500 focus:outline-none custom-scrollbar"
                                    disabled={loading}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />

                                <button
                                    type="submit"
                                    disabled={loading || (!question.trim() && !file)}
                                    className={`shrink-0 p-3 rounded-full font-bold text-white transition-all mb-1 mr-1
                                        ${loading || (!question.trim() && !file)
                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95'}
                                    `}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                                </button>
                            </div>
                        </form>
                        <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                            AI có thể mắc lỗi. Vui lòng kiểm tra lại đáp án.
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom CSS for Scrollbars nested locally */}
            <style dangerouslySetContents={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(148, 163, 184, 0.2);
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(148, 163, 184, 0.4);
                }
            `}} />
        </div>
    );
}
