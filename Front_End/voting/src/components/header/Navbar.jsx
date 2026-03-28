import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../api/auth.api";
import toast from "react-hot-toast";

const districts = [
  "KATHMANDU","LALITPUR","BHAKTAPUR","BARA","POKHARA","CHITWAN",
  "DHANKUTA","MORANG","SURKHET","BHAIRAHAWA","KAILALI","KANCHANPUR",
  "SOLUKHUMBU","TANAHU","NUWAKOT","SINDHUPALCHOK","MAKWANPUR",
  "RAMECHHAP","DHADING","PALPA",
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", dob: "", district: "", photoUrl: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, updateUser } = useAuth();

  useEffect(() => { setAvatarFailed(false); }, [user]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || "",
      dob: user.dob ? new Date(user.dob).toISOString().slice(0, 10) : "",
      district: user.district || "",
      photoUrl: user.photoUrl || user.photo_url || "",
    });
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", path: "/" },
    { name: "Elections", path: "/elections" },
    { name: "Results", path: "/results" },
  ];

  const navLinks = user?.role === "ADMIN"
    ? [...links, { name: "Admin", path: "/admin" }]
    : links;

  const getAvatarUrl = () => user?.photoUrl || user?.photo_url || "";
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  };

  const avatarUrl = getAvatarUrl();

  const handleLogout = () => {
    logout();
    setOpen(false);
    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

  const handleProfileInput = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const response = await updateProfile(profileForm);
      if (!response.success) { toast.error(response.message || "Failed"); return; }
      updateUser(response.data || response.user || profileForm);
      toast.success(response.message || "Profile updated");
      setProfileOpen(false);
    } catch (error) {
      toast.error(error.message || "Profile update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex items-center justify-between h-[72px] px-6 md:px-12 ${
        scrolled
          ? "bg-[var(--bg)]/95 backdrop-blur-xl border-b border-[var(--nepal-red)]/20 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      {/* Nepal stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, #DC143C, #003893, #E8A317, #DC143C)" }} />

      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, var(--nepal-red), var(--nepal-red-dark))" }}>
          🗳️
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-wide group-hover:text-[var(--nepal-gold)] transition">
            मेरो भोट
          </h1>
          <p className="text-[var(--nepal-red)] text-[10px] tracking-[0.2em] uppercase">
            Mero Vote
          </p>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive(item.path)
                ? "bg-[var(--nepal-red)]/15 text-[var(--nepal-red)]"
                : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
            }`}
          >
            {item.name}
          </Link>
        ))}

        <div className="w-px h-6 bg-white/10 mx-3" />

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-[var(--nepal-red)]/40 bg-[var(--bg-card)] flex items-center justify-center cursor-pointer hover:ring-[var(--nepal-red)] transition-all"
              title="Profile"
            >
              {avatarUrl && !avatarFailed ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} />
              ) : (
                <span className="text-xs font-bold text-white">{getInitials()}</span>
              )}
            </button>
            <button type="button" onClick={handleLogout} className="btn-primary text-xs py-2 px-4">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary text-xs py-2 px-5">
            Login
          </Link>
        )}
      </div>

      {/* Mobile toggle */}
      <button className="md:hidden text-white text-2xl" onClick={() => setOpen(!open)}>
        {open ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-[var(--bg)]/98 backdrop-blur-xl border-t border-[var(--nepal-red)]/20 flex flex-col items-center py-6 gap-4 md:hidden animate-fade-in">
          {navLinks.map((item) => (
            <Link key={item.name} to={item.path} onClick={() => setOpen(false)}
              className={`text-lg font-medium transition ${isActive(item.path) ? "text-[var(--nepal-red)]" : "text-white hover:text-[var(--nepal-red)]"}`}
            >
              {item.name}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <button type="button" onClick={() => { setOpen(false); setProfileOpen(true); }}
                className="h-14 w-14 rounded-full overflow-hidden ring-2 ring-[var(--nepal-red)]/40 bg-[var(--bg-card)] flex items-center justify-center">
                {avatarUrl && !avatarFailed ? (
                  <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} />
                ) : (
                  <span className="text-lg font-bold text-white">{getInitials()}</span>
                )}
              </button>
              <button type="button" onClick={handleLogout} className="btn-primary py-2 px-6 text-sm">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="btn-primary py-2 px-6 text-sm">Login</Link>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {profileOpen && isAuthenticated && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white">Update Profile</h3>
              <button type="button" onClick={() => setProfileOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-[var(--text-muted)] mb-1">Full Name</label>
                <input id="profile-name" name="name" value={profileForm.name} onChange={handleProfileInput} required className="input-nepal" />
              </div>
              <div>
                <label htmlFor="profile-dob" className="block text-sm font-medium text-[var(--text-muted)] mb-1">Date of Birth</label>
                <input id="profile-dob" name="dob" type="date" value={profileForm.dob} onChange={handleProfileInput} required className="input-nepal" />
              </div>
              <div>
                <label htmlFor="profile-district" className="block text-sm font-medium text-[var(--text-muted)] mb-1">District</label>
                <select id="profile-district" name="district" value={profileForm.district} onChange={handleProfileInput} required className="select-nepal">
                  <option value="">Select district</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="profile-photo" className="block text-sm font-medium text-[var(--text-muted)] mb-1">Photo URL</label>
                <input id="profile-photo" name="photoUrl" type="url" value={profileForm.photoUrl} onChange={handleProfileInput} required className="input-nepal" />
              </div>
              <button type="submit" disabled={savingProfile} className="btn-primary w-full py-3">
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;