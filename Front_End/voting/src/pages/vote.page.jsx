import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/header/Navbar";
import { useAuth } from "../context/AuthContext";
import { getElectionById } from "../api/elections.api";
import { castVote, getMyVotes } from "../api/votes.api";
import FaceVerify from "../components/FaceVerify";

const VotePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showFaceVerify, setShowFaceVerify] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [casting, setCasting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [electionRes, votesRes] = await Promise.all([
          getElectionById(id),
          getMyVotes(),
        ]);
        console.log("Election Response:", electionRes);
        setElection(electionRes?.data);
        setCandidates(electionRes?.data?.candidates || []);
        console.log("Candidates set to:", electionRes?.data?.candidates);

        // Check if already voted
        const myVotes = votesRes?.data || [];
        const votedInThisElection = myVotes.some((v) => v.electionId === parseInt(id));
        setAlreadyVoted(votedInThisElection);
      } catch (err) {
        console.error("Load error:", err);
        toast.error("Failed to load election data");
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Get face descriptor from stored user
  const getFaceDescriptor = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    let faceDesc = storedUser.faceDescriptor;
    if (faceDesc && typeof faceDesc === "string") {
      try { faceDesc = JSON.parse(faceDesc); } catch { faceDesc = null; }
    }
    return (faceDesc && Array.isArray(faceDesc) && faceDesc.length > 0) ? faceDesc : null;
  };

  const handleVoteClick = () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate first");
      return;
    }

    const faceDesc = getFaceDescriptor();
    if (!faceDesc) {
      toast.error("Face verification data not found. Please register with face verification.");
      return;
    }

    // Face verification is mandatory
    setShowFaceVerify(true);
  };

  const submitVote = async () => {
    try {
      setCasting(true);
      const r = await castVote({ candidateId: selectedCandidate, electionId: parseInt(id) });
      if (r.success) {
        setVoteSuccess(true);
        toast.success("Vote cast successfully! 🎉");
      } else {
        toast.error(r.message || "Failed to cast vote");
      }
    } catch (err) {
      if (err.message?.includes("already voted")) {
        setAlreadyVoted(true);
      }
      toast.error(err.message || "Failed to cast vote");
    }
    setCasting(false);
  };

  const handleFaceVerified = () => {
    setShowFaceVerify(false);
    submitVote();
  };

  const handleFaceVerifyCancel = () => {
    setShowFaceVerify(false);
    toast.info("Face verification is required to vote. Please try again.");
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg)] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[var(--nepal-red)] border-t-transparent rounded-full mx-auto" style={{ animation: "spin 1s linear infinite" }} />
            <p className="text-[var(--text-muted)]">Loading election...</p>
          </div>
        </div>
      </div>
    );
  }

  // Vote success screen
  if (voteSuccess) {
    return (
      <div className="bg-[var(--bg)] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="glass-card p-10 text-center max-w-md animate-fade-in-up">
            <div className="text-7xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-white mb-3">भोट सफल!</h2>
            <p className="text-[var(--nepal-red)] text-sm uppercase tracking-wider mb-2">Vote Successful</p>
            <p className="text-[var(--text-muted)] mb-6">
              Your vote has been securely recorded. Thank you for participating in Nepal's democracy!
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/results")} className="btn-blue py-3 px-6 text-sm">📊 View Results</button>
              <button onClick={() => navigate("/elections")} className="btn-secondary py-3 px-6 text-sm">← Back to Elections</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Already voted screen
  if (alreadyVoted) {
    return (
      <div className="bg-[var(--bg)] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="glass-card p-10 text-center max-w-md animate-fade-in-up">
            <div className="text-7xl mb-4">🗳️</div>
            <h2 className="text-2xl font-bold text-white mb-3">Already Voted</h2>
            <p className="text-[var(--text-muted)] mb-6">
              You have already cast your vote in this election. Each citizen can only vote once per election.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate(`/results?election=${id}`)} className="btn-blue py-3 px-6 text-sm">📊 View Results</button>
              <button onClick={() => navigate("/elections")} className="btn-secondary py-3 px-6 text-sm">← Elections</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] text-[var(--text-primary)] min-h-screen">
      <Navbar />

      {showFaceVerify && (
        <FaceVerify
          storedDescriptor={getFaceDescriptor() || []}
          onVerified={handleFaceVerified}
          onCancel={handleFaceVerifyCancel}
        />
      )}

      <section className="pt-28 pb-20 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          {/* Election Header */}
          <div className="mb-10 animate-fade-in-up">
            <button onClick={() => navigate("/elections")} className="text-[var(--text-muted)] text-sm hover:text-[var(--nepal-red)] transition mb-4 inline-block">
              ← Back to Elections
            </button>
            <div className="flex items-center gap-3 mb-3">
              <span className="badge-nepal badge-ongoing">🟢 ONGOING</span>
              <span className="text-xs text-[var(--text-muted)] bg-white/5 px-2 py-1 rounded">{election?.type}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{election?.title}</h1>
            <p className="text-[var(--text-muted)] text-sm">{election?.description}</p>
          </div>

          {/* Instruction */}
          <div className="glass-card p-4 mb-8 flex items-center gap-3 border-[var(--nepal-gold)]/20">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-sm font-medium text-white">Select your candidate, then verify your identity</p>
              <p className="text-xs text-[var(--text-muted)]">Face verification is required before your vote is submitted</p>
            </div>
          </div>

          {/* Candidates Grid */}
          {candidates.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎤</div>
              <p className="text-[var(--text-muted)]">No candidates registered for this election yet.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {candidates.map((candidate, idx) => (
                  <div
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className={`glass-card p-5 cursor-pointer transition-all duration-300 ${
                      selectedCandidate === candidate.id
                        ? "border-[var(--nepal-red)] ring-2 ring-[var(--nepal-red)]/30 scale-[1.02]"
                        : "hover:border-white/20"
                    }`}
                    style={{ animation: `fadeInUp ${0.3 + idx * 0.1}s ease-out` }}
                  >
                    {selectedCandidate === candidate.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--nepal-red)] flex items-center justify-center text-white text-xs">✓</div>
                    )}

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--bg-card)] flex-shrink-0">
                        {candidate.photoUrl ? (
                          <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{candidate.name}</h3>
                        <p className="text-[var(--nepal-red)] text-sm font-medium">{candidate.party}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
                      <span className="bg-white/5 px-2 py-1 rounded">{candidate.position}</span>
                      <span>📍 {candidate.district}</span>
                    </div>

                    {candidate.bio && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2">{candidate.bio}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Vote */}
              <div className="glass-card p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {selectedCandidate
                      ? `Selected: ${candidates.find((c) => c.id === selectedCandidate)?.name || ""}`
                      : "Select a candidate to proceed"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Your vote is anonymous and secure</p>
                </div>
                <button
                  onClick={handleVoteClick}
                  disabled={!selectedCandidate || casting}
                  className="btn-primary py-3 px-8 text-sm"
                >
                  {casting ? "Submitting..." : "🔐 Verify & Vote"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default VotePage;
