'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import {
  Plus, ArrowRight, Flame, Zap, Trophy, Clock, BookOpen, CheckCircle2, Target, Sparkles, Star, Award
} from 'lucide-react';
import Link from 'next/link';
import StudyHeatmap from '@/components/stats/StudyHeatmap';

const StreakCalendar = () => {
  const [days, setDays] = useState<any[]>([]);
  const today = new Date().getDate();
  const missed = [6, 14];

  useEffect(() => {
    const totalDays = 31;
    const calendarDays = [];
    for (let d = 1; d <= totalDays; d++) {
      let type = 'normal';
      if (d === today) type = 'today';
      else if (d > today) type = 'future';
      else if (missed.includes(d)) type = 'missed';
      else type = 'studied';
      calendarDays.push({ day: d, type });
    }
    setDays(calendarDays);
  }, [today]);

  return (
    <div className="w-full">
      <div className="text-center font-bold text-slate-300 mb-4">Tháng 3, 2026</div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
          <div key={d} className="text-xs font-bold text-slate-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 lg:gap-2 text-center">
        {days.map((d, i) => {
          let bg = 'bg-white/5 text-slate-400';
          let border = 'border-white/5';
          if (d.type === 'studied') {
            bg = 'bg-orange-500/20 text-orange-400';
            border = 'border-orange-500/30';
          } else if (d.type === 'today') {
            bg = 'bg-indigo-500/30 text-indigo-300';
            border = 'border-indigo-400';
          } else if (d.type === 'missed') {
            bg = 'bg-red-500/10 text-red-500/50 line-through';
          }
          return (
            <div key={i} className={`aspect-square sm:aspect-auto sm:h-10 flex items-center justify-center rounded-xl border ${bg} ${border} text-sm font-bold transition-all hover:scale-105`}>
              {d.day}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-6 justify-center text-[11px] font-bold text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-500/40 rounded-sm"></span> Đã học</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500/20 rounded-sm"></span> Bỏ lỡ</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-500/40 border border-indigo-400 rounded-sm"></span> Hôm nay</span>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const userName = user?.name?.split(' ').pop() || 'Bạn';

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Stats */}
        <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Clock className="w-5 h-5 text-blue-400" />, val: '48h', label: 'Tổng giờ học', bg: 'bg-blue-500/10' },
            { icon: <BookOpen className="w-5 h-5 text-emerald-400" />, val: '850', label: 'Từ vựng', bg: 'bg-emerald-500/10' },
            { icon: <CheckCircle2 className="w-5 h-5 text-purple-400" />, val: '124', label: 'Bài hoàn thành', bg: 'bg-purple-500/10' },
            { icon: <Target className="w-5 h-5 text-rose-400" />, val: '82%', label: 'Điểm TB', bg: 'bg-rose-500/10' },
          ].map((s, i) => (
            <motion.div variants={itemVars} key={i} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-4 backdrop-blur-md">
              <div className={`p-3 rounded-2xl ${s.bg}`}>{s.icon}</div>
              <div>
                <div className="text-xl font-black">{s.val}</div>
                <div className="text-xs font-semibold text-slate-400">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={containerVars} initial="hidden" animate="show" className="grid lg:grid-cols-3 gap-6">

          {/* Main Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Greeting */}
            <motion.div variants={itemVars} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl">
                  🧑‍🎓
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-3xl font-extrabold mb-2">Tiếp tục thôi, {userName}! 💪</h2>
                  <p className="text-indigo-100 font-medium mb-4">Mục tiêu: IELTS 7.0 · Trình độ: <span className="text-white font-bold">{user?.level || 'Bắt đầu'}</span></p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <span className="px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-sm text-sm font-bold flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-400" /> Nhịp độ {user?.streak || 0} ngày
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-sm text-sm font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-yellow-400" /> {user?.xp || 0} XP tuần này
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Continue Learning */}
            <motion.div variants={itemVars} className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">📚 Đang học dở</h3>
                <Link href="/courses" className="text-indigo-400 text-sm font-bold hover:text-indigo-300">Tất cả →</Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                  🔤
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-extrabold text-lg">Present Perfect Continuous</h4>
                  <p className="text-sm text-slate-400 mb-3">Unit 4 · Ngữ pháp B2</p>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-rose-400 w-[62%] rounded-full" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">62% hoàn thành · còn 8 bài tập</p>
                </div>
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-white text-slate-900 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                  Tiếp tục <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* AI Suggestions */}
            <motion.div variants={itemVars} className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">🤖 AI Bắt bệnh & Gợi ý</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400"><Target className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <div className="font-bold">Ôn tập ngữ pháp Past Perfect</div>
                    <div className="text-sm text-slate-400">Bạn hay sai phần này ở Unit 3 · Mất ~10 phút</div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30 transition-colors">Ôn ngay</button>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400"><BookOpen className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <div className="font-bold">12 từ vựng đến hạn ôn tập</div>
                    <div className="text-sm text-slate-400">Thuật toán Spaced Repetition · Mất ~8 phút</div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-colors">Vào ôn</button>
                </div>
              </div>
            </motion.div>
            {/* Study Heatmap */}
            <motion.div variants={itemVars} className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <StudyHeatmap />
            </motion.div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">

            {/* Daily Challenge */}
            <motion.div variants={itemVars} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-lg font-bold flex items-center gap-2 text-rose-400"><Target className="w-5 h-5" /> Thử thách ngày</h3>
                <span className="text-xs font-black px-2 py-1 rounded-md bg-white/10">1 / 3</span>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-lg bg-green-500/20 text-green-400"><CheckCircle2 className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">Làm 1 bài luyện đề</div>
                    <div className="text-xs text-green-400 font-bold">+50 XP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 opacity-60">
                  <div className="p-2 rounded-lg bg-white/5"><Flame className="w-4 h-4 text-orange-400" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">Giữ chuỗi streak</div>
                    <div className="text-xs text-orange-400 font-bold">+100 XP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 opacity-60">
                  <div className="p-2 rounded-lg bg-white/5"><BookOpen className="w-4 h-4 text-blue-400" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">Học 1 bài Microlearn</div>
                    <div className="text-xs text-blue-400 font-bold">+30 XP</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div variants={itemVars} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" /> Chuỗi học</h3>
                <span className="text-xs font-black px-2 py-1 rounded-md bg-orange-500/20 text-orange-400">{user?.streak || 0} ngày 🔥</span>
              </div>
              <StreakCalendar />
            </motion.div>

            {/* Leaderboard */}
            <motion.div variants={itemVars} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> Xếp hạng</h3>
                <Link href="/leaderboard" className="text-indigo-400 text-sm font-bold hover:text-indigo-300">Toàn bộ →</Link>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-2 rounded-xl">
                  <div className="w-6 text-center font-black text-yellow-400">1</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex justify-center items-center text-xs font-bold text-white">N</div>
                  <div className="flex-1 text-sm font-bold">Minh Tuấn</div>
                  <div className="text-xs font-bold text-slate-400">3.8k XP</div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-6 text-center font-black text-indigo-400">12</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex justify-center items-center text-xs font-bold text-white">{userName[0]}</div>
                  <div className="flex-1 text-sm font-bold text-indigo-300">Bạn</div>
                  <div className="text-xs font-bold text-indigo-400">{user?.xp || 0} XP</div>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
