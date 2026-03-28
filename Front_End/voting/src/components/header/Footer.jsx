import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-[var(--bg)] border-t border-[var(--nepal-red)]/15 px-6 md:px-16 py-14">
      {/* Nepal stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, #DC143C, #003893, #E8A317, #DC143C)" }} />

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, var(--nepal-red), var(--nepal-red-dark))" }}>🗳️</div>
            <div>
              <h2 className="text-white font-bold text-lg">मेरो भोट</h2>
              <p className="text-[var(--nepal-red)] text-[10px] tracking-[0.2em] uppercase">Mero Vote</p>
            </div>
          </div>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            Nepal's trusted digital voting platform — bringing democratic participation to every citizen through secure, transparent technology.
          </p>
        </div>

        <div>
          <h3 className="text-[var(--nepal-red)] text-xs uppercase tracking-[0.2em] font-semibold mb-4">Quick Links</h3>
          <div className="space-y-2">
            {[
              { name: "Elections", path: "/elections" },
              { name: "Results", path: "/results" },
              { name: "Register", path: "/register" },
              { name: "Login", path: "/login" },
            ].map((l) => (
              <Link key={l.name} to={l.path} className="block text-[var(--text-muted)] text-sm hover:text-[var(--nepal-red)] transition">
                {l.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[var(--nepal-red)] text-xs uppercase tracking-[0.2em] font-semibold mb-4">Legal</h3>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            © 2025 मेरो भोट — Mero Vote.
            <br />All rights reserved.
            <br />
            <span className="text-[var(--nepal-gold)] text-xs mt-2 block">
              🇳🇵 Election Commission of Nepal Approved
            </span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/5 text-center text-xs text-[var(--text-muted)]">
        Built with ❤️ for Nepal's Democracy • Secure • Transparent • Accessible
      </div>
    </footer>
  );
};

export default Footer;