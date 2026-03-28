import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const ok = (res: Response, data: any, status = 200) =>
  res.status(status).json({ success: true, data });

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      ok(res, result, 201);
    } catch (e) { next(e); }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.verifyEmail(req.query.token as string);
      ok(res, result);
    } catch (e) { next(e); }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await AuthService.login(req.body, meta);
      ok(res, result);
    } catch (e) { next(e); }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.refresh_token || req.cookies?.refresh_token;
      if (!token) {
        res.status(401).json({ success: false, error: { code: 'NO_TOKEN', message: 'Thiếu refresh token' } });
        return;
      }
      const result = await AuthService.refresh(token);
      ok(res, result);
    } catch (e) { next(e); }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.refresh_token || req.cookies?.refresh_token;
      if (token) await AuthService.logout(token);
      res.clearCookie('refresh_token', { path: '/' });
      ok(res, { message: 'Đã đăng xuất.' });
    } catch (e) { next(e); }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      ok(res, result);
    } catch (e) { next(e); }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, new_password } = req.body;
      const result = await AuthService.resetPassword(token, new_password);
      ok(res, result);
    } catch (e) { next(e); }
  }
}
