import express from 'express';
import {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
} from '../controller/election_controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// Public routes (authenticated users can view elections)
router.get('/', authenticateToken, getElections);
router.get('/:id', authenticateToken, getElectionById);

// Admin-only routes
router.post('/', adminMiddleware, createElection);
router.put('/:id', adminMiddleware, updateElection);
router.delete('/:id', adminMiddleware, deleteElection);

export default router;
