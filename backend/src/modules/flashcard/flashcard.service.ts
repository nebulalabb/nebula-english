import prisma from '../../config/prisma';
import { callGeminiJSON } from '../../lib/gemini';
import { AppError } from '../../middleware/error.middleware';

interface FlashcardPair { front: string; back: string; hint?: string }

function buildFlashcardPrompt(content: string, subject: string, count: number, language = 'vi'): string {
    return `Bạn là trợ lý học tập AI. Dựa trên nội dung sau (môn: ${subject}), hãy tạo ${count} cặp flashcard Q&A.
Trả về JSON array: [{"front":"Câu hỏi","back":"Đáp án","hint":"Gợi ý (nếu có)"}]
Ngôn ngữ: ${language === 'vi' ? 'Tiếng Việt' : 'English'}. Chỉ trả về JSON array.

NỘI DUNG:
${content.slice(0, 10000)}`; // Giới hạn 10k chars
}

export class FlashcardService {
    // ─── LẤY DANH SÁCH BỘ ────────────────────────────────────────────────────
    static async getSets(userId: string, params: { page: number; limit: number }) {
        const { page, limit } = params;
        const [sets, total] = await Promise.all([
            prisma.flashcardSet.findMany({
                where: { userId, deletedAt: null },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: { id: true, title: true, description: true, subject: true, sourceType: true, cardCount: true, isPublic: true, createdAt: true },
            }),
            prisma.flashcardSet.count({ where: { userId, deletedAt: null } }),
        ]);
        return { sets, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    // ─── GENERATE TỪ TEXT ────────────────────────────────────────────────────
    static async generateFromText(userId: string, data: {
        title: string; subject: string; content: string; cardCount?: number; language?: string;
    }) {
        const count = Math.min(data.cardCount || 10, 50);
        const prompt = buildFlashcardPrompt(data.content, data.subject, count, data.language);
        const pairs = await callGeminiJSON<FlashcardPair[]>(prompt, false);

        const set = await prisma.flashcardSet.create({
            data: { userId, title: data.title, subject: data.subject, sourceType: 'text', cardCount: pairs.length },
        });
        const cards = await prisma.flashcard.createManyAndReturn({
            data: pairs.map((p, i) => ({ setId: set.id, front: p.front, back: p.back, hint: p.hint, sortOrder: i })),
        });

        return { set: { ...set, cardCount: cards.length }, cards };
    }

    // ─── TẠO THỦ CÔNG ────────────────────────────────────────────────────────
    static async createManual(userId: string, data: {
        title: string; subject?: string; cards: FlashcardPair[];
    }) {
        const set = await prisma.flashcardSet.create({
            data: { userId, title: data.title, subject: data.subject, sourceType: 'manual', cardCount: data.cards.length },
        });
        const cards = await prisma.flashcard.createManyAndReturn({
            data: data.cards.map((c, i) => ({ setId: set.id, front: c.front, back: c.back, hint: c.hint, sortOrder: i })),
        });
        return { set, cards };
    }

    // ─── CHI TIẾT BỘ ─────────────────────────────────────────────────────────
    static async getSetDetail(setId: string, userId: string) {
        const set = await prisma.flashcardSet.findFirst({
            where: { id: setId, userId, deletedAt: null },
            include: { flashcards: { orderBy: { sortOrder: 'asc' } } },
        });
        if (!set) throw new AppError('Không tìm thấy bộ flashcard', 404);
        return set;
    }

    // ─── CẬP NHẬT / XOÁ BỘ ──────────────────────────────────────────────────
    static async updateSet(setId: string, userId: string, data: any) {
        return prisma.flashcardSet.updateMany({ where: { id: setId, userId }, data });
    }

    static async deleteSet(setId: string, userId: string) {
        await prisma.flashcardSet.updateMany({ where: { id: setId, userId }, data: { deletedAt: new Date() } });
        return { message: 'Đã xoá.' };
    }

    // ─── SPACED REPETITION ──────────────────────────────────────────────────
    static async getDueCards(userId: string) {
        const schedules = await prisma.reviewSchedule.findMany({
            where: { userId, nextReviewAt: { lte: new Date() } },
            include: { flashcard: { include: { set: { select: { id: true, title: true } } } } },
            orderBy: { nextReviewAt: 'asc' },
            take: 50,
        });
        return {
            dueCount: schedules.length,
            cards: schedules.map(s => ({
                cardId: s.flashcardId, setId: s.flashcard.setId,
                setTitle: s.flashcard.set.title,
                front: s.flashcard.front, back: s.flashcard.back,
                repetition: s.repetition, easeFactor: Number(s.easinessFactor),
            })),
        };
    }

    // ─── SUBMIT REVIEW (SM-2) ────────────────────────────────────────────────
    static async submitReviews(userId: string, reviews: { cardId: string; quality: number }[]) {
        const results = [];
        for (const { cardId, quality } of reviews) {
            const existing = await prisma.reviewSchedule.findUnique({ where: { userId_flashcardId: { userId, flashcardId: cardId } } });
            let { repetition = 0, easinessFactor: ef = 2.5, intervalDays: interval = 1 } = existing || {};
            ef = Number(ef);

            if (quality >= 3) {
                if (repetition === 0) interval = 1;
                else if (repetition === 1) interval = 6;
                else interval = Math.round(interval * ef);
                ef = Math.max(1.3, ef + 0.1 - (5 - quality) * 0.08);
                repetition++;
            } else {
                repetition = 0;
                interval = 1;
            }

            const nextReviewAt = new Date(Date.now() + interval * 86400000);
            await prisma.reviewSchedule.upsert({
                where: { userId_flashcardId: { userId, flashcardId: cardId } },
                update: { repetition, easinessFactor: ef, intervalDays: interval, nextReviewAt, lastReviewedAt: new Date(), lastQuality: quality },
                create: { userId, flashcardId: cardId, repetition, easinessFactor: ef, intervalDays: interval, nextReviewAt, lastQuality: quality },
            });
            results.push({ cardId, nextReviewAt, intervalDays: interval });
        }
        return { processed: results.length, nextDue: results };
    }
}
