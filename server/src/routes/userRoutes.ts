import { Router } from 'express';
import { getUsers, getUserById, updateReminders } from '../controllers/userController.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/reminders', updateReminders);

export default router;
