import { Router } from 'express';
import { requireAuth } from '../../middleware/authGuard.middleware';
import prisma from '../../config/prisma';
import { AppError } from '../../middleware/error.middleware';
import { hashPassword, comparePassword } from '../../shared/utils/auth.utils';

const router = Router();
const ok = (res: any, data: any, status = 200) => res.status(status).json({ success: true, data });

router.get('/me', requireAuth as any, async (req: any, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, fullName: true, avatarUrl: true, role: true, plan: true, planExpiresAt: true, locale: true, timezone: true, emailVerified: true, createdAt: true },
        });
        if (!user) throw new AppError('Không tìm thấy người dùng', 404);
        ok(res, user);
    } catch (e) { next(e); }
});

router.patch('/me', requireAuth as any, async (req: any, res, next) => {
    try {
        const { fullName, locale, timezone, metadata } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { ...(fullName && { fullName }), ...(locale && { locale }), ...(timezone && { timezone }), ...(metadata && { metadata }) },
            select: { id: true, email: true, fullName: true, avatarUrl: true, role: true, plan: true },
        });
        ok(res, user);
    } catch (e) { next(e); }
});

router.post('/me/change-password', requireAuth as any, async (req: any, res, next) => {
    try {
        const { current_password, new_password } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user?.passwordHash) throw new AppError('Tài khoản không có mật khẩu', 400);
        const valid = await comparePassword(current_password, user.passwordHash);
        if (!valid) throw new AppError('Mật khẩu hiện tại không chính xác', 400);
        await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: await hashPassword(new_password) } });
        ok(res, { message: 'Mật khẩu đã được cập nhật.' });
    } catch (e) { next(e); }
});

router.get('/me/usage', requireAuth as any, async (req: any, res, next) => {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const [todayLogs, monthLogs] = await Promise.all([
            prisma.usageLog.groupBy({ by: ['module'], where: { userId: req.user.id, createdAt: { gte: today } }, _count: true }),
            prisma.usageLog.groupBy({ by: ['module'], where: { userId: req.user.id, createdAt: { gte: monthStart } }, _count: true }),
        ]);
        const summary: Record<string, any> = {};
        for (const m of ['solver', 'flashcard', 'note', 'quiz', 'exam']) {
            summary[m] = { today: todayLogs.find(l => l.module === m)?._count || 0, this_month: monthLogs.find(l => l.module === m)?._count || 0 };
        }
        ok(res, { summary });
    } catch (e) { next(e); }
});

router.get('/ranking', async (req: any, res, next) => {
    try {
        const { period = 'week' } = req.query;
        // In reality, period would filter XP by date. Here we fetch the top 50 users by all-time XP.
        const users = await prisma.user.findMany({
            where: { xp: { gt: 0 } },
            orderBy: { xp: 'desc' },
            take: 50,
            include: { streaks: { select: { currentStreak: true } } }
        });

        const ranking = users.map(u => ({
            id: u.id,
            name: u.fullName,
            xp: u.xp,
            streak: u.streaks?.currentStreak || 0,
            level: u.level || 'A1',
            avatar: u.avatarUrl || '👤'
        }));

        res.status(200).json(ranking);
    } catch (e) { next(e); }
});

export default router;
