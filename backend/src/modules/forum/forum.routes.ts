import { Router } from 'express';
import { requireAuth } from '../../middleware/authGuard.middleware';
import * as forumController from './forum.controller';

const router = Router();

router.get('/categories', forumController.getCategories);
router.get('/posts', forumController.getPosts);
router.get('/posts/:id', forumController.getPostDetail as any);

// Protected routes
router.use(requireAuth as any);
router.post('/posts', forumController.createPost as any);
router.post('/posts/:id/like', forumController.toggleLike as any);
router.post('/posts/:id/comments', forumController.createComment as any);

export default router;
