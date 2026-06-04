import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  getTimeline, createEvent, updateEvent, deleteEvent, uploadPhotos, deletePhoto,
} from '../controllers/timeline.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', getTimeline);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/photos', upload.array('photos', 10), uploadPhotos);
router.delete('/:id/photos/:photoId', deletePhoto);

export default router;
