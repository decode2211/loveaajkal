import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getTodayQuestion, submitAnswer, getHistory } from '../controllers/quiz.controller';

const router = Router();
router.use(authMiddleware);

router.get('/today', getTodayQuestion);
router.post('/answer', submitAnswer);
router.get('/history', getHistory);

export default router;
