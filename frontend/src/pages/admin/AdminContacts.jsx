import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "../../lib/api";
import { authHeaders, fmtDate } from "../../lib/admin";

const STATUSES = ["new", "read", "replied", "closed"];

export default function AdminContacts() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const r = await apiClient.get("/admin/contacts", { headers: authHeaders() });
    setItems(r.data || []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    try {
      await apiClient.put(`/admin/contacts/${id}/status`, { status }, { headers: authHeaders() });
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <div data-testid="admin-contacts">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e] mb-2">Contact Form Submissions</h1>
      <p className="text-[#6b3e1f] mb-6 text-sm">Messages from your website contact form.</p>

      <div className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden">
        {items.length === 0 ? (
          <p className="p-12 text-center text-[#6b3e1f]">No messages yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fdfbf7]">
                <tr className="text-left">
                  {["Date", "Name", "Email", "Phone", "Subject", "Message", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b3e1f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t border-[#6b3e1f]/10 hover:bg-[#fdfbf7]/40 align-top">
                    <td className="px-5 py-3 whitespace-nowrap text-[#6b3e1f] text-xs">{fmtDate(c.created_at)}</td>
                    <td className="px-5 py-3 font-semibold text-[#0a331e]">{c.name}</td>
                    <td className="px-5 py-3 text-[#0a331e]">{c.email}</td>
                    <td className="px-5 py-3 text-[#0a331e]">{c.phone || "—"}</td>
                    <td className="px-5 py-3 text-[#0a331e]">{c.subject || "—"}</td>
                    <td className="px-5 py-3 text-[#4a453f] max-w-md"><div className="line-clamp-3 whitespace-pre-wrap">{c.message}</div></td>
                    <td className="px-5 py-3">
                      <select value={c.status || "new"} onChange={(ev) => update(c.id, ev.target.value)} className="rounded-lg border border-[#6b3e1f]/20 px-2 py-1.5 text-xs bg-white">
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
