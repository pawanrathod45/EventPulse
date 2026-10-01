import { Router } from 'express';
import { getEvents, getFriendsCount } from '../controllers/eventController.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id/friends-count', getFriendsCount);

export default router;
