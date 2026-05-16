import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { apiClient, formatApiError, LOGO_URL } from "../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      if (data.access_token) {
        localStorage.setItem("shadrasa_token", data.access_token);
      }
      toast.success("Welcome back!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="admin-login-page"
      className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(212,160,23,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(15,77,46,0.12) 0%, transparent 50%)",
      }} />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <img src={LOGO_URL} alt="Shadrasa" className="h-14 w-14" />
          <div>
            <p className="font-display text-2xl font-bold text-[#0a331e]">Shadrasa</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#6b3e1f] font-semibold">Admin Portal</p>
          </div>
        </Link>

        <form
          onSubmit={submit}
          className="bg-white rounded-3xl border border-[#6b3e1f]/15 shadow-[0_20px_60px_-20px_rgba(15,77,46,0.2)] p-8"
        >
          <div className="h-12 w-12 rounded-2xl bg-[#0f4d2e] flex items-center justify-center mb-5">
            <Lock size={20} className="text-[#d4a017]" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#0a331e] mb-2">Admin Login</h1>
          <p className="text-[#4a453f] text-sm mb-6">Sign in to manage enquiries and contact submissions.</p>

          <label className="block mb-4">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b3e1f] block mb-2">Email</span>
            <input
              type="email"
              required
              data-testid="admin-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#6b3e1f]/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d2e]/30 focus:border-[#0f4d2e] bg-[#fdfbf7]"
            />
          </label>
          <label className="block mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b3e1f] block mb-2">Password</span>
            <input
              type="password"
              required
              data-testid="admin-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#6b3e1f]/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d2e]/30 focus:border-[#0f4d2e] bg-[#fdfbf7]"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full bg-[#0f4d2e] hover:bg-[#0a331e] disabled:opacity-60 text-white rounded-full font-semibold transition-all duration-300 px-6 py-3.5"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link
          to="/"
          className="block text-center mt-6 text-[#6b3e1f] hover:text-[#0f4d2e] text-sm font-medium"
        >
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
