import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "../../lib/api";
import { authHeaders, fmtDate } from "../../lib/admin";

const STATUSES = ["new", "contacted", "confirmed", "delivered", "cancelled"];

export default function AdminEnquiries() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const r = await apiClient.get("/admin/enquiries", { headers: authHeaders() });
    setItems(r.data || []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    try {
      await apiClient.put(`/admin/enquiries/${id}/status`, { status }, { headers: authHeaders() });
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  const shown = filter === "all" ? items : items.filter((i) => (i.status || "new") === filter);

  return (
    <div data-testid="admin-enquiries">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Product Enquiries</h1>
          <p className="text-[#6b3e1f] mt-1 text-sm">Track and manage incoming product enquiries.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-[#6b3e1f]/20 px-4 py-2.5 text-sm bg-white">
          <option value="all">All ({items.length})</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s} ({items.filter((i) => (i.status || "new") === s).length})</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden">
        {shown.length === 0 ? (
          <p className="p-12 text-center text-[#6b3e1f]">No enquiries.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fdfbf7]">
                <tr className="text-left">
                  {["Date", "Product", "Customer", "Phone", "Qty", "Message", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b3e1f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id} className="border-t border-[#6b3e1f]/10 hover:bg-[#fdfbf7]/40 align-top">
                    <td className="px-5 py-3 whitespace-nowrap text-[#6b3e1f] text-xs">{fmtDate(e.created_at)}</td>
                    <td className="px-5 py-3 font-semibold text-[#0a331e]">{e.product}</td>
                    <td className="px-5 py-3"><div className="text-[#0a331e]">{e.name}</div><div className="text-xs text-[#6b3e1f]">{e.email}</div></td>
                    <td className="px-5 py-3 text-[#0a331e]">{e.phone}</td>
                    <td className="px-5 py-3 text-[#6b3e1f]">{e.quantity || "—"}</td>
                    <td className="px-5 py-3 text-[#4a453f] max-w-xs"><div className="line-clamp-2">{e.message || "—"}</div></td>
                    <td className="px-5 py-3">
                      <select value={e.status || "new"} onChange={(ev) => update(e.id, ev.target.value)} className="rounded-lg border border-[#6b3e1f]/20 px-2 py-1.5 text-xs bg-white">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
