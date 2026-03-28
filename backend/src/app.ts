import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/error.middleware';
import logger from './config/logger';

// ─── Routes mới (NebulaLab spec) ─────────────────────────────────────────────
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import solverRoutes from './modules/solver/solver.routes';
import flashcardRoutes from './modules/flashcard/flashcard.routes';
import notesRoutes from './modules/notes/notes.routes';
import forumRoutes from './modules/forum/forum.routes';

const app = express();
const port = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
app.use('/api', apiLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
const v1 = '/api/v1';
app.use(`${v1}/auth`, authRoutes);
app.use(`${v1}/user`, userRoutes);
app.use(`${v1}/solver`, solverRoutes);
app.use(`${v1}/flashcard`, flashcardRoutes);
app.use(`${v1}/note`, notesRoutes);
app.use(`${v1}/forum`, forumRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'ok', service: 'NebulaLab API', version: '1.0' }));
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(port, () => logger.info(`NebulaLab Backend listening at http://localhost:${port}`));

export default app;
