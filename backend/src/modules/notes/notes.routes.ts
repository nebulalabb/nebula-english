import { Router } from 'express';
import { NotesController } from './notes.controller';
import { requireAuth } from '../../middleware/authGuard.middleware';
import { quotaGuard } from '../../middleware/quota.middleware';

const router = Router();

router.post('/summarize', requireAuth as any, quotaGuard('note') as any, NotesController.summarize as any);
router.get('/', requireAuth as any, NotesController.getNotes as any);
router.get('/:note_id', requireAuth as any, NotesController.getNoteDetail as any);
router.patch('/:note_id', requireAuth as any, NotesController.updateNote as any);
router.delete('/:note_id', requireAuth as any, NotesController.deleteNote as any);

export default router;
