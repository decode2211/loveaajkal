import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getWatchlist, addItem, updateItem, deleteItem, submitReview, getReviews,
} from '../controllers/watchlist.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', getWatchlist);
router.post('/', addItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/review', submitReview);
router.get('/:id/reviews', getReviews);

export default router;
