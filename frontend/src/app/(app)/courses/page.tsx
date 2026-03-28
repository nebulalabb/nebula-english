'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import CourseCard from '@/components/courses/CourseCard';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const levelParams = activeTab === 'all' ? '' : `?level=${activeTab}`;
      const response = await axios.get(`/courses${levelParams}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course: any) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden pb-20">

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl pt-12 pb-8 px-4 sm:px-8 relative z-10 space-y-10">

        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-6 md:flex-row md:items-end md:justify-between md:space-y-0 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-sm">
              ⭐ Premium Library
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Khám phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Khóa học</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl">
              Làm chủ tiếng Anh với lộ trình học AI được thiết kế riêng, kết hợp phương pháp Spaced Repetition và Gamification.
            </p>
          </div>

          <div className="w-full md:max-w-md">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              <input
                placeholder="Tìm kiếm khóa học bạn thích..."
                className="w-full pl-12 pr-4 h-14 bg-white/5 backdrop-blur-xl border border-white/10 focus:border-indigo-400 rounded-2xl outline-none text-white placeholder:text-slate-500 transition-all shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-md w-full sm:w-auto h-14 overflow-hidden">
            {[
              { id: 'all', label: 'Tất cả 📚' },
              { id: 'A1', label: 'A1 🌱' },
              { id: 'B1', label: 'B1 🚀' },
              { id: 'C1', label: 'C1 👑' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none sm:w-28 h-full rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md inline-flex items-center gap-2 self-start sm:self-auto">
            <span className="text-sm font-bold text-slate-300">Tổng số:</span>
            <span className="text-sm font-black text-indigo-400">{filteredCourses.length}</span>
          </div>
        </motion.div>

        {/* Course Grid */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-4 overflow-hidden backdrop-blur-sm animate-pulse">
                  <div className="h-40 w-full rounded-2xl bg-white/10 mb-4" />
                  <div className="h-6 w-3/4 rounded-md bg-white/10 mb-3" />
                  <div className="h-4 w-1/2 rounded-md bg-white/10 mb-6" />
                  <div className="h-12 w-full rounded-xl bg-white/10" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <motion.div
              initial="hidden" animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredCourses.map((course: any) => (
                <motion.div key={course.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <div className="bg-white/5 border border-white/10 hover:border-indigo-500/50 rounded-3xl overflow-hidden backdrop-blur-xl transition-all hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.3)] hover:-translate-y-2 group flex flex-col h-full">
                    <div className="aspect-[4/3] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative overflow-hidden p-6 flex flex-col justify-between">
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]" />
                      <div className="flex justify-between items-start relative z-10">
                        <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg font-bold text-xs border border-white/10">
                          {course.level || 'A1'}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                          ⭐
                        </div>
                      </div>
                      <h3 className="font-extrabold text-xl sm:text-2xl text-white relative z-10 drop-shadow-md leading-tight group-hover:text-indigo-300 transition-colors">
                        {course.title}
                      </h3>
                    </div>
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <p className="text-slate-400 text-sm font-medium mb-6 flex-1 line-clamp-3">
                        {course.description || 'Tham gia khóa học nâng cao trình độ ngay hôm nay...'}
                      </p>
                      <button className="w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2">
                        Bắt đầu học ngay 🚀
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
              <div className="mb-6 rounded-3xl bg-indigo-500/20 p-6 border border-indigo-500/30">
                <Search className="h-16 w-16 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-extrabold mb-2">Không tìm thấy khóa học</h2>
              <p className="text-slate-400 font-medium">Bạn có thể thử tìm kiếm với các từ khóa khác nhau.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
