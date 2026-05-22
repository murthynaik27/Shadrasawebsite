import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../lib/api";
import { authHeaders } from "../../lib/admin";
import ImageInput, { FormShell, Label, TextInput, TextArea, EmptyState } from "./_shared";

const EMPTY = { name: "", slug: "", description: "", image: "", is_active: true, sort_order: 0 };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const r = await apiClient.get("/admin/categories", { headers: authHeaders() });
    setItems(r.data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      if (editing === "new") {
        await apiClient.post("/admin/categories", payload, { headers: authHeaders() });
        toast.success("Category created");
      } else {
        await apiClient.put(`/admin/categories/${editing}`, payload, { headers: authHeaders() });
        toast.success("Category updated");
      }
      setEditing(null);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await apiClient.delete(`/admin/categories/${c.id}`, { headers: authHeaders() });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <div data-testid="admin-categories">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Categories</h1>
          <p className="text-[#6b3e1f] mt-1 text-sm">Group your products into categories.</p>
        </div>
        <button data-testid="add-category-btn" onClick={() => { setEditing("new"); setForm(EMPTY); }} className="inline-flex items-center gap-2 bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-5 py-2.5 text-sm font-semibold">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No categories yet." />
      ) : (
        <div className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-[#fdfbf7]">
              <tr className="text-left">
                {["Name", "Slug", "Status", "Sort", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b3e1f]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-[#6b3e1f]/10 hover:bg-[#fdfbf7]/40">
                  <td className="px-5 py-3 font-semibold text-[#0a331e]">{c.name}</td>
                  <td className="px-5 py-3 text-[#6b3e1f] font-mono text-xs">{c.slug}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] uppercase tracking-[0.18em] font-bold px-2 py-0.5 rounded-full ${c.is_active ? "bg-[#0f4d2e] text-white" : "bg-gray-400 text-white"}`}>
                      {c.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#6b3e1f]">{c.sort_order || 0}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(c.id); setForm({ ...EMPTY, ...c }); }} className="text-[#0f4d2e] hover:text-[#d4a017]"><Edit size={16} /></button>
                      <button onClick={() => del(c)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {editing && (
        <FormShell title={editing === "new" ? "Add Category" : "Edit Category"} onClose={() => { setEditing(null); setForm(EMPTY); }} onSubmit={save} submitting={submitting}>
          <label className="block">
            <Label>Name *</Label>
            <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="cf-name" />
          </label>
          <label className="block">
            <Label>Slug (auto if empty)</Label>
            <TextInput value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </label>
          <label className="block">
            <Label>Description</Label>
            <TextArea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <ImageInput value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Category Image" />
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#0a331e] cursor-pointer pt-6">
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-[#0f4d2e]" />
              Active
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
