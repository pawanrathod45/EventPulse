import { Router } from 'express';
import {
  createRSVP,
  getRSVPsByUser,
  cancelRSVP,
  createRsvpSchema,
} from '../controllers/rsvpController.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.post('/', validateBody(createRsvpSchema), createRSVP);
router.get('/:userId', getRSVPsByUser);
router.delete('/:id', cancelRSVP);

export default router;
