import express from 'express';
import { getCandidates, createCandidate, updateCandidate, deleteCandidate, getCandidatesByElection } from '../controller/candidate_controller.js';
import { adminMiddleware } from '../middleware/admin.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/election/:electionId', authenticateToken, getCandidatesByElection);

router.get('/', adminMiddleware, getCandidates);
router.post('/', adminMiddleware, createCandidate);
router.put('/:id', adminMiddleware, updateCandidate);
router.delete('/:id', adminMiddleware, deleteCandidate);

export default router;