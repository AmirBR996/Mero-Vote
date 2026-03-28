import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/header/Navbar";
import Footer from "../components/header/Footer";
import { getElections, getStats } from "../api/elections.api";

/* Animated counter */
const StatCounter = ({ end, label, suffix = "" }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null;
    const dur = 2000;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      setCount(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end]);
  return (
    <div className="text-center">
      <h2 className="text-3xl md:text-5xl font-bold gradient-text">{count.toLocaleString()}{suffix}</h2>
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mt-2">{label}</p>
    </div>
  );
};

const Homepage = () => {
  const [elections, setElections] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalElections: 0,
    ongoingElections: 0,
    voterTurnout: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Auto-refresh stats every 5 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        setStats(response.data || {});
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
    const statsInterval = setInterval(fetchStats, 5000);
    return () => clearInterval(statsInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveStep((p) => (p + 1) % 3), 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getElections().then((r) => setElections(r?.data || [])).catch(() => {});
  }, []);

  const ongoingElections = elections.filter((e) => e.status === "ONGOING");

  const steps = [
    { num: "०१", title: "दर्ता गर्नुस्", sub: "Register", desc: "Create account with face verification for secure identity.", icon: "📝" },
    { num: "०२", title: "मतदान छान्नुस्", sub: "Choose Election", desc: "Browse active elections and select your preferred poll.", icon: "🗳️" },
    { num: "०३", title: "मत दिनुस्", sub: "Cast Vote", desc: "Verify your face and securely cast your democratic vote.", icon: "✅" },
  ];

  return (
    <div className="bg-[var(--bg)] text-[var(--text-primary)] min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative h-screen flex items-center px-6 md:px-16 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--nepal-red), transparent 70%)" }} />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full opacity-8" style={{ background: "radial-gradient(circle, var(--nepal-blue), transparent 70%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, var(--nepal-gold), transparent 70%)" }} />
        </div>

        <div className="relative max-w-3xl z-10" style={{ animation: "fadeInUp 0.8s ease-out" }}>
          <div className="inline-flex items-center gap-2 bg-[var(--nepal-red)]/10 border border-[var(--nepal-red)]/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--nepal-red)] animate-pulse" />
            <span className="text-[var(--nepal-red)] text-xs font-semibold tracking-wider uppercase">Live Voting · Nepal</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6">
            लोकतन्त्रको{" "}
            <br />
            <span className="gradient-text">डिजिटल आवाज</span>
          </h1>

          <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl leading-relaxed">
            Secure, transparent digital voting platform with real-time face verification. Your vote, your voice — for every citizen of Nepal.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link to="/elections" className="btn-primary px-8 py-4 text-sm flex items-center gap-2">
              🗳️ Vote Now
            </Link>
            <Link to="/results" className="btn-secondary px-8 py-4 text-sm flex items-center gap-2">
              📊 View Results
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-[var(--nepal-red)]/10" style={{ background: "linear-gradient(180deg, var(--nepal-red-light), transparent)" }}>
        <StatCounter end={stats.totalVoters} label="Registered Voters" />
        <StatCounter end={stats.totalElections} label="Total Elections" />
        <StatCounter end={stats.ongoingElections} label="Active Elections" />
        <StatCounter end={stats.voterTurnout} label="Voter Turnout" suffix="%" />
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 md:px-16">
        <div className="text-center mb-16">
          <p className="text-[var(--nepal-red)] text-xs uppercase tracking-[0.3em] font-semibold mb-3">Simple Process</p>
          <h2 className="text-3xl md:text-5xl font-bold">कसरी काम गर्छ</h2>
          <p className="text-[var(--text-muted)] mt-3 text-sm">How It Works</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={i}
              onMouseEnter={() => setActiveStep(i)}
              className={`glass-card p-8 cursor-pointer transition-all duration-500 group ${
                activeStep === i
                  ? "border-[var(--nepal-red)]/40 shadow-lg shadow-[var(--nepal-red)]/10 scale-[1.02]"
                  : "hover:border-white/10"
              }`}
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-3xl font-bold gradient-text mb-2">{step.num}</h3>
              <h4 className="text-xl font-semibold text-white mb-1">{step.title}</h4>
              <p className="text-xs text-[var(--nepal-red)] uppercase tracking-wider mb-3">{step.sub}</p>
              <p className="text-sm text-[var(--text-muted)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVE ELECTIONS */}
      {ongoingElections.length > 0 && (
        <section className="px-6 md:px-16 pb-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[var(--nepal-red)] text-xs uppercase tracking-[0.3em] font-semibold mb-2">Live Now</p>
              <h2 className="text-3xl font-bold">चालू निर्वाचन</h2>
            </div>
            <Link to="/elections" className="btn-secondary text-xs py-2 px-5">View All →</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ongoingElections.slice(0, 3).map((election) => (
              <div key={election.id} className="glass-card p-6 group hover:border-[var(--nepal-red)]/30 transition-all duration-300">
                <span className="badge-nepal badge-ongoing">🟢 ONGOING</span>
                <h3 className="text-lg font-semibold text-white mt-3 mb-2">{election.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{election.description}</p>
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-4">
                  <span>{election.type}</span>
                  <span>Ends {new Date(election.endDate).toLocaleDateString()}</span>
                </div>
                <Link to={`/elections/${election.id}/vote`} className="btn-primary w-full py-2.5 text-xs text-center block">
                  Vote Now →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* WHY VOTE */}
      <section className="px-6 md:px-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[var(--nepal-red)] text-xs uppercase tracking-[0.3em] font-semibold mb-3">Your Right</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">किन मत दिने?</h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            Voting is your fundamental democratic right. Shape the future of Nepal through secure digital participation. Every vote counts!
          </p>
          <Link to="/register" className="btn-secondary px-6 py-3 text-sm">
            Register Now →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: "🔐", label: "Secure", desc: "End-to-end encryption" },
            { icon: "👤", label: "Face Verified", desc: "Biometric identity check" },
            { icon: "⚡", label: "Real-time", desc: "Instant vote counting" },
            { icon: "🏛️", label: "Official", desc: "Government approved" },
          ].map((f, i) => (
            <div key={i} className="glass-card p-5 text-center group hover:border-[var(--nepal-red)]/30 transition-all">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h4 className="text-sm font-semibold text-white mb-1">{f.label}</h4>
              <p className="text-xs text-[var(--text-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;