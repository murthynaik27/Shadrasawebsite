import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Video, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../lib/api";
import { authHeaders } from "../../lib/admin";
import ImageInput, { FormShell, Label, TextInput, EmptyState } from "./_shared";

const EMPTY = { title: "", type: "image", url: "", category: "", is_active: true, sort_order: 0 };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const r = await apiClient.get("/admin/gallery", { headers: authHeaders() });
      setItems(r.data || []);
    } catch (err) {
      toast.error("Failed to load gallery items");
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.url) return toast.error("File/URL is required");
    setSubmitting(true);
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      if (editing === "new") {
        await apiClient.post("/admin/gallery", payload, { headers: authHeaders() });
        toast.success("Added to gallery");
      } else {
        await apiClient.put(`/admin/gallery/${editing}`, payload, { headers: authHeaders() });
        toast.success("Gallery updated");
      }
      setEditing(null);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (item) => {
    if (!window.confirm(`Delete ${item.title || "this item"}?`)) return;
    try {
      await apiClient.delete(`/admin/gallery/${item.id}`, { headers: authHeaders() });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete");
    }
  };

  return (
    <div data-testid="admin-gallery">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Gallery</h1>
          <p className="text-[#6b3e1f] mt-1 text-sm">Manage photos and videos shown on the website.</p>
        </div>
        <button onClick={() => { setEditing("new"); setForm(EMPTY); }} className="inline-flex items-center gap-2 bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-5 py-2.5 text-sm font-semibold">
          <Plus size={16} /> Add Media
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No gallery items yet." action={
          <button onClick={() => { setEditing("new"); setForm(EMPTY); }} className="inline-flex items-center gap-2 bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-5 py-2.5 text-sm font-semibold">
            <Plus size={16} /> Add Media
          </button>
        } />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((it) => (
            <div key={it.id} className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden flex flex-col">
              <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center group">
                {it.type === "video" ? (
                  <>
                    <video src={it.url} className="w-full h-full object-cover" muted loop playsInline onMouseEnter={e => e.target.play()} onMouseLeave={e => e.target.pause()} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <Video className="text-white drop-shadow-md" size={32} />
                    </div>
                  </>
                ) : (
                  <img src={it.url} alt={it.title} className="w-full h-full object-cover" />
                )}
                
                <span className={`absolute top-2 left-2 text-[10px] uppercase tracking-[0.18em] font-bold px-2 py-0.5 rounded-full ${it.is_active ? "bg-[#0f4d2e] text-white" : "bg-gray-400 text-white"}`}>
                  {it.is_active ? "Active" : "Hidden"}
                </span>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(it.id); setForm({ ...EMPTY, ...it }); }} className="p-1.5 bg-white text-[#0f4d2e] rounded-md shadow hover:text-[#d4a017]"><Edit size={14} /></button>
                  <button onClick={() => del(it)} className="p-1.5 bg-white text-red-600 rounded-md shadow hover:text-red-800"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-[#0a331e] truncate">{it.title || "Untitled"}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-[#6b3e1f] font-mono">{it.category || "No Category"}</p>
                  <p className="text-xs text-[#6b3e1f]">Order: {it.sort_order}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <FormShell title={editing === "new" ? "Add Media" : "Edit Media"} onClose={() => { setEditing(null); setForm(EMPTY); }} onSubmit={save} submitting={submitting}>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <Label>Type *</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, url: "" })} className="w-full rounded-xl border border-[#6b3e1f]/20 px-4 py-2.5 text-sm bg-[#fdfbf7]">
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </label>
            <label className="block">
              <Label>Category / Album</Label>
              <TextInput value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Products, Farm" />
            </label>
          </div>
          
          <label className="block">
            <Label>Title / Caption</Label>
            <TextInput value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>

          {form.type === "image" ? (
            <ImageInput value={form.url} onChange={(v) => setForm({ ...form, url: v })} label="Upload Image *" />
          ) : (
            <label className="block">
              <Label>Video URL * (e.g. mp4 link)</Label>
              <TextInput required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              <p className="text-xs text-[#6b3e1f] mt-1">Provide a direct link to an MP4 video file.</p>
            </label>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#0a331e] cursor-pointer pt-6">
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-[#0f4d2e]" />
              Active (show on site)
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
