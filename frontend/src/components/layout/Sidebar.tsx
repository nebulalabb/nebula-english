'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  LayoutDashboard, BarChart3, BookText, BookOpen, Library, FileText,
  Headphones, Mic2, PenTool, BookOpenCheck, Trophy, Users, LogOut,
  ChevronRight, Calculator, BrainCircuit, Target, ClipboardList, Zap,
  StickyNote, UserCheck, Crown, Map
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavItem { name: string; path: string; icon: any; badge?: string; badgeColor?: string; }
interface NavGroup { label: string; items: NavItem[]; }

export const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push('/login'); };

  const navGroups: NavGroup[] = [
    {
      label: 'Tổng quan',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Lộ trình học', path: '/learning-path', icon: Map },
        { name: 'Khóa học', path: '/courses', icon: BookOpen },
      ]
    },
    {
      label: 'Luyện tập',
      items: [
        { name: 'Từ vựng', path: '/vocabulary', icon: Library, badge: '12' },
        { name: 'Ngữ pháp', path: '/grammar', icon: FileText },
        { name: 'Nghe hiểu', path: '/listening', icon: Headphones },
        { name: 'Nói & Phát âm', path: '/speaking', icon: Mic2 },
        { name: 'Viết', path: '/writing', icon: PenTool },
        { name: 'Đọc hiểu', path: '/reading', icon: BookOpenCheck },
      ]
    },
    {
      label: 'Công cụ AI',
      items: [
        { name: 'Giải bài AI', path: '/learn/solver', icon: Calculator, badge: 'HOT', badgeColor: '#F43F5E' },
        { name: 'Flashcard AI', path: '/learn/flashcard', icon: BrainCircuit },
        { name: 'Quiz tự động', path: '/learn/quiz', icon: Target, badge: 'Mới', badgeColor: '#818CF8' },
        { name: 'Luyện đề thi', path: '/learn/exams', icon: ClipboardList },
        { name: 'Micro-learning', path: '/learn/microlearn', icon: Zap },
        { name: 'AI Ghi chú', path: '/learn/notes', icon: StickyNote },
        { name: 'Gia sư Nebula', path: '/learn/tutor', icon: UserCheck, badge: 'PRO', badgeColor: '#F59E0B' },
      ]
    },
    {
      label: 'Cộng đồng',
      items: [
        { name: 'Bảng xếp hạng', path: '/leaderboard', icon: Trophy },
        { name: 'Cộng đồng', path: '/forum', icon: Users },
      ]
    }
  ];

  return (
    <aside className="w-[240px] min-w-[240px] h-screen fixed left-0 top-0 z-50 flex flex-col
      bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.06)]">

      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-100 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-md shadow-indigo-500/30">🚀</div>
        <span className="font-extrabold text-[18px] tracking-tight text-slate-800">
          Nebula<span className="text-indigo-500">English</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {navGroups.map((group, gIdx) => (
          <React.Fragment key={gIdx}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 pt-4 pb-1 first:pt-0">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors relative group
                      ${isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div layoutId="nav-active-pill"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-full" />
                    )}
                    <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'}`} size={18} />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                        style={{ background: item.badgeColor || '#6366F1' }}>
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0 space-y-1">
        {/* Profile */}
        <button onClick={() => router.push('/profile')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-extrabold text-white shadow-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1 text-sm font-bold text-slate-800 truncate">
              {user?.name || 'Người dùng'}
              {(user as any)?.isPremium && <Crown size={11} className="text-amber-500 flex-shrink-0" />}
            </div>
            <div className="text-xs text-slate-400 font-medium truncate">⚡ {user?.xp || 0} XP · {user?.level || 'Bắt đầu'}</div>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
        </button>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-sm font-semibold">
          <LogOut size={17} className="flex-shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
