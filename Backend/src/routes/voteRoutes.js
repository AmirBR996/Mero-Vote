import express from 'express';
import { castVote, getUserVotes, getElectionResults } from '../controller/vote_controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, castVote);
router.get('/my', authenticateToken, getUserVotes);
router.get('/results/:electionId', authenticateToken, getElectionResults);

export default router;
