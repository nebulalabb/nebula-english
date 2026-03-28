import prisma from '../../config/prisma';
import { callGeminiJSON } from '../../lib/gemini';
import { AppError } from '../../middleware/error.middleware';

export class NotesService {
    // ─── TÓM TẮT (AI) ────────────────────────────────────────────────────────
    static async summarize(userId: string, data: {
        title?: string; content: string; sourceType?: string; sourceUrl?: string;
    }) {
        const { content, sourceType = 'text', sourceUrl, title = 'Untitled Note' } = data;
        const wordCount = content.split(/\s+/).length;

        const prompt = `Tóm tắt văn bản sau thành JSON:
{"short": "tóm tắt 3-5 câu", "bullets": ["ý chính 1", ...], "keywords": ["từ khóa 1", ...]}
Trả về JSON thuần, không markdown.

VĂN BẢN:
${content.slice(0, 20000)}`;

        const summary = await callGeminiJSON<{
            short: string; bullets: string[]; keywords: string[];
        }>(prompt, false);

        const note = await prisma.note.create({
            data: { userId, title, sourceType, sourceContent: content, sourceUrl, wordCount },
        });
        const noteSummary = await prisma.noteSummary.create({
            data: {
                noteId: note.id,
                summaryShort: summary.short,
                bulletPoints: summary.bullets,
                keywords: summary.keywords,
            },
        });

        return {
            noteId: note.id,
            summary: {
                short: summary.short,
                bullets: summary.bullets,
                keywords: summary.keywords,
            },
        };
    }

    // ─── DANH SÁCH NOTES ───────────────────────────────────────────────────
    static async getNotes(userId: string, params: { page: number; limit: number; search?: string }) {
        const { page, limit, search } = params;
        const where: any = { userId, deletedAt: null };
        if (search) where.title = { contains: search, mode: 'insensitive' };

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where,
                orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
                include: { summaries: { take: 1, orderBy: { createdAt: 'desc' }, select: { summaryShort: true, keywords: true } } },
            }),
            prisma.note.count({ where }),
        ]);
        return { notes, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    // ─── CHI TIẾT ─────────────────────────────────────────────────────────
    static async getNoteDetail(noteId: string, userId: string) {
        const note = await prisma.note.findFirst({
            where: { id: noteId, userId, deletedAt: null },
            include: { summaries: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        if (!note) throw new AppError('Không tìm thấy note', 404);
        return note;
    }

    // ─── CẬP NHẬT / XOÁ ──────────────────────────────────────────────────
    static async updateNote(noteId: string, userId: string, data: any) {
        return prisma.note.updateMany({ where: { id: noteId, userId }, data });
    }

    static async deleteNote(noteId: string, userId: string) {
        await prisma.note.updateMany({ where: { id: noteId, userId }, data: { deletedAt: new Date() } });
        return { message: 'Đã xoá.' };
    }
}
