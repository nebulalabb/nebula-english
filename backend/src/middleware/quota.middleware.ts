import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import redisClient from '../config/redis';
import { AuthRequest } from './authGuard.middleware';

// Giới hạn quota cho free users
const FREE_LIMITS: Record<string, { limit: number; window: 'daily' | 'monthly' }> = {
    solver: { limit: 5, window: 'daily' },
    flashcard: { limit: 20, window: 'monthly' },
    note: { limit: 3, window: 'daily' },
    quiz: { limit: 1, window: 'daily' },
    exam: { limit: 3, window: 'monthly' },
};

export function quotaGuard(module: string) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) return next();
        // Premium/Enterprise không bị giới hạn
        if (user.plan !== 'free') return next();

        const policy = FREE_LIMITS[module];
        if (!policy) return next();

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const cacheKey = `quota:${user.id}:${module}:${policy.window === 'daily' ? today : today.slice(0, 7)}`;

        // Kiểm tra cache Redis trước
        let count = 0;
        const cached = await redisClient.get(cacheKey);
        if (cached !== null) {
            count = parseInt(cached, 10);
        } else {
            // Đếm từ DB
            const start = policy.window === 'daily'
                ? new Date(today)
                : new Date(today.slice(0, 7) + '-01');

            count = await prisma.usageLog.count({
                where: { userId: user.id, module, createdAt: { gte: start } },
            });

            // TTL: tới cuối ngày/tháng
            const ttl = policy.window === 'daily' ? 86400 : 2592000;
            await redisClient.set(cacheKey, count.toString(), 'EX', ttl);
        }

        if (count >= policy.limit) {
            const resetAt = policy.window === 'daily'
                ? new Date(today + 'T17:00:00.000Z').toISOString() // 00:00 GMT+7
                : new Date(today.slice(0, 7) + '-01').toISOString();

            res.status(429).json({
                success: false,
                error: {
                    code: 'QUOTA_EXCEEDED',
                    message: `Bạn đã dùng hết ${policy.limit} lượt ${module} ${policy.window === 'daily' ? 'hôm nay' : 'tháng này'}`,
                    details: { limit: policy.limit, used: count, reset_at: resetAt, upgrade_url: '/billing/upgrade' },
                },
            });
            return;
        }

        // Gắn hàm tăng count vào request để service gọi sau khi thành công
        (req as any).incrementQuota = async (tokensUsed = 0, action = 'use') => {
            await prisma.usageLog.create({ data: { userId: user.id, module, action, tokensUsed } });
            await redisClient.incr(cacheKey);
        };
        (req as any).quotaRemaining = policy.limit - count - 1;

        next();
    };
}
