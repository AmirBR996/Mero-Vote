import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { votes, candidates, elections, users } from "../db/schema.js";

export const castVote = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { candidateId, electionId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!candidateId || !electionId) {
      return res.status(400).json({
        success: false,
        message: "candidateId and electionId are required",
      });
    }

    // Check election exists and is ONGOING
    const electionResult = await db
      .select()
      .from(elections)
      .where(eq(elections.id, parseInt(electionId)));

    if (electionResult.length === 0) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    if (electionResult[0].status !== "ONGOING") {
      return res.status(400).json({
        success: false,
        message: "This election is not currently accepting votes",
      });
    }

    // Check candidate exists and belongs to this election
    const candidateResult = await db
      .select()
      .from(candidates)
      .where(
        and(
          eq(candidates.id, parseInt(candidateId)),
          eq(candidates.electionId, parseInt(electionId))
        )
      );

    if (candidateResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found in this election",
      });
    }

    // Check user hasn't already voted in this election
    const existingVote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, userId),
          eq(votes.electionId, parseInt(electionId))
        )
      );

    if (existingVote.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already voted in this election",
      });
    }

    // Cast the vote
    const [vote] = await db
      .insert(votes)
      .values({
        userId,
        candidateId: parseInt(candidateId),
        electionId: parseInt(electionId),
      })
      .returning();

    // Increment candidate vote count
    await db
      .update(candidates)
      .set({
        voteCount: sql`${candidates.voteCount} + 1`,
      })
      .where(eq(candidates.id, parseInt(candidateId)));

    return res.status(201).json({
      success: true,
      message: "Vote cast successfully!",
      data: vote,
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "You have already voted in this election",
      });
    }
    console.error("Error casting vote:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cast vote",
      error: error.message,
    });
  }
};

export const getUserVotes = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userVotes = await db
      .select({
        id: votes.id,
        electionId: votes.electionId,
        candidateId: votes.candidateId,
        createdAt: votes.createdAt,
        electionTitle: elections.title,
        candidateName: candidates.name,
        candidateParty: candidates.party,
      })
      .from(votes)
      .innerJoin(elections, eq(votes.electionId, elections.id))
      .innerJoin(candidates, eq(votes.candidateId, candidates.id))
      .where(eq(votes.userId, userId));

    return res.status(200).json({
      success: true,
      data: userVotes,
    });
  } catch (error) {
    console.error("Error retrieving user votes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve votes",
      error: error.message,
    });
  }
};

export const getElectionResults = async (req, res) => {
  try {
    const electionId = Number(req.params.electionId);
    if (!Number.isInteger(electionId) || electionId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid election id" });
    }

    // Get election info
    const electionResult = await db
      .select()
      .from(elections)
      .where(eq(elections.id, electionId));

    if (electionResult.length === 0) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    // Get candidates with vote counts
    const resultsData = await db
      .select({
        id: candidates.id,
        name: candidates.name,
        party: candidates.party,
        position: candidates.position,
        district: candidates.district,
        photoUrl: candidates.photoUrl,
        bio: candidates.bio,
        voteCount: candidates.voteCount,
      })
      .from(candidates)
      .where(eq(candidates.electionId, electionId))
      .orderBy(sql`${candidates.voteCount} DESC`);

    const totalVotes = resultsData.reduce((sum, c) => sum + (c.voteCount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        election: electionResult[0],
        candidates: resultsData,
        totalVotes,
      },
    });
  } catch (error) {
    console.error("Error retrieving election results:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve results",
      error: error.message,
    });
  }
};
