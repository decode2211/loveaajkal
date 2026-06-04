import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getTrip, addTripItem, updateTripItem, deleteTripItem } from '../controllers/trip.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', getTrip);
router.post('/', addTripItem);
router.put('/:id', updateTripItem);
router.delete('/:id', deleteTripItem);

export default router;
