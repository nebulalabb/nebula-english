import prisma from '../../config/prisma';
import { AppError } from '../../middleware/error.middleware';

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        locale: true,
        timezone: true,
        metadata: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateProfile(userId: string, updateData: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  static async getStats(userId: string) {
    const completedLessons = await prisma.userLessonProgress.count({
      where: { userId, status: 'completed' },
    });

    const reviewsDone = await prisma.reviewSchedule.count({
      where: { userId, repetition: { gt: 0 } },
    });

    return {
      completedLessons,
      reviewsDone,
    };
  }

  static async getStreak(userId: string) {
    const streak = await prisma.userStreak.findUnique({
      where: { userId },
      select: { currentStreak: true },
    });
    return streak?.currentStreak || 0;
  }

  static async dailyCheckIn(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let streakRecord = await prisma.userStreak.findUnique({
      where: { userId }
    });

    if (!streakRecord) {
      streakRecord = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
          totalDaysLearned: 1
        },
      });
      return { message: 'Check-in successful', streak: 1 };
    }

    if (!streakRecord.lastActivityDate) {
      streakRecord = await prisma.userStreak.update({
        where: { userId },
        data: { currentStreak: 1, longestStreak: Math.max(1, streakRecord.longestStreak), lastActivityDate: today, totalDaysLearned: streakRecord.totalDaysLearned + 1 }
      });
      return { message: 'Check-in successful', streak: 1 };
    }

    const lastDate = new Date(streakRecord.lastActivityDate);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate.getTime() === today.getTime()) {
      return { message: 'Already checked in today', streak: streakRecord.currentStreak };
    }

    let newStreak = 1;
    if (lastDate.getTime() === yesterday.getTime()) {
      newStreak = streakRecord.currentStreak + 1;
    }

    streakRecord = await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streakRecord.longestStreak),
        lastActivityDate: today,
        totalDaysLearned: streakRecord.totalDaysLearned + 1
      }
    });

    return { message: 'Check-in successful', streak: newStreak };
  }

  static async getNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markNotificationRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async getRanking(period: string) {
    // Basic implementation sorting by XP
    // 'period' could be utilized for weekly/monthly filters if XP history is stored
    // Here we just return top 50 users by absolute XP
    const users = await prisma.user.findMany({
      where: { xp: { gt: 0 } },
      orderBy: { xp: 'desc' },
      take: 50,
      include: {
        streaks: { select: { currentStreak: true } }
      }
    });

    return users.map(u => ({
      id: u.id,
      name: u.fullName,
      xp: u.xp,
      streak: u.streaks?.currentStreak || 0,
      level: u.level || 'A1',
      avatar: u.avatarUrl || '👤' // For the mock UI, it expects emojis or URLs
    }));
  }
}
