import { Link } from "react-router-dom";
import RegisterForm from "../components/forms/register.form";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden px-4 py-10 md:py-16 flex items-center justify-center">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(220,20,60,0.12), transparent)" }} />
      <div className="pointer-events-none absolute -left-24 bottom-4 h-80 w-80 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(0,56,147,0.1), transparent)" }} />

      <div className="relative w-full max-w-xl glass-card p-7 md:p-9 animate-fade-in-up">
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: "linear-gradient(90deg, #DC143C, #003893, #E8A317)" }} />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, var(--nepal-red), var(--nepal-red-dark))" }}>
            📝
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">नयाँ खाता</h1>
            <p className="text-[var(--nepal-red)] text-[10px] tracking-[0.2em] uppercase">Create Account</p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] mb-6">
          Register with face verification to participate in secure digital voting.
        </p>

        <RegisterForm />

        <p className="mt-6 border-t border-white/5 pt-5 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--nepal-red)] hover:text-[var(--nepal-gold)] transition">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
