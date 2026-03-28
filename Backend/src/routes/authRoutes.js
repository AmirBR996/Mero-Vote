import express from 'express';
import {login  , register , updateProfile} from '../controller/auth_controller.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.put('/update-profile', authenticateToken, updateProfile);

export default router;
