import prisma from '../../config/prisma';
import redisClient from '../../config/redis';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/auth.utils';
import { AppError } from '../../middleware/error.middleware';
import crypto from 'crypto';
import transporter from '../../config/mailer';

export class AuthService {
  // ─── REGISTER ────────────────────────────────────────────────────────────
  static async register(data: { email: string; password: string; fullName: string }) {
    const { email, password, fullName } = data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email này đã được sử dụng', 409);

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName },
    });

    // Tạo email verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await prisma.emailVerification.create({
      data: { userId: user.id, token, type: 'verify_email', expiresAt },
    });

    // Gửi email (không block)
    try {
      const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Xác thực tài khoản NebulaLab của bạn',
        html: `<p>Xin chào <strong>${fullName}</strong>,</p>
               <p>Nhấn vào link dưới để xác thực email của bạn:</p>
               <a href="${verifyUrl}">${verifyUrl}</a>
               <p>Link hết hạn sau 24 giờ.</p>`,
      });
    } catch (_) {
      // Không fail đăng ký nếu mail lỗi
    }

    return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.', userId: user.id };
  }

  // ─── VERIFY EMAIL ─────────────────────────────────────────────────────────
  static async verifyEmail(token: string) {
    const record = await prisma.emailVerification.findUnique({ where: { token } });
    if (!record || record.usedAt) throw new AppError('Token không hợp lệ', 400);
    if (record.expiresAt < new Date()) throw new AppError('Token đã hết hạn', 410);

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
      prisma.emailVerification.update({ where: { token }, data: { usedAt: new Date() } }),
    ]);

    return { message: 'Email đã được xác thực.', redirectUrl: '/dashboard' };
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  static async login(data: { email: string; password: string }, meta: { ip?: string; userAgent?: string }) {
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) throw new AppError('Email hoặc mật khẩu không chính xác', 401);

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new AppError('Email hoặc mật khẩu không chính xác', 401);

    if (user.deletedAt) throw new AppError('Tài khoản đã bị tạm khóa', 403);

    const payload = { id: user.id, email: user.email, role: user.role, plan: user.plan };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Lưu session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Cache user
    await redisClient.set(`user:${user.id}`, JSON.stringify({
      id: user.id, email: user.email, role: user.role, plan: user.plan, fullName: user.fullName,
    }), 'EX', 900);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
      },
    };
  }

  // ─── REFRESH TOKEN ────────────────────────────────────────────────────────
  static async refresh(refreshToken: string) {
    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Token không hợp lệ', 401);
    }

    const session = await prisma.userSession.findUnique({ where: { refreshToken } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppError('Phiên đăng nhập đã hết hạn', 401);
    }

    // Cập nhật last_active
    await prisma.userSession.update({ where: { refreshToken }, data: { lastActiveAt: new Date() } });

    const payload = { id: decoded.id, email: decoded.email, role: decoded.role, plan: decoded.plan };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Rotate refresh token
    await prisma.userSession.update({
      where: { refreshToken },
      data: { refreshToken: newRefreshToken },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  static async logout(refreshToken: string) {
    await prisma.userSession.updateMany({
      where: { refreshToken },
      data: { revokedAt: new Date() },
    });
    return { message: 'Đã đăng xuất.' };
  }

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Không reveal nếu user không tồn tại
    if (!user) return { message: 'Link đặt lại mật khẩu đã gửi về email.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await prisma.emailVerification.create({
      data: { userId: user.id, token, type: 'reset_password', expiresAt },
    });

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Đặt lại mật khẩu NebulaLab',
        html: `<p>Nhấn link để đặt lại mật khẩu: <a href="${resetUrl}">${resetUrl}</a></p><p>Link hết hạn sau 1 giờ.</p>`,
      });
    } catch (_) { }

    return { message: 'Link đặt lại mật khẩu đã gửi về email.' };
  }

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  static async resetPassword(token: string, newPassword: string) {
    const record = await prisma.emailVerification.findUnique({ where: { token } });
    if (!record || record.type !== 'reset_password' || record.usedAt) {
      throw new AppError('Token không hợp lệ', 400);
    }
    if (record.expiresAt < new Date()) throw new AppError('Token đã hết hạn', 410);

    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.emailVerification.update({ where: { token }, data: { usedAt: new Date() } }),
    ]);

    return { message: 'Mật khẩu đã được cập nhật.' };
  }
}
