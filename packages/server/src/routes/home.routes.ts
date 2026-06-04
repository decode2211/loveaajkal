import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getHomeConfig, updateCountdown } from '../controllers/home.controller';

const router = Router();
router.use(authMiddleware);

router.get('/config', getHomeConfig);
router.put('/countdown', updateCountdown);

export default router;
