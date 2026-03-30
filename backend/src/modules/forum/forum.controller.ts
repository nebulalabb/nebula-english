import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/authGuard.middleware';
import prisma from '../../config/prisma';
import logger from '../../config/logger';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.forumCategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: { select: { posts: true } }
            }
        });
        res.json(categories);
    } catch (error) {
        logger.error('Error in getCategories: ' + error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPosts = async (req: Request, res: Response) => {
    try {
        const { category, search, sort = 'latest', page = 1, limit = 15 } = req.query;

        const where: any = { deletedAt: null };
        if (category) where.categoryId = String(category);
        if (search) {
            where.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { content: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'popular') orderBy = { viewCount: 'desc' };
        if (sort === 'unanswered') orderBy = { comments: { _count: 'asc' } };

        const posts = await prisma.forumPost.findMany({
            where,
            orderBy: [
                { isPinned: 'desc' },
                orderBy
            ],
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            include: {
                author: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
                category: { select: { id: true, name: true, color: true } },
                _count: { select: { comments: true, likes: true } }
            }
        });

        const total = await prisma.forumPost.count({ where });

        res.json({
            data: posts,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        logger.error('Error in getPosts: ' + error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPostDetail = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Increment view count
        await prisma.forumPost.update({
            where: { id: id as string },
            data: { viewCount: { increment: 1 } }
        });

        const post = await prisma.forumPost.findUnique({
            where: { id: id as string },
            include: {
                author: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
                category: true,
                comments: {
                    where: { parentId: null, deletedAt: null },
                    orderBy: { createdAt: 'asc' },
                    include: {
                        author: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
                        replies: {
                            where: { deletedAt: null },
                            orderBy: { createdAt: 'asc' },
                            include: {
                                author: { select: { id: true, fullName: true, avatarUrl: true, role: true } }
                            }
                        }
                    }
                },
                _count: { select: { likes: true } }
            }
        });

        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Check if current user liked it
        let userLiked = false;
        if (req.user?.id) {
            const like = await prisma.postLike.findUnique({
                where: { userId_postId: { userId: req.user.id, postId: post.id } }
            });
            userLiked = !!like;
        }

        res.json({ ...post, userLiked });
    } catch (error) {
        logger.error('Error in getPostDetail: ' + error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, categoryId } = req.body;
        const userId = req.user!.id;

        if (!title || !content || !categoryId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const post = await prisma.forumPost.create({
            data: {
                title,
                content,
                categoryId,
                authorId: userId
            },
            include: {
                author: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
                category: { select: { id: true, name: true, color: true } }
            }
        });

        res.status(201).json(post);
    } catch (error) {
        logger.error('Error in createPost: ' + error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const toggleLike = async (req: AuthRequest, res: Response) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user!.id;

        const existingLik = await prisma.postLike.findUnique({
            where: { userId_postId: { userId: userId as string, postId: postId as string } }
        });

        if (existingLik) {
            await prisma.postLike.delete({ where: { id: existingLik.id } });
            await prisma.forumPost.update({
                where: { id: postId as string },
                data: { upvotes: { decrement: 1 } }
            });
            res.json({ liked: false });
        } else {
            await prisma.postLike.create({
                data: { userId: userId as string, postId: postId as string }
            });
            await prisma.forumPost.update({
                where: { id: postId as string },
                data: { upvotes: { increment: 1 } }
            });
            res.json({ liked: true });
        }
    } catch (error) {
        logger.error('Error in toggleLike: ' + error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createComment = async (req: AuthRequest, res: Response) => {
    try {
        const { id: postId } = req.params;
        const { content, parentId } = req.body;
        const userId = req.user!.id;

        if (!content) return res.status(400).json({ error: 'Content is required' });

        const comment = await prisma.forumComment.create({
            data: {
                content,
                postId: postId as string,
                authorId: userId as string,
                parentId: parentId || null
            },
            include: {
                author: { select: { id: true, fullName: true, avatarUrl: true, role: true } }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        logger.error('Error in createComment: ' + error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
