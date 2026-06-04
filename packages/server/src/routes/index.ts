import { Router } from 'express';
import authRoutes from './auth.routes';
import homeRoutes from './home.routes';
import quizRoutes from './quiz.routes';
import timelineRoutes from './timeline.routes';
import preferencesRoutes from './preferences.routes';
import watchlistRoutes from './watchlist.routes';
import tripRoutes from './trip.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/home', homeRoutes);
router.use('/quiz', quizRoutes);
router.use('/timeline', timelineRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/trip', tripRoutes);

export default router;
