import express from 'express';
import { getCandidates, createCandidate, updateCandidate, deleteCandidate } from '../controller/candidate_controller.js';
import { adminMiddleware } from '../middleware/admin.js';
import { authenticateToken } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { candidates } from '../db/schema.js';

const router = express.Router();

// Public route - get candidates by election (for voters)
router.get('/election/:electionId', authenticateToken, async (req, res) => {
  try {
    const electionId = Number(req.params.electionId);
    if (!Number.isInteger(electionId) || electionId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid election id" });
    }

    const candidatesList = await db
      .select()
      .from(candidates)
      .where(eq(candidates.electionId, electionId));

    return res.status(200).json({
      success: true,
      data: candidatesList,
    });
  } catch (error) {
    console.error("Error retrieving candidates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve candidates",
      error: error.message,
    });
  }
});

// Admin routes
router.get('/', adminMiddleware, getCandidates);
router.post('/', adminMiddleware, createCandidate);
router.put('/:id', adminMiddleware, updateCandidate);
router.delete('/:id', adminMiddleware, deleteCandidate);

export default router;