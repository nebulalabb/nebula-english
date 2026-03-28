import { Request, Response, NextFunction } from 'express';
import { NotesService } from './notes.service';
import { AuthRequest } from '../../middleware/authGuard.middleware';

const ok = (res: Response, data: any, status = 200) =>
    res.status(status).json({ success: true, data });

export class NotesController {
    static async summarize(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await NotesService.summarize(req.user!.id, req.body);
            if ((req as any).incrementQuota) await (req as any).incrementQuota(0, 'summarize');
            ok(res, { ...result, meta: { quotaRemaining: (req as any).quotaRemaining } }, 201);
        } catch (e) { next(e); }
    }

    static async getNotes(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string | undefined;
            ok(res, await NotesService.getNotes(req.user!.id, { page, limit, search }));
        } catch (e) { next(e); }
    }

    static async getNoteDetail(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            ok(res, await NotesService.getNoteDetail(req.params.note_id as string, req.user!.id));
        } catch (e) { next(e); }
    }

    static async updateNote(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await NotesService.updateNote(req.params.note_id as string, req.user!.id, req.body);
            ok(res, { message: 'Đã cập nhật.' });
        } catch (e) { next(e); }
    }

    static async deleteNote(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            ok(res, await NotesService.deleteNote(req.params.note_id as string, req.user!.id));
        } catch (e) { next(e); }
    }
}
