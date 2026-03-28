import express from 'express';
import { getAllUsers, getUserProfile, getUserById, updateUserProfile, changePassword } from '../controller/user_controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

router.get('/', adminMiddleware, getAllUsers);

router.get('/profile', authenticateToken, getUserProfile);

router.get('/:id', authenticateToken, getUserById);

router.put('/profile', authenticateToken, updateUserProfile);

router.put('/change-password', authenticateToken, changePassword);

export default router;
