import express from 'express';
import { castVote, getUserVotes, getElectionResults } from '../controller/vote_controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Cast a vote (authenticated voters)
router.post('/', authenticateToken, castVote);

// Get current user's vote history
router.get('/my', authenticateToken, getUserVotes);

// Get election results (authenticated users)
router.get('/results/:electionId', authenticateToken, getElectionResults);

export default router;
