import { Router } from 'express';
import { SolverController } from './solver.controller';
import { requireAuth } from '../../middleware/authGuard.middleware';
import { quotaGuard } from '../../middleware/quota.middleware';

const router = Router();

router.post('/solve', requireAuth as any, quotaGuard('solver') as any, SolverController.solve as any);
router.post('/solve/image', requireAuth as any, quotaGuard('solver') as any, SolverController.solveImage as any);
router.post('/:history_id/followup', requireAuth as any, SolverController.followUp as any);
router.get('/history', requireAuth as any, SolverController.getHistory as any);
router.get('/history/:history_id', requireAuth as any, SolverController.getHistoryDetail as any);
router.delete('/history/:history_id', requireAuth as any, SolverController.deleteHistory as any);

export default router;
