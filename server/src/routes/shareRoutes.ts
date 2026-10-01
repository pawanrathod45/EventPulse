import { Router } from 'express';
import {
  generateShareLink,
  resolveShareLink,
  generateShareSchema,
} from '../controllers/shareController.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.post('/generate', validateBody(generateShareSchema), generateShareLink);
router.get('/:token', resolveShareLink);

export default router;
