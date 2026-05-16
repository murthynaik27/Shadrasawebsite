import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../lib/api";
import { authHeaders, formatPrice } from "../../lib/admin";
import ImageInput, { FormShell, Label, TextInput, TextArea, EmptyState } from "./_shared";

const EMPTY = {
  name: "", tagline: "", description: "", category_id: "", price: 0, sale_price: null,
  currency: "INR", stock: 0, image: "", premium_badge: "Premium Batch",
  is_featured: false, is_active: true, sort_order: 0,
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [p, c] = await Promise.all([
      apiClient.get("/admin/products", { headers: authHeaders() }),
      apiClient.get("/admin/categories", { headers: authHeaders() }),
    ]);
    setItems(p.data || []);
    setCats(c.data || []);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing("new"); setForm(EMPTY); };
  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ ...EMPTY, ...p, sale_price: p.sale_price ?? null });
  };
  const close = () => { setEditing(null); setForm(EMPTY); };

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock: Number(form.stock) || 0,
        sort_order: Number(form.sort_order) || 0,
      };
      if (editing === "new") {
        await apiClient.post("/admin/products", payload, { headers: authHeaders() });
        toast.success("Product created");
      } else {
        await apiClient.put(`/admin/products/${editing}`, payload, { headers: authHeaders() });
        toast.success("Product updated");
      }
      close();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await apiClient.delete(`/admin/products/${p.id}`, { headers: authHeaders() });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete");
    }
  };

  return (
    <div data-testid="admin-products">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Products</h1>
          <p className="text-[#6b3e1f] mt-1 text-sm">Manage all products shown on your website.</p>
        </div>
        <button
          data-testid="add-product-btn"
          onClick={startNew}
          className="inline-flex items-center gap-2 bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No products yet — add your first product." action={
          <button onClick={startNew} className="inline-flex items-center gap-2 bg-[#0f4d2e] text-white rounded-full px-5 py-2.5 text-sm font-semibold">
            <Plus size={16} /> Add Product
          </button>
        } />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden flex flex-col" data-testid={`product-row-${p.id}`}>
              <div className="aspect-[4/3] bg-[#fdfbf7] overflow-hidden relative">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : null}
                {p.is_featured && (
                  <span className="absolute top-3 left-3 bg-[#d4a017] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} /> Featured
                  </span>
                )}
                <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full ${p.is_active ? "bg-[#0f4d2e] text-white" : "bg-gray-400 text-white"}`}>
                  {p.is_active ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-display text-lg font-semibold text-[#0a331e] line-clamp-1">{p.name}</h3>
                <p className="text-xs text-[#6b3e1f] mb-2">{p.category_name || "—"}</p>
                <p className="text-sm text-[#4a453f] line-clamp-2 flex-1">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-semibold text-[#0f4d2e]">{formatPrice(p.price, p.currency)}</p>
                  <p className="text-xs text-[#6b3e1f]">Stock: {p.stock}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => startEdit(p)} data-testid={`edit-${p.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#fdfbf7] hover:bg-[#0f4d2e] hover:text-white text-[#0a331e] rounded-lg px-3 py-2 text-xs font-semibold transition-colors">
                    <Edit size={13} /> Edit
                  </button>
                  <button onClick={() => del(p)} data-testid={`delete-${p.id}`} className="inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg px-3 py-2 text-xs font-semibold transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <FormShell title={editing === "new" ? "Add Product" : "Edit Product"} onClose={close} onSubmit={save} submitting={submitting}>
          <label className="block">
            <Label>Product Name *</Label>
            <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="pf-name" />
          </label>
          <label className="block">
            <Label>Tagline</Label>
            <TextInput value={form.tagline || ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="e.g. Heritage Mango Pickle" />
          </label>
          <label className="block">
            <Label>Description *</Label>
            <TextArea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="pf-description" />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <Label>Category</Label>
              <select value={form.category_id || ""} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full rounded-xl border border-[#6b3e1f]/20 px-4 py-2.5 text-sm bg-[#fdfbf7]">
                <option value="">— None —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <Label>Premium Badge</Label>
              <TextInput value={form.premium_badge || ""} onChange={(e) => setForm({ ...form, premium_badge: e.target.value })} placeholder="e.g. Premium Batch" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <Label>Price (₹) *</Label>
              <TextInput type="number" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="pf-price" />
            </label>
            <label className="block">
              <Label>Sale Price (₹)</Label>
              <TextInput type="number" min="0" value={form.sale_price ?? ""} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
            </label>
            <label className="block">
              <Label>Stock *</Label>
              <TextInput type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} data-testid="pf-stock" />
            </label>
          </div>
          <ImageInput value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Product Image" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#0a331e] cursor-pointer pt-6">
              <input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4 accent-[#0f4d2e]" />
              Featured
            </label>
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
