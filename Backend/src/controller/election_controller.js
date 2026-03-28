import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { elections, candidates, electionCandidates } from "../db/schema.js";

export const getElections = async (req, res) => {
  try {
    const electionsList = await db.select().from(elections);
    return res.status(200).json({
      success: true,
      message: "Elections retrieved successfully",
      data: electionsList,
    });
  } catch (error) {
    console.error("Error retrieving elections:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve elections",
      error: error.message,
    });
  }
};

export const getElectionById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid election id" });
    }

    const electionResult = await db.select().from(elections).where(eq(elections.id, id));
    if (electionResult.length === 0) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    // Get candidates for this election
    const electionCandidatesList = await db
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
      .where(eq(candidates.electionId, id));

    return res.status(200).json({
      success: true,
      data: {
        ...electionResult[0],
        candidates: electionCandidatesList,
      },
    });
  } catch (error) {
    console.error("Error retrieving election:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve election",
      error: error.message,
    });
  }
};

export const createElection = async (req, res) => {
  try {
    const { title, description, type, status, startDate, endDate } = req.body;

    if (!title || !description || !type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Title, description, type, startDate, and endDate are required",
      });
    }

    const [election] = await db
      .insert(elections)
      .values({
        title,
        description,
        type,
        status: status || "UPCOMING",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: election,
    });
  } catch (error) {
    console.error("Error creating election:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create election",
      error: error.message,
    });
  }
};

export const updateElection = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, type, status, startDate, endDate } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid election id" });
    }

    if (!title || !description || !type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const [election] = await db
      .update(elections)
      .set({
        title,
        description,
        type,
        status: status || "UPCOMING",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        updatedAt: new Date(),
      })
      .where(eq(elections.id, id))
      .returning();

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Election updated successfully",
      data: election,
    });
  } catch (error) {
    console.error("Error updating election:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update election",
      error: error.message,
    });
  }
};

export const deleteElection = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid election id" });
    }

    const [election] = await db
      .delete(elections)
      .where(eq(elections.id, id))
      .returning();

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Election deleted successfully",
      data: election,
    });
  } catch (error) {
    console.error("Error deleting election:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete election",
      error: error.message,
    });
  }
};
