import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/header/Navbar";
import Footer from "../components/header/Footer";
import { getElections } from "../api/elections.api";

const ElectionsPage = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const r = await getElections();
        setElections(r?.data || []);
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === "ALL" ? elections : elections.filter((e) => e.status === filter);

  const statusConfig = {
    ONGOING: { badge: "badge-ongoing", label: "🟢 Ongoing", action: "Vote Now", color: "#22c55e" },
    UPCOMING: { badge: "badge-upcoming", label: "🔵 Upcoming", action: "Coming Soon", color: "#60a5fa" },
    COMPLETED: { badge: "badge-completed", label: "🟡 Completed", action: "View Results", color: "#E8A317" },
  };

  const filters = [
    { key: "ALL", label: "All Elections" },
    { key: "ONGOING", label: "🟢 Ongoing" },
    { key: "UPCOMING", label: "🔵 Upcoming" },
    { key: "COMPLETED", label: "🟡 Completed" },
  ];

  return (
    <div className="bg-[var(--bg)] text-[var(--text-primary)] min-h-screen">
      <Navbar />

      <section className="pt-28 pb-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10" style={{ animation: "fadeInUp 0.6s ease-out" }}>
            <p className="text-[var(--nepal-red)] text-xs uppercase tracking-[0.3em] font-semibold mb-2">निर्वाचनहरू</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Elections</h1>
            <p className="text-[var(--text-muted)] text-sm max-w-lg">
              Browse all elections. Cast your vote in ongoing elections or view results of completed ones.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  filter === f.key
                    ? "bg-[var(--nepal-red)] text-white"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white border border-[var(--border-subtle)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Election Grid */}
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-20 mb-4" />
                  <div className="h-6 bg-white/5 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-white/5 rounded w-full mb-2" />
                  <div className="h-4 bg-white/5 rounded w-2/3 mb-6" />
                  <div className="h-10 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🗳️</div>
              <h3 className="text-xl font-semibold text-white mb-2">No elections found</h3>
              <p className="text-[var(--text-muted)] text-sm">
                {filter !== "ALL" ? "No elections match this filter. Try selecting 'All Elections'." : "No elections have been created yet."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((election, idx) => {
                const cfg = statusConfig[election.status] || statusConfig.UPCOMING;
                return (
                  <div
                    key={election.id}
                    className="glass-card p-6 group hover:border-[var(--nepal-red)]/30 transition-all duration-300"
                    style={{ animation: `fadeInUp ${0.3 + idx * 0.1}s ease-out` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`badge-nepal ${cfg.badge}`}>{cfg.label}</span>
                      <span className="text-xs text-[var(--text-muted)] bg-white/5 px-2 py-1 rounded">{election.type}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--nepal-gold)] transition">
                      {election.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{election.description}</p>

                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-5 py-3 border-y border-white/5">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Start</span>
                        <span className="text-white">{new Date(election.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">End</span>
                        <span className="text-white">{new Date(election.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>

                    {election.status === "ONGOING" ? (
                      <Link to={`/elections/${election.id}/vote`} className="btn-primary w-full py-3 text-xs text-center block">
                        🗳️ Vote Now
                      </Link>
                    ) : election.status === "COMPLETED" ? (
                      <Link to={`/results?election=${election.id}`} className="btn-blue w-full py-3 text-xs text-center block">
                        📊 View Results
                      </Link>
                    ) : (
                      <div className="w-full py-3 text-xs text-center text-[var(--text-muted)] bg-white/5 rounded-lg">
                        ⏳ Coming Soon
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ElectionsPage;
