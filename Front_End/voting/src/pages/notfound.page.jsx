import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, #DC143C, #003893, #E8A317, #DC143C)" }} />

      <div className="text-center animate-fade-in-up">
        <div className="text-8xl mb-6">🏔️</div>
        <h1 className="text-6xl md:text-8xl font-extrabold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">पृष्ठ फेला परेन</h2>
        <p className="text-[var(--nepal-red)] text-sm uppercase tracking-wider mb-4">Page Not Found</p>
        <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Return to the homepage to continue.
        </p>
        <Link to="/" className="btn-primary px-8 py-3 text-sm inline-block">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
