import { Router } from 'express';
import authRoutes from './auth/auth.routes';
import userRoutes from './users/user.routes';
import solverRoutes from './solver/solver.routes';
import flashcardRoutes from './flashcard/flashcard.routes';
import notesRoutes from './notes/notes.routes';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/solver', solverRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/notes', notesRoutes);

export default router;
