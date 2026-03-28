import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../api/admin.api";
import Navbar from "../components/header/Navbar";
import { createCandidate, deleteCandidate, getCandidates, updateCandidate } from "../api/candidates.api";
import { getElections, createElection, updateElection, deleteElection } from "../api/elections.api";

const districts = [
  "KATHMANDU","LALITPUR","BHAKTAPUR","BARA","POKHARA","CHITWAN",
  "DHANKUTA","MORANG","SURKHET","BHAIRAHAWA","KAILALI","KANCHANPUR",
  "SOLUKHUMBU","TANAHU","NUWAKOT","SINDHUPALCHOK","MAKWANPUR",
  "RAMECHHAP","DHADING","PALPA",
];

const emptyCandidate = { name: "", party: "", position: "", district: "", photoUrl: "", bio: "", electionId: "1" };
const emptyElection = { title: "", description: "", type: "LOCAL", status: "UPCOMING", startDate: "", endDate: "" };

const toDisplayDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const toInputDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editingCandidateId, setEditingCandidateId] = useState(null);
  const [editingElectionId, setEditingElectionId] = useState(null);
  const [candidateForm, setCandidateForm] = useState(emptyCandidate);
  const [electionForm, setElectionForm] = useState(emptyElection);
  const [activeTab, setActiveTab] = useState("elections");

  const isAdmin = user?.role === "ADMIN";

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [userRes, candRes, elecRes] = await Promise.all([getAllUsers(), getCandidates(), getElections()]);
      setUsers(userRes?.data || []);
      setCandidates(candRes?.data || []);
      setElections(elecRes?.data || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load data");
    }
    setLoadingData(false);
  };

  useEffect(() => { if (isAdmin) loadData(); }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return users;
    return users.filter((e) => [e.name, e.email, e.district, e.role].some((f) => f?.toLowerCase().includes(kw)));
  }, [users, search]);

  const stats = useMemo(() => {
    const admins = users.filter((e) => e.role === "ADMIN").length;
    return { totalUsers: users.length, admins, voters: users.length - admins, totalCandidates: candidates.length, totalElections: elections.length };
  }, [users, candidates, elections]);

  /* Candidate handlers */
  const resetCandidateForm = () => { setCandidateForm(emptyCandidate); setEditingCandidateId(null); };
  const handleCandidateInput = (e) => setCandidateForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleEditCandidate = (c) => {
    setEditingCandidateId(c.id);
    setCandidateForm({ name: c.name || "", party: c.party || "", position: c.position || "", district: c.district || "", photoUrl: c.photoUrl || c.photo_url || "", bio: c.bio || "", electionId: c.electionId?.toString() || "1" });
    setActiveTab("add-candidate");
  };
  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const r = editingCandidateId ? await updateCandidate(editingCandidateId, candidateForm) : await createCandidate(candidateForm);
      toast.success(r?.message || "Saved");
      await loadData();
      resetCandidateForm();
      setActiveTab("candidates");
    } catch (err) { toast.error(err?.message || "Save failed"); }
    setSaving(false);
  };
  const handleDeleteCandidate = async (id) => {
    if (!confirm("Delete this candidate?")) return;
    try { await deleteCandidate(id); toast.success("Deleted"); await loadData(); } catch (err) { toast.error(err?.message || "Delete failed"); }
  };

  /* Election handlers */
  const resetElectionForm = () => { setElectionForm(emptyElection); setEditingElectionId(null); };
  const handleElectionInput = (e) => setElectionForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleEditElection = (el) => {
    setEditingElectionId(el.id);
    setElectionForm({ title: el.title || "", description: el.description || "", type: el.type || "LOCAL", status: el.status || "UPCOMING", startDate: toInputDate(el.startDate), endDate: toInputDate(el.endDate) });
    setActiveTab("add-election");
  };
  const handleElectionSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const r = editingElectionId ? await updateElection(editingElectionId, electionForm) : await createElection(electionForm);
      toast.success(r?.message || "Saved");
      await loadData();
      resetElectionForm();
      setActiveTab("elections");
    } catch (err) { toast.error(err?.message || "Save failed"); }
    setSaving(false);
  };
  const handleDeleteElection = async (id) => {
    if (!confirm("Delete this election and all related data?")) return;
    try { await deleteElection(id); toast.success("Deleted"); await loadData(); } catch (err) { toast.error(err?.message || "Delete failed"); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[var(--nepal-red)] border-t-transparent rounded-full" style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );
  if (!isAdmin) return <Navigate to="/" replace />;

  const tabs = [
    { id: "elections", label: "Elections", count: elections.length, icon: "🗳️" },
    { id: "candidates", label: "Candidates", count: candidates.length, icon: "👤" },
    { id: "users", label: "Users", count: users.length, icon: "👥" },
    { id: "add-election", label: editingElectionId ? "Edit Election" : "+ Election", count: null, icon: "📝" },
    { id: "add-candidate", label: editingCandidateId ? "Edit Candidate" : "+ Candidate", count: null, icon: "➕" },
  ];

  return (
    <main className="bg-[var(--bg)] text-[var(--text-primary)] min-h-screen">
      <Navbar />

      <div className="pt-24 px-4 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="glass-card p-5 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, var(--nepal-red), var(--nepal-red-dark))", color: "white" }}>EC</div>
                <div>
                  <div className="text-sm font-semibold text-white">Election Commission</div>
                  <div className="text-[10px] text-[var(--nepal-red)] uppercase tracking-wider">Admin Console</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: "Users", value: stats.totalUsers, color: "var(--nepal-blue)" },
                  { label: "Voters", value: stats.voters, color: "#22c55e" },
                  { label: "Elections", value: stats.totalElections, color: "var(--nepal-gold)" },
                  { label: "Candidates", value: stats.totalCandidates, color: "var(--nepal-red)" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/5 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold" style={{ color }}>{value}</div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <nav className="glass-card p-2 space-y-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.id ? "bg-[var(--nepal-red)]/15 text-[var(--nepal-red)]" : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                  }`}>
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  {tab.count !== null && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{tab.count}</span>}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* ELECTIONS TAB */}
            {activeTab === "elections" && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Elections</h1>
                    <p className="text-sm text-[var(--text-muted)]">{elections.length} total</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={loadData} className="btn-secondary text-xs py-2 px-4">Refresh</button>
                    <button onClick={() => { resetElectionForm(); setActiveTab("add-election"); }} className="btn-primary text-xs py-2 px-4">+ New Election</button>
                  </div>
                </div>
                {loadingData ? (
                  <div className="flex justify-center py-10"><div className="w-8 h-8 border-3 border-[var(--nepal-red)] border-t-transparent rounded-full" style={{ animation: "spin 1s linear infinite" }} /></div>
                ) : elections.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-muted)]"><p className="text-4xl mb-2">🗳️</p><p>No elections. Create one to get started.</p></div>
                ) : (
                  <div className="space-y-3">
                    {elections.map((el) => (
                      <div key={el.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`badge-nepal ${el.status === "ONGOING" ? "badge-ongoing" : el.status === "COMPLETED" ? "badge-completed" : "badge-upcoming"}`}>
                              {el.status}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] bg-white/5 px-2 py-0.5 rounded">{el.type}</span>
                          </div>
                          <h3 className="font-semibold text-white">{el.title}</h3>
                          <p className="text-xs text-[var(--text-muted)]">{toDisplayDate(el.startDate)} — {toDisplayDate(el.endDate)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditElection(el)} className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                          <button onClick={() => handleDeleteElection(el.id)} className="text-xs py-1.5 px-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CANDIDATES TAB */}
            {activeTab === "candidates" && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Candidates</h1>
                    <p className="text-sm text-[var(--text-muted)]">{candidates.length} registered</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={loadData} className="btn-secondary text-xs py-2 px-4">Refresh</button>
                    <button onClick={() => { resetCandidateForm(); setActiveTab("add-candidate"); }} className="btn-primary text-xs py-2 px-4">+ New Candidate</button>
                  </div>
                </div>
                {candidates.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-muted)]"><p className="text-4xl mb-2">👤</p><p>No candidates yet.</p></div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidates.map((c) => (
                      <div key={c.id} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--bg-card)]">
                            {c.photoUrl ? <img src={c.photoUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} /> : <div className="w-full h-full flex items-center justify-center">👤</div>}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{c.name}</h3>
                            <p className="text-xs text-[var(--nepal-red)]">{c.party}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-3">
                          <span className="bg-white/5 px-2 py-0.5 rounded">{c.position}</span>
                          <span>📍 {c.district}</span>
                          <span className="ml-auto font-medium text-[var(--nepal-gold)]">{c.voteCount || 0} votes</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditCandidate(c)} className="btn-secondary text-xs py-1.5 px-3 flex-1">Edit</button>
                          <button onClick={() => handleDeleteCandidate(c.id)} className="text-xs py-1.5 px-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition flex-1">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Users</h1>
                    <p className="text-sm text-[var(--text-muted)]">{filteredUsers.length} of {users.length}</p>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-nepal text-xs py-2 w-48" />
                    <button onClick={loadData} className="btn-secondary text-xs py-2 px-4">Refresh</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-left text-xs text-[var(--text-muted)] uppercase tracking-wider">
                        <th className="py-3 px-3">Name</th><th className="py-3 px-3">Email</th><th className="py-3 px-3">Role</th><th className="py-3 px-3">District</th><th className="py-3 px-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-[var(--text-muted)]">No users found</td></tr>
                      ) : filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[var(--nepal-red)]/15 flex items-center justify-center text-xs font-bold text-[var(--nepal-red)]">
                                {(u.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[var(--text-muted)]">{u.email}</td>
                          <td className="py-3 px-3">
                            <span className={`badge-nepal text-[10px] ${u.role === "ADMIN" ? "bg-[var(--nepal-gold)]/15 text-[var(--nepal-gold)]" : "bg-[var(--nepal-blue)]/15 text-blue-400"}`}>{u.role}</span>
                          </td>
                          <td className="py-3 px-3 text-[var(--text-muted)]">{u.district}</td>
                          <td className="py-3 px-3 text-[var(--text-muted)]">{toDisplayDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ADD/EDIT ELECTION */}
            {activeTab === "add-election" && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{editingElectionId ? "Edit Election" : "New Election"}</h1>
                    <p className="text-sm text-[var(--text-muted)]">{editingElectionId ? "Update details" : "Create a new election"}</p>
                  </div>
                  {editingElectionId && <button onClick={resetElectionForm} className="btn-secondary text-xs py-2 px-4">Cancel</button>}
                </div>
                <form onSubmit={handleElectionSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Title</label>
                      <input name="title" value={electionForm.title} onChange={handleElectionInput} required className="input-nepal" placeholder="Election title" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Type</label>
                      <select name="type" value={electionForm.type} onChange={handleElectionInput} required className="select-nepal">
                        <option value="LOCAL">LOCAL</option>
                        <option value="PROVINCIAL">PROVINCIAL</option>
                        <option value="FEDERAL">FEDERAL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Status</label>
                      <select name="status" value={electionForm.status} onChange={handleElectionInput} required className="select-nepal">
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="ONGOING">ONGOING</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Start Date</label>
                      <input type="date" name="startDate" value={electionForm.startDate} onChange={handleElectionInput} required className="input-nepal" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">End Date</label>
                      <input type="date" name="endDate" value={electionForm.endDate} onChange={handleElectionInput} required className="input-nepal" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Description</label>
                    <textarea name="description" value={electionForm.description} onChange={handleElectionInput} required className="input-nepal" rows={3} placeholder="Election description…" />
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary py-3 px-8 text-sm">
                    {saving ? "Saving…" : editingElectionId ? "Update Election" : "Create Election"}
                  </button>
                </form>
              </div>
            )}

            {/* ADD/EDIT CANDIDATE */}
            {activeTab === "add-candidate" && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{editingCandidateId ? "Edit Candidate" : "New Candidate"}</h1>
                    <p className="text-sm text-[var(--text-muted)]">{editingCandidateId ? "Update details" : "Add to an election"}</p>
                  </div>
                  {editingCandidateId && <button onClick={resetCandidateForm} className="btn-secondary text-xs py-2 px-4">Cancel</button>}
                </div>
                <form onSubmit={handleCandidateSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Full Name</label>
                      <input name="name" value={candidateForm.name} onChange={handleCandidateInput} required className="input-nepal" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Party</label>
                      <input name="party" value={candidateForm.party} onChange={handleCandidateInput} required className="input-nepal" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Position</label>
                      <input name="position" value={candidateForm.position} onChange={handleCandidateInput} required className="input-nepal" placeholder="e.g. Mayor, Ward Chair" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">District</label>
                      <select name="district" value={candidateForm.district} onChange={handleCandidateInput} required className="select-nepal">
                        <option value="">Select</option>
                        {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Photo URL</label>
                      <input name="photoUrl" value={candidateForm.photoUrl} onChange={handleCandidateInput} required className="input-nepal" placeholder="https://…" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Election ID</label>
                      <select name="electionId" value={candidateForm.electionId} onChange={handleCandidateInput} required className="select-nepal">
                        {elections.map((el) => <option key={el.id} value={el.id}>{el.title} (#{el.id})</option>)}
                        {elections.length === 0 && <option value="1">Election #1</option>}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Biography</label>
                    <textarea name="bio" value={candidateForm.bio} onChange={handleCandidateInput} required className="input-nepal" rows={3} placeholder="Brief biography…" />
                  </div>
                  {candidateForm.photoUrl && (
                    <div className="flex items-center gap-3">
                      <img src={candidateForm.photoUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                      <span className="text-xs text-[var(--text-muted)]">Preview</span>
                    </div>
                  )}
                  <button type="submit" disabled={saving} className="btn-primary py-3 px-8 text-sm">
                    {saving ? "Saving…" : editingCandidateId ? "Update Candidate" : "Create Candidate"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}