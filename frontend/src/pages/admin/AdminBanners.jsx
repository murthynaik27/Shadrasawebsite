import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiClient, getImageUrl } from "../../lib/api";
import { authHeaders } from "../../lib/admin";
import { useSiteData } from "../../lib/siteData";
import ImageInput, { FormShell, Label, TextInput, EmptyState } from "./_shared";

const EMPTY = { title: "", subtitle: "", image: "", cta_label: "", cta_href: "", is_active: true, sort_order: 0 };

export default function AdminBanners() {
  const { refreshSiteData } = useSiteData();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const r = await apiClient.get("/admin/banners", { headers: authHeaders() });
    setItems(r.data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      if (editing === "new") {
        await apiClient.post("/admin/banners", payload, { headers: authHeaders() });
        toast.success("Banner created");
      } else {
        await apiClient.put(`/admin/banners/${editing}`, payload, { headers: authHeaders() });
        toast.success("Banner updated");
      }
      setEditing(null);
      setForm(EMPTY);
      load();
      refreshSiteData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = async (b) => {
    try {
      await apiClient.put(`/admin/banners/${b.id}`, { ...b, is_active: !b.is_active }, { headers: authHeaders() });
      load();
      refreshSiteData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  const del = async (b) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await apiClient.delete(`/admin/banners/${b.id}`, { headers: authHeaders() });
      toast.success("Deleted");
      load();
      refreshSiteData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <div data-testid="admin-banners">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Hero Banners</h1>
          <p className="text-[#6b3e1f] mt-1 text-sm">Slideshow images on your homepage hero section.</p>
        </div>
        <button data-testid="add-banner-btn" onClick={() => { setEditing("new"); setForm(EMPTY); }} className="inline-flex items-center gap-2 bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-5 py-2.5 text-sm font-semibold">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No banners yet — add your first slide." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden">
              <div className="relative aspect-[16/9] bg-[#fdfbf7] overflow-hidden">
                {b.image && <img src={getImageUrl(b.image)} alt={b.title || "banner"} className="w-full h-full object-cover" />}
                <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full ${b.is_active ? "bg-[#0f4d2e] text-white" : "bg-gray-500 text-white"}`}>
                  {b.is_active ? "Live" : "Hidden"}
                </span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-[#0a331e] text-sm">{b.title || "Untitled"}</p>
                <p className="text-xs text-[#6b3e1f] line-clamp-1">{b.subtitle || "—"}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => toggle(b)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#fdfbf7] hover:bg-[#0f4d2e] hover:text-white text-[#0a331e] rounded-lg px-3 py-2 text-xs font-semibold">
                    {b.is_active ? <EyeOff size={13} /> : <Eye size={13} />} {b.is_active ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => { setEditing(b.id); setForm({ ...EMPTY, ...b }); }} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#fdfbf7] hover:bg-[#d4a017] hover:text-white text-[#0a331e] rounded-lg px-3 py-2 text-xs font-semibold">
                    <Edit size={13} /> Edit
                  </button>
                  <button onClick={() => del(b)} className="inline-flex items-center justify-center bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg px-3 py-2 text-xs font-semibold">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <FormShell title={editing === "new" ? "Add Banner" : "Edit Banner"} onClose={() => { setEditing(null); setForm(EMPTY); }} onSubmit={save} submitting={submitting}>
          <ImageInput value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Banner Image *" />
          <label className="block">
            <Label>Title (optional)</Label>
            <TextInput value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="block">
            <Label>Subtitle (optional)</Label>
            <TextInput value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#0a331e] cursor-pointer pt-6">
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-[#0f4d2e]" />
              Active (show in slideshow)
            </label>
            <label className="block">
              <Label>Sort Order</Label>
              <TextInput type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </label>
          </div>
        </FormShell>
      )}
    </div>
  );
}
