import { Router } from 'express';
import { login, refresh, me, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authMiddleware, me);
router.post('/logout', logout);

export default router;
