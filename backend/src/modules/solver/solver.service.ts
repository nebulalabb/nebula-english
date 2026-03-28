import prisma from '../../config/prisma';
import { callGeminiText } from '../../lib/gemini';
import { AppError } from '../../middleware/error.middleware';
import crypto from 'crypto';
import redisClient from '../../config/redis';

const SUBJECTS: Record<string, string> = {
    'Toán': 'Math',
    'Lý': 'Physics',
    'Hóa': 'Chemistry',
    'Anh': 'English',
    'Văn': 'Literature',
    'Sinh': 'Biology',
    'Sử': 'History',
    'Địa': 'Geography',
    'Khác': 'General',
};

const LEVELS: Record<string, string> = {
    'thcs': 'THCS (Cấp 2)',
    'thpt': 'THPT (Cấp 3)',
    'dai_hoc': 'Đại học',
    'khac': 'Chung',
};

function buildSolverPrompt(question: string, subject: string, level: string): string {
    return `Bạn là "Nebula AI", một trợ lý ${subject} AI cực kỳ thông minh, xịn xò và thân thiện.
Học sinh đang hỏi bạn một bài toán ở cấp độ: ${LEVELS[level] || level}.
Hãy giải thích thật dễ hiểu, từng bước một như đang chat trực tiếp với người bạn. Sử dụng Markdown và LaTeX cho công thức toán học.

**Yêu cầu định dạng output (chỉ trả về JSON hợp lệ):**
\`\`\`json
{
  "steps": [
    { "step": 1, "title": "Tên bước", "content": "Nội dung", "latex": "LaTeX nếu có" }
  ],
  "conclusion": "Toàn bộ câu trả lời dạng văn bản Markdown chi tiết, sinh động (có emoji). Đây là phần sẽ hiển thị trực tiếp trong khung chat cho user.",
  "formula_used": ["Công thức"]
}
\`\`\`

**Bài toán cần giải:**
${question}

Lưu ý: Chỉ trả về JSON object hợp lệ, không thêm văn bản ngoài. Make sure "conclusion" contains the full detailed rich Markdown response.`;
}

export class SolverService {
    // ─── GIẢI BÀI TEXT ────────────────────────────────────────────────────────
    static async solve(data: {
        question: string;
        subject: string;
        level: string;
        language?: string;
        userId: string;
    }) {
        const { question, subject, level, userId } = data;

        // Check cache: MD5 hash của câu hỏi
        const hash = crypto.createHash('md5').update(question.toLowerCase().trim()).digest('hex');
        const cacheKey = `solve:${hash}`;

        let solution: any = null;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            solution = JSON.parse(cached);
        } else {
            const prompt = buildSolverPrompt(question, subject, level);
            const rawText = await callGeminiText(prompt, true);
            // Extract JSON
            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
            const jsonStr = (jsonMatch[1] || rawText).trim();
            try {
                solution = JSON.parse(jsonStr);
            } catch {
                // Fallback: wrap raw text as single step
                solution = {
                    steps: [{ step: 1, title: 'Lời giải', content: rawText, latex: '' }],
                    conclusion: '',
                    formula_used: [],
                };
            }
            // Cache 24h
            await redisClient.set(cacheKey, JSON.stringify(solution), 'EX', 86400);
        }

        // Lưu history
        const history = await prisma.solveHistory.create({
            data: {
                userId,
                subject,
                gradeLevel: level,
                questionText: question,
                answerText: solution.conclusion || '',
                answerHtml: JSON.stringify(solution),
                modelUsed: 'gemini-1.5-pro',
            },
        });

        return { historyId: history.id, question, subject, solution };
    }

    // ─── GIẢI BÀI ẢNH ────────────────────────────────────────────────────────
    static async solveImage(data: { imageUrl: string; subject: string; level: string; userId: string }) {
        const { imageUrl, subject, level, userId } = data;

        // Dùng Gemini Vision (multimodal)
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = `Bạn là "Nebula AI", trợ lý ${subject} AI thân thiện và xịn xò. Nhận diện câu hỏi trong ảnh và giải thích từng bước dễ hiểu như một đoạn chat bằng Markdown.
Trả về định dạng JSON hợp lệ: { "detected_question": "...", "steps": [...], "conclusion": "Câu trả lời Markdown thu hút, có emoji và phân tích chi tiết. Sẽ hiển thị trong Message UI." }`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: 'image/jpeg', data: imageUrl } },
        ]);
        const text = result.response.text();
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
        const solution = JSON.parse((jsonMatch[1] || text).trim());

        const history = await prisma.solveHistory.create({
            data: {
                userId,
                subject,
                gradeLevel: level,
                questionText: solution.detected_question || '(từ ảnh)',
                questionImageUrl: imageUrl,
                answerText: solution.conclusion || '',
                answerHtml: JSON.stringify(solution),
            },
        });

        return { historyId: history.id, solution };
    }

    // ─── FOLLOW-UP ───────────────────────────────────────────────────────────
    static async followUp(historyId: string, question: string, userId: string) {
        const history = await prisma.solveHistory.findFirst({
            where: { id: historyId, userId },
        });
        if (!history) throw new AppError('Không tìm thấy lịch sử giải bài', 404);

        const prompt = `Dựa trên bài toán: "${history.questionText}" và lời giải trước.
Người dùng hỏi thêm: "${question}"
Hãy trả lời ngắn gọn bằng Markdown, tiếng Việt.`;

        const answer = await callGeminiText(prompt, false);
        return { answer };
    }

    // ─── HISTORY ──────────────────────────────────────────────────────────────
    static async getHistory(userId: string, params: { page: number; limit: number; subject?: string }) {
        const { page, limit, subject } = params;
        const skip = (page - 1) * limit;

        const [histories, total] = await Promise.all([
            prisma.solveHistory.findMany({
                where: { userId, deletedAt: null, ...(subject ? { subject } : {}) },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: { id: true, subject: true, gradeLevel: true, questionText: true, isSaved: true, createdAt: true },
            }),
            prisma.solveHistory.count({ where: { userId, deletedAt: null, ...(subject ? { subject } : {}) } }),
        ]);

        return {
            histories: histories.map(h => ({
                ...h,
                questionPreview: h.questionText.slice(0, 80) + (h.questionText.length > 80 ? '...' : ''),
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    static async getHistoryDetail(historyId: string, userId: string) {
        const h = await prisma.solveHistory.findFirst({ where: { id: historyId, userId, deletedAt: null } });
        if (!h) throw new AppError('Không tìm thấy', 404);
        return h;
    }

    static async deleteHistory(historyId: string, userId: string) {
        await prisma.solveHistory.updateMany({
            where: { id: historyId, userId },
            data: { deletedAt: new Date() },
        });
        return { message: 'Đã xoá.' };
    }
}
