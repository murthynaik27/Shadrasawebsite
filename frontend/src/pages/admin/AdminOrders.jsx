import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Package, User, MapPin, CreditCard } from "lucide-react";
import { apiClient } from "../../lib/api";
import { authHeaders, fmtDate, formatPrice } from "../../lib/admin";

const STATUSES = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];
const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-amber-100 text-amber-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);

  const load = async () => {
    const r = await apiClient.get("/admin/orders", { headers: authHeaders() });
    setItems(r.data || []);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiClient.put(`/admin/orders/${id}/status`, { status }, { headers: authHeaders() });
      toast.success("Status updated");
      load();
      if (active?.id === id) setActive({ ...active, status });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  const shown = filter === "all" ? items : items.filter((o) => (o.status || "placed") === filter);
  const totalRev = items.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div data-testid="admin-orders">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Orders</h1>
          <p className="text-[#6b3e1f] mt-1 text-sm">Manage and fulfil customer orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b3e1f] font-bold">Revenue</p>
            <p className="font-display text-2xl font-semibold text-[#0a331e]">{formatPrice(totalRev)}</p>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-[#6b3e1f]/20 px-4 py-2.5 text-sm bg-white">
            <option value="all">All ({items.length})</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s} ({items.filter((i) => (i.status || "placed") === s).length})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden">
        {shown.length === 0 ? (
          <p className="p-12 text-center text-[#6b3e1f]">No orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fdfbf7]">
                <tr className="text-left">
                  {["Order #", "Date", "Customer", "Items", "Total", "Payment", "Status", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b3e1f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((o) => (
                  <tr key={o.id} className="border-t border-[#6b3e1f]/10 hover:bg-[#fdfbf7]/40">
                    <td className="px-5 py-3 font-mono text-xs text-[#0f4d2e] font-semibold">{o.order_no}</td>
                    <td className="px-5 py-3 text-xs text-[#6b3e1f] whitespace-nowrap">{fmtDate(o.created_at)}</td>
                    <td className="px-5 py-3"><div className="text-[#0a331e] font-semibold">{o.customer_name}</div><div className="text-xs text-[#6b3e1f]">{o.customer_phone}</div></td>
                    <td className="px-5 py-3 text-[#0a331e]">{o.items?.length || 0}</td>
                    <td className="px-5 py-3 font-semibold text-[#0f4d2e]">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3 text-xs uppercase text-[#6b3e1f]">{o.payment_method}</td>
                    <td className="px-5 py-3">
                      <select value={o.status || "placed"} onChange={(e) => updateStatus(o.id, e.target.value)} className={`rounded-lg border border-[#6b3e1f]/15 px-2 py-1.5 text-xs font-semibold ${STATUS_COLORS[o.status || "placed"]}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setActive(o)} className="text-[#0f4d2e] hover:text-[#d4a017] text-xs font-semibold">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {active && <OrderDrawer order={active} onClose={() => setActive(null)} onStatus={(s) => updateStatus(active.id, s)} />}
    </div>
  );
}

function OrderDrawer({ order, onClose, onStatus }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#6b3e1f]/10 px-6 py-4 flex items-center justify-between">
          <button onClick={onClose} className="inline-flex items-center gap-2 text-[#6b3e1f] hover:text-[#0a331e] text-sm font-semibold">
            <ChevronLeft size={18} /> Back
          </button>
          <select value={order.status || "placed"} onChange={(e) => onStatus(e.target.value)} className={`rounded-lg border border-[#6b3e1f]/15 px-3 py-1.5 text-xs font-semibold ${STATUS_COLORS[order.status || "placed"]}`}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#6b3e1f] font-bold">Order</p>
            <h2 className="font-display text-3xl font-semibold text-[#0a331e]">{order.order_no}</h2>
            <p className="text-xs text-[#6b3e1f] mt-1">Placed on {fmtDate(order.created_at)}</p>
          </div>

          <Block icon={User} title="Customer">
            <p className="font-semibold text-[#0a331e]">{order.customer_name}</p>
            <p className="text-sm text-[#4a453f]">{order.customer_phone}</p>
            {order.customer_email && <p className="text-sm text-[#4a453f]">{order.customer_email}</p>}
          </Block>

          <Block icon={MapPin} title="Shipping Address">
            <p className="text-sm text-[#0a331e]">{order.address_line1}</p>
            {order.address_line2 && <p className="text-sm text-[#0a331e]">{order.address_line2}</p>}
            <p className="text-sm text-[#0a331e]">{order.city}, {order.state} {order.pincode}</p>
            <p className="text-sm text-[#0a331e]">{order.country}</p>
          </Block>

          {order.notes && (
            <Block icon={Package} title="Customer Notes">
              <p className="text-sm text-[#4a453f] whitespace-pre-wrap">{order.notes}</p>
            </Block>
          )}

          <Block icon={Package} title={`Items (${order.items?.length || 0})`}>
            <ul className="space-y-3">
              {order.items?.map((i, idx) => (
                <li key={idx} className="flex gap-3 items-center bg-[#fdfbf7] rounded-xl p-3">
                  {i.image && <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0a331e] line-clamp-1">{i.name}</p>
                    <p className="text-xs text-[#6b3e1f]">Qty: {i.quantity} × {formatPrice(i.price)}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#0a331e]">{formatPrice(i.line_total)}</p>
                </li>
              ))}
            </ul>
          </Block>

          <Block icon={CreditCard} title="Payment & Total">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b3e1f]">Method</p>
            <p className="text-sm font-semibold text-[#0a331e] mb-3">{order.payment_method?.toUpperCase()}</p>
            <div className="space-y-1 text-sm">
              <Row k="Subtotal" v={formatPrice(order.subtotal)} />
              <Row k="Shipping" v={order.shipping ? formatPrice(order.shipping) : "Free"} />
              <div className="border-t border-[#6b3e1f]/10 pt-2 mt-2 flex items-center justify-between">
                <span className="font-semibold text-[#0a331e]">Total</span>
                <span className="font-display text-xl font-bold text-[#0f4d2e]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </Block>
        </div>
      </aside>
    </div>
  );
}

function Block({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-[#0f4d2e]" />
        <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#6b3e1f]">{title}</span>
      </div>
      <div className="bg-white rounded-xl border border-[#6b3e1f]/10 p-4">{children}</div>
    </div>
  );
}

function Row({ k, v }) {
  return <div className="flex items-center justify-between"><span className="text-[#6b3e1f]">{k}</span><span className="text-[#0a331e] font-semibold">{v}</span></div>;
}
