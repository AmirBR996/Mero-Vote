import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { candidates } from "../db/schema.js";

export const createCandidate = async (req, res) => {
    try{
        const {name , party , position , district , photoUrl , bio , electionId} = req.body;

        if(!name || !party || !position || !district || !photoUrl || !bio || !electionId){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const [candidate] = await db
        .insert(candidates)
        .values({
            name,
            party,
            position,
            district,
            photoUrl,
            bio,
            electionId: parseInt(electionId),
            voteCount: 0
        })
        .returning();

        return res.status(201).json({
            success: true,
            message: "Candidate created successfully",
            data: candidate
        }); 
    }catch(error){
        console.error("Error creating candidate:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create candidate",
            error: error.message
        });
    }
};

export const deleteCandidate = async (req, res) => {
    try{
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid candidate id"
            });
        }
        
        const candidate = await db
        .delete(candidates)
        .where(eq(candidates.id, id))
        .returning();
        if(candidate.length === 0){
            return res.status(404).json({
                success: false,
                message: "Candidate not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "Candidate deleted successfully",
            data: candidate[0]
        });
    }
    catch(error){
        console.error("Error deleting candidate:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete candidate",
            error: error.message
        });
    }
};

export const updateCandidate = async (req, res) => {
    try{
        const id = Number(req.params.id);
        const {name , party , position , district , photoUrl , bio , electionId} = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid candidate id"
            });
        }
        
        if(!name || !party || !position || !district || !photoUrl || !bio || !electionId){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        
        const [candidate] = await db
        .update(candidates)
        .set({
            name,
            party,
            position,
            district,
            photoUrl,
            bio,
            electionId: parseInt(electionId),
            updatedAt: new Date()
        })
        .where(eq(candidates.id, id))
        .returning();
        
        if(!candidate){
            return res.status(404).json({
                success: false,
                message: "Candidate not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "Candidate updated successfully",
            data: candidate
        });
    }
    catch(error){
        console.error("Error updating candidate:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update candidate",
            error: error.message
        });
    }
};

export const getCandidates = async (req, res) => {
    try{
        const candidatesList = await db
        .select()
        .from(candidates);
        
        return res.status(200).json
        ({
            success: true,
            message: "Candidates retrieved successfully",
            data: candidatesList
        });
    }
    catch(error){
        console.error("Error retrieving candidates:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve candidates",
            error: error.message
        });
    }
};

export const getCandidatesByElection = async (req, res) => {
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
};