import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import { apiClient, getImageUrl } from "../../lib/api";
import { authHeaders, formatPrice } from "../../lib/admin";
import { useSiteData } from "../../lib/siteData";
import ImageInput, { FormShell, Label, TextInput, TextArea, EmptyState } from "./_shared";
import OptimizedImage from "../../components/ui/OptimizedImage";

const EMPTY = {
  name: "", tagline: "", description: "", category_id: "", 
  weight_options: [], image: "", premium_badge: "Premium Batch",
  is_featured: false, is_active: true, sort_order: 0,
};

export default function AdminProducts() {
  const { refreshSiteData } = useSiteData();
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(null);

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
    setForm({ ...EMPTY, ...p, weight_options: p.weight_options || [] });
  };
  const close = () => { setEditing(null); setForm(EMPTY); };

  const handleProductClick = (p) => {
    if (loadingProduct) return;
    setLoadingProduct(p.id);
    setTimeout(() => {
      setLoadingProduct(null);
      startEdit(p);
    }, 800);
  };

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        sort_order: Number(form.sort_order) || 0,
        weight_options: (form.weight_options || []).map(opt => ({
          ...opt,
          weight: Number(opt.weight) || 0,
          price: Number(opt.price) || 0,
          sale_price: opt.sale_price ? Number(opt.sale_price) : null,
          stock: Number(opt.stock) || 0,
        }))
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
      refreshSiteData();
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
      refreshSiteData();
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
            <div
              key={p.id}
              className={`group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#6b3e1f]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(212,160,23,0.15)] hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer ${loadingProduct === p.id ? 'scale-95 opacity-90' : ''}`}
              data-testid={`product-row-${p.id}`}
              onClick={() => handleProductClick(p)}
            >
              <div className="aspect-[4/3] bg-[#fdfbf7] overflow-hidden relative">
                {p.image ? (
                  <>
                    <OptimizedImage 
                      src={p.image} 
                      blurData={p.blur_image}
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                      containerClassName="absolute inset-0"
                    />
                    {/* Glassmorphism Hover Overlay */}
                    <div className="absolute inset-4 bg-[#0a331e]/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center rounded-xl">
                      <span className="bg-white/95 text-[#0f4d2e] font-semibold px-6 py-2.5 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl flex items-center gap-2">
                        <Eye size={16} /> Quick Edit
                      </span>
                    </div>
                  </>
                ) : null}
                {/* Click Loading Animation */}
                {loadingProduct === p.id && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#0f4d2e]/20 border-t-[#d4a017] rounded-full animate-spin"></div>
                  </div>
                )}
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
                  <p className="font-semibold text-[#0f4d2e]">
                    {p.weight_options && p.weight_options.length > 0 
                      ? `${formatPrice(p.weight_options[0].price, p.currency)} (${p.weight_options.length} options)` 
                      : formatPrice(p.price, p.currency)}
                  </p>
                  <p className="text-xs text-[#6b3e1f]">Stock: {p.stock}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); startEdit(p); }} data-testid={`edit-${p.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#fdfbf7] hover:bg-[#0f4d2e] hover:text-white text-[#0a331e] rounded-lg px-3 py-2 text-xs font-semibold transition-colors">
                    <Edit size={13} /> Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); del(p); }} data-testid={`delete-${p.id}`} className="inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg px-3 py-2 text-xs font-semibold transition-colors">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Weight Options *</Label>
              <button type="button" onClick={() => setForm({ ...form, weight_options: [...(form.weight_options || []), { weight: "", unit: "g", price: 0, sale_price: "", stock: 0, image: "" }] })} className="text-xs bg-[#0f4d2e]/10 text-[#0f4d2e] px-3 py-1.5 rounded-full font-semibold hover:bg-[#0f4d2e]/20 transition-colors">
                + Add Option
              </button>
            </div>
            {(form.weight_options || []).length === 0 ? (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">At least one weight option is required.</p>
            ) : (
              <div className="space-y-3">
                {form.weight_options.map((opt, idx) => (
                  <div key={idx} className="flex flex-col gap-3 p-4 bg-[#fdfbf7] border border-[#6b3e1f]/10 rounded-xl relative group">
                    <button type="button" onClick={() => setForm({ ...form, weight_options: form.weight_options.filter((_, i) => i !== idx) })} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200 z-10">
                      <Trash2 size={12} />
                    </button>
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="flex-1 min-w-[80px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b3e1f] mb-1 block">Weight</span>
                        <TextInput type="number" min="0" step="any" required value={opt.weight} onChange={(e) => { const newOpts = [...form.weight_options]; newOpts[idx].weight = e.target.value; setForm({ ...form, weight_options: newOpts }); }} placeholder="500" />
                      </label>
                      <label className="w-24">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b3e1f] mb-1 block">Unit</span>
                        <select value={opt.unit || "g"} onChange={(e) => { const newOpts = [...form.weight_options]; newOpts[idx].unit = e.target.value; setForm({ ...form, weight_options: newOpts }); }} className="w-full rounded-xl border border-[#6b3e1f]/20 px-3 py-[9px] text-sm bg-white">
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="L">L</option>
                        </select>
                      </label>
                      <label className="flex-1 min-w-[80px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b3e1f] mb-1 block">Price (₹)</span>
                        <TextInput type="number" min="0" required value={opt.price} onChange={(e) => { const newOpts = [...form.weight_options]; newOpts[idx].price = e.target.value; setForm({ ...form, weight_options: newOpts }); }} />
                      </label>
                      <label className="flex-1 min-w-[80px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b3e1f] mb-1 block">Sale (₹)</span>
                        <TextInput type="number" min="0" value={opt.sale_price ?? ""} onChange={(e) => { const newOpts = [...form.weight_options]; newOpts[idx].sale_price = e.target.value; setForm({ ...form, weight_options: newOpts }); }} />
                      </label>
                      <label className="w-24">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b3e1f] mb-1 block">Stock</span>
                        <TextInput type="number" min="0" required value={opt.stock} onChange={(e) => { const newOpts = [...form.weight_options]; newOpts[idx].stock = e.target.value; setForm({ ...form, weight_options: newOpts }); }} />
                      </label>
                    </div>
                    <div className="mt-2">
                      <ImageInput value={opt.image || ""} onChange={(v) => { const newOpts = [...form.weight_options]; newOpts[idx].image = v; setForm({ ...form, weight_options: newOpts }); }} label={`Image for ${opt.weight}${opt.unit || "g"}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
