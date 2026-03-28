'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, PlayCircle, Star, Award, Map, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const LearningPathPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPath();
  }, []);

  const fetchPath = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/learning-path');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0D0D1A] text-white flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white relative overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl py-12 px-4 space-y-16 relative z-10">

        {/* Header content */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-bold text-sm mb-4 backdrop-blur-md">
            <Map className="w-4 h-4" /> Bản đồ học viện cơ sở
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Hành trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Học tập</span> của bạn</h1>
          <p className="text-slate-400 italic">"Mỗi bước đi là một chặng đường tới làm chủ ngôn ngữ."</p>
        </motion.div>

        {/* The Path */}
        <div className="relative flex flex-col items-center mt-12">
          {/* Main glowing line */}
          <div className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-rose-500 rounded-full opacity-30 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />

          <div className="space-y-24 relative z-10 w-full pt-8">
            {courses.length > 0 ? courses.map((course, index) => (
              <div key={course.id} className={`flex w-full items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="flex-1 hidden md:block" />

                <div className="relative flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                  >
                    <Link href={`/courses/${course.id}`}>
                      <div className={`relative h-24 w-24 sm:h-28 sm:w-28 rounded-full p-1 border-4 shadow-2xl transition-all hover:scale-110 active:scale-95 z-20 ${index === 0 ? 'border-indigo-400 bg-indigo-500/20 shadow-indigo-500/40' : 'border-white/10 bg-slate-800/80 shadow-black/50'} backdrop-blur-md`}>
                        <div className="h-full w-full rounded-full bg-slate-900/80 flex items-center justify-center overflow-hidden">
                          {index === 0 ? (
                            <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
                          ) : null}
                          {index === 0 ? <PlayCircle className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-400" /> : <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-white/20" />}
                        </div>

                        {/* Floating Rank/Level Tag */}
                        <div className="absolute -top-3 -right-3 sm:-top-2 sm:-right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-lg border border-white/20">
                          {course.level}
                        </div>
                      </div>
                    </Link>
                  </motion.div>

                  {/* Label card */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`absolute top-[110%] sm:top-1/2 sm:-translate-y-1/2 whitespace-nowrap z-10 ${index % 2 === 0 ? 'sm:left-[calc(100%+2rem)]' : 'sm:right-[calc(100%+2rem)]'} text-center sm:text-left`}
                  >
                    <div className={`bg-white/5 border border-white/10 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl ${index % 2 === 0 ? 'sm:text-left' : 'sm:text-right'}`}>
                      <h3 className="text-white font-extrabold text-lg sm:text-xl drop-shadow-md">{course.title}</h3>
                      <div className={`flex items-center gap-1.5 text-xs text-indigo-300 font-bold uppercase tracking-widest mt-1.5 justify-center ${index % 2 === 0 ? 'sm:justify-start' : 'sm:justify-end'}`}>
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span>Chặng {index + 1}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex-1 hidden md:block" />
              </div>
            )) : (
              <div className="text-center text-slate-400 font-bold py-10">Đang chuẩn bị lộ trình của bạn...</div>
            )}

            {/* Bottom Achievement Node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center pt-20 pb-12"
            >
              <div className="h-32 w-32 rounded-full border-4 border-dashed border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center relative">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-full animate-pulse" />
                <Award className="h-12 w-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              </div>
              <p className="mt-6 font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase text-lg">Đích đến cuối cùng</p>
            </motion.div>
          </div>
        </div>

        <div className="flex justify-center pt-12 pb-24">
          <button onClick={fetchPath} className="px-8 py-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-400" /> Tải lại lộ trình
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningPathPage;
