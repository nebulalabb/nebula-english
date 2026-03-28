import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await UserService.getProfile(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await UserService.updateProfile(userId, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const file = req.file as any;
      if (!file) {
        throw new Error('Avatar file missing');
      }
      const user = await UserService.updateProfile(userId, { avatarUrl: file.path });
      res.status(200).json({ message: 'Avatar uploaded', avatarUrl: file.path, user });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const stats = await UserService.getStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getStreak(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const streak = await UserService.getStreak(userId);
      res.status(200).json({ streak });
    } catch (error) {
      next(error);
    }
  }

  static async dailyCheckIn(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await UserService.dailyCheckIn(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const notifications = await UserService.getNotifications(userId);
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  static async readNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      await UserService.markNotificationRead(id as string, userId);
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  static async getRanking(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'week' } = req.query; // e.g. 'week', 'month', 'all'

      const users = await UserService.getRanking(period as string);

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
}
