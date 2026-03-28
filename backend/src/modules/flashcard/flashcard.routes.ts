import { Router } from 'express';
import { FlashcardController } from './flashcard.controller';
import { requireAuth } from '../../middleware/authGuard.middleware';
import { quotaGuard } from '../../middleware/quota.middleware';

const router = Router();

router.get('/sets', requireAuth as any, FlashcardController.getSets as any);
router.post('/sets/generate/text', requireAuth as any, quotaGuard('flashcard') as any, FlashcardController.generateFromText as any);
router.post('/sets', requireAuth as any, FlashcardController.createManual as any);
router.get('/sets/:set_id', requireAuth as any, FlashcardController.getSetDetail as any);
router.patch('/sets/:set_id', requireAuth as any, FlashcardController.updateSet as any);
router.delete('/sets/:set_id', requireAuth as any, FlashcardController.deleteSet as any);
router.get('/review/due', requireAuth as any, FlashcardController.getDueCards as any);
router.post('/review/submit', requireAuth as any, FlashcardController.submitReviews as any);

export default router;
