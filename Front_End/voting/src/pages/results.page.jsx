import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/header/Navbar";
import Footer from "../components/header/Footer";
import { getElections } from "../api/elections.api";
import { getElectionResults } from "../api/votes.api";

const ResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(searchParams.get("election") || "");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    const loadElections = async () => {
      try {
        const r = await getElections();
        setElections(r?.data || []);
      } catch { }
      setLoading(false);
    };
    loadElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      loadResults(selectedElection);
    }
  }, [selectedElection]);

  const loadResults = async (electionId) => {
    setResultsLoading(true);
    try {
      const r = await getElectionResults(electionId);
      setResults(r?.data);
    } catch {
      setResults(null);
    }
    setResultsLoading(false);
  };

  const maxVotes = results?.candidates?.length > 0
    ? Math.max(...results.candidates.map((c) => c.voteCount || 0))
    : 0;

  return (
    <div className="bg-[var(--bg)] text-[var(--text-primary)] min-h-screen">
      <Navbar />

      <section className="pt-28 pb-20 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10" style={{ animation: "fadeInUp 0.6s ease-out" }}>
            <p className="text-[var(--nepal-red)] text-xs uppercase tracking-[0.3em] font-semibold mb-2">नतिजाहरू</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Election Results</h1>
            <p className="text-[var(--text-muted)] text-sm">View live vote counts and results for all elections.</p>
          </div>

          {/* Election Selector */}
          <div className="glass-card p-5 mb-8">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Select Election</label>
            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="select-nepal"
            >
              <option value="">Choose an election</option>
              {elections.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.status})
                </option>
              ))}
            </select>
          </div>

          {/* Results Display */}
          {!selectedElection ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Select an Election</h3>
              <p className="text-[var(--text-muted)] text-sm">Choose an election from the dropdown to view results.</p>
            </div>
          ) : resultsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[var(--nepal-red)] border-t-transparent rounded-full" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : results ? (
            <div className="space-y-6 animate-fade-in-up">
              {/* Summary Card */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{results.election?.title}</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{results.election?.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold gradient-text">{results.totalVotes}</div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Total Votes</p>
                  </div>
                </div>
              </div>

              {/* Candidates Results */}
              {results.candidates?.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[var(--text-muted)]">No candidates or votes recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.candidates?.map((candidate, idx) => {
                    const percentage = results.totalVotes > 0
                      ? ((candidate.voteCount / results.totalVotes) * 100).toFixed(1)
                      : 0;
                    const isWinner = idx === 0 && candidate.voteCount > 0;

                    return (
                      <div
                        key={candidate.id}
                        className={`glass-card p-5 transition-all ${isWinner ? "border-[var(--nepal-gold)]/40 ring-1 ring-[var(--nepal-gold)]/20" : ""}`}
                        style={{ animation: `fadeInUp ${0.3 + idx * 0.1}s ease-out` }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            idx === 0 ? "bg-[var(--nepal-gold)]/20 text-[var(--nepal-gold)]" :
                            idx === 1 ? "bg-gray-400/10 text-gray-400" :
                            idx === 2 ? "bg-orange-700/10 text-orange-600" :
                            "bg-white/5 text-[var(--text-muted)]"
                          }`}>
                            {idx === 0 ? "🏆" : `#${idx + 1}`}
                          </div>

                          {/* Photo */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--bg-card)] flex-shrink-0">
                            {candidate.photoUrl ? (
                              <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white">{candidate.name}</h3>
                              {isWinner && <span className="text-xs bg-[var(--nepal-gold)]/15 text-[var(--nepal-gold)] px-2 py-0.5 rounded-full">Leading</span>}
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">{candidate.party} • {candidate.position} • 📍 {candidate.district}</p>

                            {/* Vote bar */}
                            <div className="mt-3 h-2.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                  width: `${percentage}%`,
                                  background: idx === 0
                                    ? "linear-gradient(90deg, var(--nepal-gold), #f59e0b)"
                                    : idx === 1
                                    ? "linear-gradient(90deg, #9ca3af, #6b7280)"
                                    : "linear-gradient(90deg, var(--nepal-blue), #3b82f6)",
                                }}
                              />
                            </div>
                          </div>

                          {/* Vote count */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl font-bold text-white">{candidate.voteCount}</div>
                            <div className="text-xs text-[var(--text-muted)]">{percentage}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-[var(--text-muted)]">Failed to load results for this election.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ResultsPage;
