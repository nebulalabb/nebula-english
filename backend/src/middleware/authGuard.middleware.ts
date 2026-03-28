import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { verifyAccessToken } from '../shared/utils/auth.utils';

export interface AuthRequest extends Request {
    user?: { id: string; email: string; role: string; plan: string };
}

// Middleware: yêu cầu JWT hợp lệ
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new AppError('Bạn chưa đăng nhập', 401));
    }
    const token = authHeader.slice(7);
    try {
        const decoded = verifyAccessToken(token) as any;
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role, plan: decoded.plan };
        next();
    } catch {
        next(new AppError('Token không hợp lệ hoặc đã hết hạn', 401));
    }
};

// Middleware: yêu cầu role admin
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return next(new AppError('Bạn không có quyền thực hiện thao tác này', 403));
    }
    next();
};

// Middleware: yêu cầu premium plan
export const requirePremium = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.plan === 'free') {
        return next(new AppError('Tính năng này yêu cầu gói Premium', 403));
    }
    next();
};
