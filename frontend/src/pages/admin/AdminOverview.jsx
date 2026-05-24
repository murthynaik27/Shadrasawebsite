import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, Tags, Image as ImageIcon, Inbox, MessageSquareText, AlertTriangle, TrendingUp, Wallet, Globe } from "lucide-react";
import { apiClient } from "../../lib/api";
import { authHeaders, fmtDate, formatPrice } from "../../lib/admin";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentEnq, setRecentEnq] = useState([]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.REACT_APP_SITE_URL || "https://shadrasawebsite-szwt.vercel.app/";

  useEffect(() => {
    Promise.all([
      apiClient.get("/admin/dashboard", { headers: authHeaders() }),
      apiClient.get("/admin/orders", { headers: authHeaders() }),
      apiClient.get("/admin/enquiries", { headers: authHeaders() }),
    ])
      .then(([d, o, e]) => {
        setStats(d.data);
        setRecentOrders((o.data || []).slice(0, 5));
        setRecentEnq((e.data || []).slice(0, 5));
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div data-testid="admin-overview">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Dashboard Overview</h1>
      <p className="text-[#6b3e1f] mt-1 mb-8 text-sm">Real-time snapshot of your Shadrasa store.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Revenue" value={formatPrice(stats?.revenue ?? 0)} icon={Wallet} color="#0f4d2e" to="/admin/orders" />
        <StatCard label="Total Orders" value={stats?.orders ?? "—"} icon={ShoppingCart} color="#d4a017" to="/admin/orders" />
        <StatCard label="Pending Orders" value={stats?.pending_orders ?? "—"} icon={ShoppingCart} color="#b45309" to="/admin/orders" />
        <StatCard label="Low Stock (≤5)" value={stats?.low_stock ?? "—"} icon={AlertTriangle} color="#b45309" to="/admin/products" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Products" value={stats?.products ?? "—"} icon={Package} color="#0f4d2e" to="/admin/products" />
        <StatCard label="Categories" value={stats?.categories ?? "—"} icon={Tags} color="#d4a017" to="/admin/categories" />
        <StatCard label="Banners" value={stats?.banners ?? "—"} icon={ImageIcon} color="#6b3e1f" to="/admin/banners" />
        <StatCard label="Active Products" value={stats?.active_products ?? "—"} icon={TrendingUp} color="#0f4d2e" />
        <StatCard label="Enquiries" value={stats?.enquiries ?? "—"} icon={MessageSquareText} color="#0a331e" to="/admin/enquiries" />
        <StatCard label="Contacts" value={stats?.contacts ?? "—"} icon={Inbox} color="#0f4d2e" to="/admin/contacts" />
        <StatCard label="Total Leads" value={(stats?.contacts ?? 0) + (stats?.enquiries ?? 0)} icon={TrendingUp} color="#0f4d2e" />
        <StatCard label="View Site" value="→" icon={Globe} color="#6b3e1f" link={siteUrl} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders items={recentOrders} />
        <RecentBlock title="Recent Enquiries" items={recentEnq} fields={["product", "name", "phone"]} link="/admin/enquiries" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, to, link, target }) {
  const body = (
    <div className="rounded-[12px] bg-white p-[14px] border border-[#6b3e1f]/10 hover:border-[#d4a017]/40 transition-colors h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] uppercase tracking-[0.05em] font-bold text-[#6b3e1f] truncate pr-2">{label}</p>
        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
          <Icon size={16} />
        </div>
      </div>
      <p className="font-display text-[18px] md:text-[24px] font-bold text-[#0a331e] break-words">{value}</p>
    </div>
  );
  if (to) return <Link to={to} target={target}>{body}</Link>;
  if (link) return <a href={link} target="_blank" rel="noopener noreferrer">{body}</a>;
  return body;
}

function RecentOrders({ items }) {
  return (
    <div className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#6b3e1f]/10">
        <h3 className="font-display text-lg font-semibold text-[#0a331e]">Recent Orders</h3>
        <Link to="/admin/orders" className="text-xs text-[#0f4d2e] hover:underline font-semibold">View all →</Link>
      </div>
      {items.length === 0 ? (
        <p className="p-6 text-sm text-[#6b3e1f]">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-[#6b3e1f]/8">
          {items.map((o) => (
            <li key={o.id} className="px-5 py-3 text-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-[#0f4d2e] font-semibold">{o.order_no}</p>
                <p className="text-[#0a331e] truncate">{o.customer_name} · {o.items?.length || 0} items</p>
              </div>
              <div className="text-right whitespace-nowrap">
                <p className="font-display font-semibold text-[#0a331e]">{formatPrice(o.total)}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#6b3e1f]">{o.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecentBlock({ title, items, fields, link }) {
  return (
    <div className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#6b3e1f]/10">
        <h3 className="font-display text-lg font-semibold text-[#0a331e]">{title}</h3>
        <Link to={link} className="text-xs text-[#0f4d2e] hover:underline font-semibold">View all →</Link>
      </div>
      {items.length === 0 ? (
        <p className="p-6 text-sm text-[#6b3e1f]">Nothing yet.</p>
      ) : (
        <ul className="divide-y divide-[#6b3e1f]/8">
          {items.map((it) => (
            <li key={it.id} className="px-5 py-3 text-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[#0a331e] truncate">{it[fields[0]]}</p>
                <p className="text-xs text-[#6b3e1f] truncate">{fields.slice(1).map((f) => it[f]).filter(Boolean).join(" · ")}</p>
              </div>
              <span className="text-[10px] text-[#6b3e1f] whitespace-nowrap">{fmtDate(it.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
