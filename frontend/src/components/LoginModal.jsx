import { useState } from "react";
import { X, Lock, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api";
import { useCart } from "../lib/CartContext";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useCart();
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
  });

  if (!isOpen) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await apiClient.post("/customers/login", {
          phone: form.phone,
          password: form.password,
        });
        await loginUser(data);
        toast.success(`Welcome back, ${data.name}!`);
        onSuccess && onSuccess(data);
        onClose();
      } else {
        const { data } = await apiClient.post("/customers/register", form);
        await loginUser(data);
        toast.success(`Account created successfully!`);
        onSuccess && onSuccess(data);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#6b3e1f] hover:text-[#0f4d2e] hover:bg-[#0f4d2e]/5 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="font-display text-2xl font-semibold text-[#0a331e] mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-[#6b3e1f] text-sm mb-6">
            {isLogin ? "Enter your mobile number and password to login." : "Sign up to track your orders and save your cart."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-[#6b3e1f] mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b3e1f]/50" />
                  <input 
                    required 
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#6b3e1f]/20 focus:border-[#0f4d2e] focus:ring-2 focus:ring-[#0f4d2e]/10 outline-none transition-all text-sm"
                    placeholder="E.g. Ramesh Kumar"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.1em] text-[#6b3e1f] mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b3e1f]/50" />
                <input 
                  required 
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#6b3e1f]/20 focus:border-[#0f4d2e] focus:ring-2 focus:ring-[#0f4d2e]/10 outline-none transition-all text-sm"
                  placeholder="Enter 10-digit number"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.1em] text-[#6b3e1f] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b3e1f]/50" />
                <input 
                  required 
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#6b3e1f]/20 focus:border-[#0f4d2e] focus:ring-2 focus:ring-[#0f4d2e]/10 outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f4d2e] hover:bg-[#0a331e] text-white disabled:opacity-70 font-semibold py-3.5 rounded-xl transition-all duration-300 mt-2"
            >
              {loading ? "Please wait..." : (isLogin ? "Login" : "Register")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#6b3e1f]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setForm({ name: "", phone: "", password: "" }); }}
              className="font-semibold text-[#0f4d2e] hover:underline"
            >
              {isLogin ? "Create one" : "Login here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
