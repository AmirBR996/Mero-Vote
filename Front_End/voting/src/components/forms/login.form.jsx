import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await login(formData);
      if (response.success && response.access_token) {
        authLogin(response.data, response.access_token);
        toast.success(response.message || "Login success");
        navigate("/", { replace: true });
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          className="input-nepal"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          className="input-nepal"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
        {loading ? "Logging in..." : "Login to Vote"}
      </button>
    </form>
  );
};

export default LoginForm;
