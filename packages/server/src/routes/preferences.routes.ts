import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getPreferences, setPreference,
  logMissMeter, getLatestMissMeters, getMissMeterHistory,
} from '../controllers/preferences.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', getPreferences);

// Miss-meter routes MUST come before /:questionId
router.post('/miss-meter', logMissMeter);
router.get('/miss-meter/latest', getLatestMissMeters);
router.get('/miss-meter/history', getMissMeterHistory);

router.post('/:questionId', setPreference);

export default router;