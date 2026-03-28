'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Camera, Edit2, Trophy, Flame, Zap, BookOpen, Clock, Star, Award, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Link from 'next/link';
import StudyHeatmap from '@/components/stats/StudyHeatmap';

const GOALS = [
  { value: 'ielts', label: '🎓 IELTS Preparation', color: '#4ECDC4' },
  { value: 'toeic', label: '💼 TOEIC Preparation', color: '#FF6B35' },
  { value: 'communication', label: '💬 Giao tiếp hàng ngày', color: '#6BCB77' },
  { value: 'business', label: '🏢 Business English', color: '#A78BFA' },
  { value: 'travel', label: '✈️ Du lịch & Văn hóa', color: '#FFD93D' },
];

const mockBadges = [
  { emoji: '🔥', name: 'Streak Master', desc: '30 ngày liên tiếp', color: '#FF6B35' },
  { emoji: '📚', name: 'Word Collector', desc: '500+ từ vựng', color: '#4ECDC4' },
  { emoji: '🏆', name: 'Quiz Champion', desc: 'Đạt 100% quiz', color: '#FFD93D' },
  { emoji: '⚡', name: 'Speed Learner', desc: 'Hoàn thành 10 bài/ngày', color: '#A78BFA' },
  { emoji: '🎯', name: 'Sharpshooter', desc: 'Đúng 90%+ liên tiếp', color: '#6BCB77' },
  { emoji: '🌟', name: 'Rising Star', desc: 'Top 10 tuần đầu', color: '#FFD93D' },
];

const weekActivity = [35, 60, 25, 80, 55, 90, 45];
const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'badges'>('stats');
  const [editOpen, setEditOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    learningGoals: user?.learningGoals || 'ielts',
  });

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/users/me', formData);
      setAuth(response.data, localStorage.getItem('token') || '');
      toast.success('Cập nhật thành công!');
      setEditOpen(false);
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setIsUploading(true);
    try {
      const res = await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAuth(res.data.user, localStorage.getItem('token') || '');
      toast.success('Ảnh đại diện đã cập nhật!');
    } catch { toast.error('Tải ảnh thất bại'); }
    finally { setIsUploading(false); }
  };

  if (!user) return null;

  const initial = (user.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-4 sm:p-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* ─── Hero Profile Card ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 mb-6 backdrop-blur-xl relative overflow-hidden">
          {/* gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)' }} />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-2xl object-cover" /> : initial}
              </div>
              <label htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center cursor-pointer hover:bg-indigo-400 transition-colors shadow-lg">
                <Camera className="w-4 h-4 text-white" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold">{user.name}</h1>
                {(user as any).isPremium && (
                  <span className="px-3 py-1 rounded-full text-xs font-black"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff' }}>👑 PREMIUM</span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {user.level || 'Intermediate'}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-4">{user.email}</p>

              {/* Stats row */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                {[
                  { icon: <Flame className="w-4 h-4" />, val: user.streak || 0, label: 'Ngày streak', color: '#FF6B35' },
                  { icon: <Zap className="w-4 h-4" />, val: user.xp?.toLocaleString() || 0, label: 'Tổng XP', color: '#FFD93D' },
                  { icon: <Trophy className="w-4 h-4" />, val: mockBadges.length, label: 'Huy hiệu', color: '#A78BFA' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <span style={{ color: s.color }}>{s.icon}</span>
                    <span className="font-black" style={{ color: s.color }}>{s.val}</span>
                    <span className="text-slate-400 text-xs">{s.label}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-bold transition-colors">
                <Edit2 className="w-4 h-4" /> Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </motion.div>

        {/* ─── Tabs ─── */}
        <div className="flex gap-2 mb-6">
          {(['stats', 'badges'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${activeTab === tab ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
              {tab === 'stats' ? '📊 Thống kê' : '🏅 Huy hiệu'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ─── Stats Tab ─── */}
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: '📖', label: 'Bài đã học', val: '124', color: '#4ECDC4' },
                  { icon: '📝', label: 'Từ vựng', val: '850', color: '#FF6B35' },
                  { icon: '⏱️', label: 'Tổng giờ học', val: '48h', color: '#A78BFA' },
                  { icon: '🎯', label: 'Điểm TB', val: '82%', color: '#6BCB77' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-xs text-slate-400">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Activity chart */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <StudyHeatmap />
              </div>
            </motion.div>
          )}

          {/* ─── Badges Tab ─── */}
          {activeTab === 'badges' && (
            <motion.div key="badges" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mockBadges.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.06 } }}
                    whileHover={{ y: -4 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center group cursor-pointer hover:bg-white/8 transition-all">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl group-hover:scale-110 transition-transform"
                      style={{ background: `${b.color}20`, border: `2px solid ${b.color}40` }}>
                      {b.emoji}
                    </div>
                    <div className="font-extrabold text-sm mb-1">{b.name}</div>
                    <div className="text-xs text-slate-400">{b.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ─── Edit Modal ─── */}
      <AnimatePresence>
        {editOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-white/20 rounded-3xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold">✏️ Chỉnh sửa hồ sơ</h2>
                <button onClick={() => setEditOpen(false)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block">Tên hiển thị</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block">Mục tiêu học tập</label>
                  <div className="grid grid-cols-1 gap-2">
                    {GOALS.map(g => (
                      <button key={g.value} onClick={() => setFormData({ ...formData, learningGoals: g.value })}
                        className={`p-3 rounded-xl border-2 text-left text-sm font-semibold transition-all flex items-center gap-2 ${formData.learningGoals === g.value ? 'border-indigo-400 bg-indigo-500/20 text-white' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                        {formData.learningGoals === g.value && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditOpen(false)} className="flex-1 py-3 rounded-2xl border border-white/20 font-bold text-slate-400 hover:bg-white/5 transition-colors">Huỷ</button>
                <button onClick={handleUpdateProfile} className="flex-1 py-3 rounded-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>Lưu thay đổi</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
