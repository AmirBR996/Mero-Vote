import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import FaceCapture from "../FaceCapture";

const districts = [
  "KATHMANDU","LALITPUR","BHAKTAPUR","BARA","POKHARA","CHITWAN",
  "DHANKUTA","MORANG","SURKHET","BHAIRAHAWA","KAILALI","KANCHANPUR",
  "SOLUKHUMBU","TANAHU","NUWAKOT","SINDHUPALCHOK","MAKWANPUR",
  "RAMECHHAP","DHADING","PALPA",
];

const RegisterForm = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: "", email: "", dob: "", district: "",
    citizenNo: "", photoUrl: "", password: "", c_password: "",
  });
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFaceCapture = (photoDataUrl, descriptor) => {
    setFormData((prev) => ({ ...prev, photoUrl: photoDataUrl }));
    setFaceDescriptor(descriptor);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.c_password) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.photoUrl) {
      toast.error("Please capture your face photo for verification");
      return;
    }
    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
      toast.error("Face descriptor not properly captured. Please retake your photo.");
      return;
    }

    try {
      setLoading(true);
      const { c_password, ...rest } = formData;
      const response = await register({ ...rest, faceDescriptor });

      if (response.success && response.access_token) {
        // FIX: Build userData cleanly — don't rely on spread + manual re-attach
        const userData = {
          ...response.data,
          faceDescriptor,
        };
        authLogin(userData, response.access_token);
        toast.success(response.message || "Account created with face verification");
        navigate("/", { replace: true });
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error) {
      // FIX: Safe fallback if error is not an Error instance (e.g. plain string)
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]" htmlFor="name">
          Full Name
        </label>
        <input
          id="name" name="name" value={formData.name} onChange={onChange}
          placeholder="Your full name" required className="input-nepal"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]" htmlFor="email">
          Email
        </label>
        <input
          id="email" type="email" name="email" value={formData.email} onChange={onChange}
          placeholder="you@example.com" required className="input-nepal"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]" htmlFor="dob">
            Date of Birth
          </label>
          <input
            id="dob" type="date" name="dob" value={formData.dob} onChange={onChange}
            required className="input-nepal"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]" htmlFor="district">
            District
          </label>
          <select
            id="district" name="district" value={formData.district} onChange={onChange}
            required className="select-nepal"
          >
            <option value="">Select District</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]" htmlFor="citizenNo">
          Citizenship Number
        </label>
        <input
          id="citizenNo" name="citizenNo" value={formData.citizenNo} onChange={onChange}
          placeholder="11-11-11-11111" required className="input-nepal"
          pattern="^\d{2}-\d{2}-\d{2}-\d{5}$|^\d{2}-\d{6}-\d{5}$"
          title="Format: 11-11-11-11111 or 11-111111-11111"
        />
      </div>

      {/* FIX: Don't pass formData.photoUrl back as existingPhoto — FaceCapture only
          reads it on mount via useState initializer, so re-passing it on every render
          is misleading and can cause issues if the prop logic is ever expanded. */}
      <FaceCapture onCapture={handleFaceCapture} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]" htmlFor="password">
            Password
          </label>
          <input
            id="password" type="password" name="password" value={formData.password}
            onChange={onChange} placeholder="••••••••" required className="input-nepal"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]" htmlFor="c_password">
            Confirm Password
          </label>
          <input
            id="c_password" type="password" name="c_password" value={formData.c_password}
            onChange={onChange} placeholder="••••••••" required className="input-nepal"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
        {loading ? "Creating Account..." : "Register & Verify Face"}
      </button>
    </form>
  );
};

export default RegisterForm;