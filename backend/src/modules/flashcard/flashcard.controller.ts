import { Request, Response, NextFunction } from 'express';
import { FlashcardService } from './flashcard.service';
import { AuthRequest } from '../../middleware/authGuard.middleware';

const ok = (res: Response, data: any, status = 200) =>
    res.status(status).json({ success: true, data });

export class FlashcardController {
    static async getSets(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string || '1');
            const limit = parseInt(req.query.limit as string || '20');
            ok(res, await FlashcardService.getSets(req.user!.id, { page, limit }));
        } catch (e) { next(e); }
    }

    static async generateFromText(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await FlashcardService.generateFromText(req.user!.id, req.body);
            if ((req as any).incrementQuota) await (req as any).incrementQuota(0, 'generate');
            ok(res, { ...result, meta: { quotaRemaining: (req as any).quotaRemaining } }, 201);
        } catch (e) { next(e); }
    }

    static async createManual(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            ok(res, await FlashcardService.createManual(req.user!.id, req.body), 201);
        } catch (e) { next(e); }
    }

    static async getSetDetail(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            ok(res, await FlashcardService.getSetDetail(req.params.set_id as string, req.user!.id));
        } catch (e) { next(e); }
    }

    static async updateSet(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await FlashcardService.updateSet(req.params.set_id as string, req.user!.id, req.body);
            ok(res, { message: 'Đã cập nhật.' });
        } catch (e) { next(e); }
    }

    static async deleteSet(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            ok(res, await FlashcardService.deleteSet(req.params.set_id as string, req.user!.id));
        } catch (e) { next(e); }
    }

    static async getDueCards(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            ok(res, await FlashcardService.getDueCards(req.user!.id));
        } catch (e) { next(e); }
    }

    static async submitReviews(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            ok(res, await FlashcardService.submitReviews(req.user!.id, req.body.reviews));
        } catch (e) { next(e); }
    }
}
