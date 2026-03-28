'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell, ChevronDown, Zap, Flame, Heart } from 'lucide-react';

export const Topbar = () => {
  const user = useAuthStore((state) => state.user);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Chào buổi sáng');
    else if (hours < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    setCurrentDate(`${days[now.getDay()]}, ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`);
  }, []);

  return (
    <header className="h-16 flex-shrink-0 flex items-center gap-3 px-6 relative z-30
      bg-slate-900/80 backdrop-blur-xl border-b border-white/8 shadow-[0_1px_0_rgba(255,255,255,0.04)]">

      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <h2 className="font-extrabold text-white text-base leading-tight truncate">
          {greeting}, <span className="text-indigo-400">{user?.name?.split(' ').pop()}!</span> ☀️
        </h2>
        <p className="text-slate-500 text-xs font-medium truncate">{currentDate}</p>
      </div>

      {/* Streak Pill */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-extrabold">
        <Flame className="w-4 h-4" /> {user?.streak || 0}
      </div>

      {/* XP Pill */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-extrabold">
        <Zap className="w-4 h-4" /> {user?.xp || 0}
      </div>

      {/* Lives */}
      <div className="hidden md:flex items-center gap-0.5" title={`${user?.lives || 0}/5 lives`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Heart key={i} className={`w-4 h-4 ${i < (user?.lives || 0) ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} />
        ))}
      </div>

      {/* Notification Button */}
      <div className="relative">
        <button
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Bell className="w-4.5 h-4.5" size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900 animate-pulse" />
        </button>

        {/* Notification Panel */}
        {isNotifOpen && (
          <div className="absolute top-[calc(100%+12px)] right-0 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <span className="font-extrabold text-white text-sm">🔔 Thông báo</span>
              <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Đọc tất cả</button>
            </div>
            <div className="divide-y divide-white/5">
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0 text-lg">📚</div>
                <div>
                  <p className="text-sm font-bold text-white">Từ vựng đến hạn!</p>
                  <p className="text-xs text-slate-400 mt-0.5">12 từ đang chờ bạn ôn tập.</p>
                  <p className="text-[10px] text-indigo-400 font-bold mt-1">Mới</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/8 transition-all group">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black text-white bg-gradient-to-br from-indigo-500 to-purple-500">
          {user?.name?.[0].toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors hidden sm:block">
          {user?.name?.split(' ').pop()}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </div>
    </header>
  );
};
