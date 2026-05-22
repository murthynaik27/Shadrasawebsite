import { useEffect, useState } from "react";
import { Edit, Trash2, Star, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../lib/api";
import { authHeaders } from "../../lib/admin";
import { useSiteData } from "../../lib/siteData";
import ImageInput, { FormShell, Label, TextInput, TextArea, EmptyState } from "./_shared";

export default function AdminReviews() {
  const { refreshSiteData } = useSiteData();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const r = await apiClient.get("/admin/reviews", { headers: authHeaders() });
      setItems(r.data || []);
    } catch (err) {
      toast.error("Failed to load reviews");
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.put(`/admin/reviews/${editing}`, form, { headers: authHeaders() });
      toast.success("Review updated");
      setEditing(null);
      setForm(null);
      load();
      refreshSiteData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (item) => {
    if (!window.confirm(`Delete review from ${item.name}?`)) return;
    try {
      await apiClient.delete(`/admin/reviews/${item.id}`, { headers: authHeaders() });
      toast.success("Deleted");
      load();
      refreshSiteData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete");
    }
  };

  const updateStatus = async (item, status) => {
    try {
      await apiClient.put(`/admin/reviews/${item.id}`, { ...item, status }, { headers: authHeaders() });
      toast.success(`Review ${status}`);
      load();
      refreshSiteData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update status");
    }
  };

  return (
    <div data-testid="admin-reviews">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Customer Reviews</h1>
          <p className="text-[#6b3e1f] mt-1 text-sm">Approve, reject, or feature customer testimonials.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No reviews yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.id} className="rounded-2xl bg-white border border-[#6b3e1f]/10 p-6 flex flex-col relative group shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#0f4d2e]/10 text-[#0f4d2e] font-display font-semibold flex items-center justify-center">
                      {it.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#0a331e]">{it.name}</p>
                    <p className="text-xs text-[#6b3e1f]">{it.location || "Customer"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} className={star <= it.rating ? "fill-[#d4a017] text-[#d4a017]" : "text-gray-200"} />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-[#4a453f] italic flex-1 mb-6">"{it.text}"</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[#6b3e1f]/10">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    it.status === "approved" ? "bg-green-100 text-green-700" :
                    it.status === "featured" ? "bg-yellow-100 text-yellow-700" :
                    it.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {it.status}
                  </span>
                  {it.is_verified_purchase && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Verified</span>
                  )}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {it.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(it, "approved")} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md" title="Approve"><CheckCircle size={16} /></button>
                      <button onClick={() => updateStatus(it, "rejected")} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md" title="Reject"><XCircle size={16} /></button>
                    </>
                  )}
                  <button onClick={() => { setEditing(it.id); setForm(it); }} className="p-1.5 text-[#0f4d2e] hover:bg-[#0f4d2e]/10 rounded-md" title="Edit"><Edit size={16} /></button>
                  <button onClick={() => del(it)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && form && (
        <FormShell title="Edit Review" onClose={() => { setEditing(null); setForm(null); }} onSubmit={save} submitting={submitting}>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <Label>Name *</Label>
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="block">
              <Label>Location</Label>
              <TextInput value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </label>
          </div>
          
          <label className="block">
            <Label>Rating (1-5) *</Label>
            <TextInput type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} required />
          </label>
          
          <label className="block">
            <Label>Review Text *</Label>
            <TextArea rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
          </label>

          <ImageInput value={form.image || ""} onChange={(v) => setForm({ ...form, image: v })} label="Customer Photo (Optional)" />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="block">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-[#6b3e1f]/20 px-4 py-2.5 text-sm bg-[#fdfbf7]">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="featured">Featured</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#0a331e] cursor-pointer pt-6">
              <input type="checkbox" checked={!!form.is_verified_purchase} onChange={(e) => setForm({ ...form, is_verified_purchase: e.target.checked })} className="h-4 w-4 accent-[#0f4d2e]" />
              Verified Purchase Badge
            </label>
          </div>
        </FormShell>
      )}
    </div>
  );
}
