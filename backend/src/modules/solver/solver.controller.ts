import { Request, Response, NextFunction } from 'express';
import { SolverService } from './solver.service';
import { AuthRequest } from '../../middleware/authGuard.middleware';

const ok = (res: Response, data: any, status = 200) =>
    res.status(status).json({ success: true, data });

export class SolverController {
    static async solve(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await SolverService.solve({ ...req.body, userId: req.user!.id });
            if ((req as any).incrementQuota) await (req as any).incrementQuota(0, 'solve');
            ok(res, { ...result, meta: { quotaRemaining: (req as any).quotaRemaining } });
        } catch (e) { next(e); }
    }

    static async solveImage(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const imageUrl = (req as any).file?.path || req.body.image_url;
            const result = await SolverService.solveImage({
                imageUrl, subject: req.body.subject, level: req.body.level, userId: req.user!.id,
            });
            if ((req as any).incrementQuota) await (req as any).incrementQuota(0, 'solve_image');
            ok(res, result);
        } catch (e) { next(e); }
    }

    static async followUp(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const history_id = req.params.history_id as string;
            const result = await SolverService.followUp(history_id, req.body.question, req.user!.id);
            ok(res, result);
        } catch (e) { next(e); }
    }

    static async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const subject = req.query.subject as string | undefined;
            const result = await SolverService.getHistory(req.user!.id, { page, limit, subject });
            ok(res, result);
        } catch (e) { next(e); }
    }

    static async getHistoryDetail(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await SolverService.getHistoryDetail(req.params.history_id as string, req.user!.id);
            ok(res, result);
        } catch (e) { next(e); }
    }

    static async deleteHistory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await SolverService.deleteHistory(req.params.history_id as string, req.user!.id);
            ok(res, result);
        } catch (e) { next(e); }
    }
}
