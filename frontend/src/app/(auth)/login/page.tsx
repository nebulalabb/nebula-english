'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import Cookies from 'js-cookie';

/* ─── Validation Schema ─────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/* ─── SVG Icon Components ────────────────────────────────────── */


function IconGoogle() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="3" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconEyeOpen() {
  return (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  );
}

function IconEyeClosed() {
  return (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </>
  );
}

function IconArrowRight() {
  return (
    <svg className="arrow" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconCheckmark() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

/* ─── Illustration SVG ───────────────────────────────────────── */

function SceneIllustration() {
  return (
    <svg className="scene-svg" viewBox="0 0 380 240" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect x="60" y="130" width="260" height="90" rx="18" fill="rgba(255,255,255,0.95)" />
      <rect x="60" y="130" width="130" height="90" rx="18" fill="rgba(255,255,255,0.75)" />
      <rect x="189" y="130" width="3" height="90" fill="rgba(255,107,53,0.25)" />
      <rect x="210" y="155" width="80" height="6" rx="3" fill="rgba(255,107,53,0.2)" />
      <rect x="210" y="170" width="60" height="6" rx="3" fill="rgba(255,107,53,0.15)" />
      <rect x="210" y="185" width="70" height="6" rx="3" fill="rgba(255,107,53,0.15)" />
      <rect x="82" y="155" width="80" height="6" rx="3" fill="rgba(78,205,196,0.3)" />
      <rect x="82" y="170" width="60" height="6" rx="3" fill="rgba(78,205,196,0.2)" />
      <rect x="82" y="185" width="70" height="6" rx="3" fill="rgba(78,205,196,0.2)" />
      <circle cx="190" cy="80" r="38" fill="rgba(255,255,255,0.95)" />
      <circle cx="178" cy="74" r="5" fill="#1E1B4B" />
      <circle cx="202" cy="74" r="5" fill="#1E1B4B" />
      <circle cx="179.5" cy="72.5" r="1.5" fill="white" />
      <circle cx="203.5" cy="72.5" r="1.5" fill="white" />
      <path d="M179 87 Q190 96 201 87" stroke="#FF6B35" strokeWidth="2.5"
        strokeLinecap="round" fill="none" />
      <circle cx="170" cy="83" r="6" fill="rgba(255,150,100,0.25)" />
      <circle cx="210" cy="83" r="6" fill="rgba(255,150,100,0.25)" />
      <ellipse cx="190" cy="46" rx="30" ry="8" fill="#1E1B4B" />
      <rect x="175" y="35" width="30" height="12" rx="3" fill="#1E1B4B" />
      <circle cx="190" cy="35" r="4" fill="#FFD93D" />
      <line x1="220" y1="46" x2="228" y2="60" stroke="#1E1B4B" strokeWidth="2" />
      <rect x="224" y="60" width="10" height="6" rx="2" fill="#FFD93D" />
      <text x="30" y="50" fontSize="22" opacity="0.9">✨</text>
      <text x="320" y="70" fontSize="18" opacity="0.8">⭐</text>
      <text x="50" y="180" fontSize="16" opacity="0.7">💡</text>
      <text x="310" y="160" fontSize="16" opacity="0.7">🎯</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { user, accessToken } = response.data.data;
      
      setAuth(user, accessToken);
      
      toast.success('Đăng nhập thành công!');
      
      if (user.hasCompletedPlacementTest) {
        router.push('/dashboard');
      } else {
        router.push('/placement-test');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-root">

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div className="left-panel">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />

        <div className="chip chip-1">
          <div className="dot" style={{ background: '#6BCB77' }} />
          🔥 Streak 30 ngày
        </div>
        <div className="chip chip-2">
          <div className="dot" style={{ background: '#FFD93D' }} />
          ⭐ 1,240 XP
        </div>
        <div className="chip chip-3">
          <div className="dot" style={{ background: '#A78BFA' }} />
          🏅 Badge mới!
        </div>
        <div className="chip chip-4">
          <div className="dot" style={{ background: '#FF6B35' }} />
          📚 850 từ đã học
        </div>

        <div className="brand">
          <div className="brand-logo overflow-hidden">
            <Image src="/logo.png" alt="NebulaEnglish Logo" width={160} height={160} className="object-contain" />
          </div>
          <div className="brand-name">NebulaEnglish</div>
          <div className="brand-tagline">Học tiếng Anh thông minh hơn mỗi ngày</div>
        </div>

        <div className="illustration">
          <SceneIllustration />
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">50K+</div>
            <div className="stat-label">Học viên</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">1,200+</div>
            <div className="stat-label">Bài học</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">4.9 ⭐</div>
            <div className="stat-label">Đánh giá</div>
          </div>
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div className="right-panel">

        <div className="form-container">
          <div className="form-header">
            <h1>
              Chào mừng<br />
              trở lại! <span>👋</span>
            </h1>
            <p>Đăng nhập để tiếp tục hành trình học tập của bạn</p>
          </div>

          <div className="oauth-row">
            <button 
              type="button" 
              className="oauth-btn" 
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1'}/auth/google`}
            >
              <IconGoogle />
              Google
            </button>
            <button type="button" className="oauth-btn">
              <IconFacebook />
              Facebook
            </button>
          </div>

          <div className="divider">hoặc đăng nhập bằng email</div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field">
              <label htmlFor="email">
                Email <span className="req">*</span>
              </label>
              <div className="input-wrap">
                <IconEmail />
                <input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p style={{ color: 'var(--primary)', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">
                Mật khẩu <span className="req">*</span>
              </label>
              <div className="input-wrap">
                <IconLock />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? <IconEyeClosed /> : <IconEyeOpen />}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p style={{ color: 'var(--primary)', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="form-meta">
              <label className="remember" htmlFor="rememberMe">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setValue('rememberMe', e.target.checked)}
                />
                <div className="check-box">
                  <IconCheckmark />
                </div>
                <span>Nhớ mật khẩu</span>
              </label>

              <Link href="/forgot-password" title="Quên mật khẩu?" className="forgot-link">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập…' : 'Đăng nhập ngay'}
              {!isLoading && <IconArrowRight />}
            </button>
          </form>

          <div className="register-row">
            Chưa có tài khoản?{' '}
            <Link href="/register">Đăng ký miễn phí 🚀</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
