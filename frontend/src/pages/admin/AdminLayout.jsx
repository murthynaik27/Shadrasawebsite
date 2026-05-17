import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  ImageIcon,
  FileText,
  Inbox,
  MessageSquareText,
  LogOut,
  Menu,
  Globe,
  Image as ImageIconNav,
  Star,
  X,
} from "lucide-react";
import { LOGO_URL, apiClient } from "../../lib/api";
import { authHeaders } from "../../lib/admin";

const nav = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIconNav },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/content", label: "Story / Content", icon: FileText },
  { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquareText },
  { to: "/admin/contacts", label: "Contacts", icon: Inbox },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    apiClient
      .get("/auth/me", { headers: authHeaders() })
      .then((r) => setUser(r.data))
      .catch(() => {
        toast.error("Please sign in.");
        navigate("/admin/login");
      });
  }, [navigate]);

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout", {}, { headers: authHeaders() });
    } catch {
      // noop
    }
    localStorage.removeItem("shadrasa_token");
    navigate("/admin/login");
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] text-[#6b3e1f]">Loading admin…</div>;
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex" data-testid="admin-layout">
      {/* Sidebar */}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static z-40 md:z-auto inset-y-0 left-0 w-72 bg-white border-r border-[#6b3e1f]/10 transition-transform duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#6b3e1f]/10">
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Shadrasa" className="h-10 w-10" />
            <div>
              <p className="font-display font-bold text-[#0a331e]">Shadrasa</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b3e1f]">Admin Console</p>
            </div>
          </Link>
          <button className="md:hidden text-[#0a331e]" onClick={() => setOpen(false)} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? "bg-[#0f4d2e] text-white" : "text-[#0a331e] hover:bg-[#fdfbf7]"
                }`
              }
            >
              <n.icon size={16} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[#6b3e1f]/10 space-y-2">
          <a
            href={process.env.PUBLIC_URL || "/Shadrasawebsite"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#6b3e1f] hover:bg-[#fdfbf7] text-sm font-medium"
          >
            <Globe size={14} /> View website
          </a>
          <button
            onClick={logout}
            data-testid="admin-logout"
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-[#0a331e] hover:bg-[#0f4d2e] hover:text-white transition-colors text-sm font-semibold"
          >
            <LogOut size={16} /> Logout
          </button>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b3e1f]/70 text-center pt-1">{user.email}</p>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between bg-white border-b border-[#6b3e1f]/10 px-4 py-3 sticky top-0 z-20">
          <button onClick={() => setOpen(true)} className="text-[#0a331e]" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Shadrasa" className="h-7 w-7" />
            <span className="font-display font-semibold text-[#0a331e]">Admin</span>
          </div>
          <button onClick={logout} className="text-[#0a331e]" aria-label="Logout">
            <LogOut size={18} />
          </button>
        </header>
        <main className="p-6 md:p-10">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
