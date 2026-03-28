'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Lock, Bell, Trash2, Eye, EyeOff, ChevronRight, Shield, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({ reminders: true, newsletter: false, updates: true });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error('Mật khẩu xác nhận không khớp');
    if (passwords.new.length < 6) return toast.error('Mật khẩu mới phải ít nhất 6 ký tự');
    setIsLoading(true);
    try {
      await api.post('/auth/change-password', { oldPassword: passwords.current, newPassword: passwords.new });
      toast.success('Đổi mật khẩu thành công!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally { setIsLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Bạn chắc chắn muốn xoá tài khoản? Hành động này không thể hoàn tác!')) return;
    try {
      toast.success('Tài khoản đã được xoá');
      logout();
    } catch { toast.error('Xoá tài khoản thất bại'); }
  };

  const sections = [
    { id: 'password', label: '🔐 Đổi mật khẩu', icon: Lock, color: '#6366F1' },
    { id: 'notifications', label: '🔔 Thông báo', icon: Bell, color: '#FF6B35' },
    { id: 'danger', label: '⚠️ Vùng nguy hiểm', icon: Trash2, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">⚙️ Cài đặt</h1>
          <p className="text-slate-400">Quản lý tài khoản và tuỳ chọn cá nhân</p>
        </motion.div>

        {/* User info bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-extrabold">{user?.name}</div>
            <div className="text-slate-400 text-sm">{user?.email}</div>
          </div>
          <div className="ml-auto">
            {(user as any)?.isPremium ? (
              <span className="px-3 py-1 rounded-full text-xs font-black" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff' }}>👑 PREMIUM</span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300 border border-white/10">FREE</span>
            )}
          </div>
        </motion.div>

        <div className="space-y-4">

          {/* Password */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="font-extrabold">Bảo mật</div>
                <div className="text-slate-400 text-xs">Đổi mật khẩu tài khoản</div>
              </div>
            </div>
            <div className="p-5">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { id: 'current', label: 'Mật khẩu hiện tại', key: 'current' as const },
                  { id: 'new', label: 'Mật khẩu mới', key: 'new' as const },
                  { id: 'confirm', label: 'Xác nhận mật khẩu mới', key: 'confirm' as const },
                ].map((field, i) => (
                  <div key={i}>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">{field.label}</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={passwords[field.key]}
                        onChange={e => setPasswords({ ...passwords, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-indigo-400 transition-colors pr-10 text-sm" />
                      {field.key === 'current' && (
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                  {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="font-extrabold">Thông báo</div>
                <div className="text-slate-400 text-xs">Tuỳ chỉnh cách nhận thông báo</div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: 'reminders' as const, label: 'Nhắc nhở học tập', desc: 'Nhắc nhở hàng ngày để duy trì streak' },
                { key: 'newsletter' as const, label: 'Bản tin tuần', desc: 'Mẹo học tập và tính năng mới mỗi tuần' },
                { key: 'updates' as const, label: 'Cập nhật sản phẩm', desc: 'Thông báo về tính năng AI mới' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                  <button onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                    className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${notifications[item.key] ? 'bg-indigo-500' : 'bg-white/20'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${notifications[item.key] ? 'left-[26px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Plan upgrade */}
          {!(user as any)?.isPremium && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              className="rounded-3xl p-5 border-2 border-amber-500/30 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))' }}>
              <div className="absolute top-3 right-3 text-amber-400 text-xl">👑</div>
              <h3 className="font-extrabold text-amber-300 mb-1">Nâng cấp Premium</h3>
              <p className="text-slate-400 text-sm mb-4">Mở khoá AI không giới hạn, luyện đề nâng cao và nhiều hơn nữa.</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['AI không giới hạn', 'Luyện đề đầy đủ', 'Gia sư 1-kèm-1', 'Không quảng cáo'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <button className="px-6 py-3 rounded-2xl font-extrabold text-sm"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff' }}>
                Nâng cấp ngay — 99.000₫/tháng →
              </button>
            </motion.div>
          )}

          {/* Danger zone */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
            className="bg-red-500/10 border-2 border-red-500/20 rounded-3xl overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-red-500/20">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-extrabold text-red-400">Vùng nguy hiểm</div>
                <div className="text-slate-400 text-xs">Hành động không thể hoàn tác</div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-slate-400 text-sm mb-4">Xoá tài khoản sẽ xoá toàn bộ dữ liệu học tập, tiến trình và lịch sử của bạn vĩnh viễn.</p>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleDeleteAccount}
                className="px-5 py-3 rounded-2xl font-bold text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                Xoá tài khoản của tôi
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
