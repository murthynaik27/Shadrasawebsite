import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, Printer, Download, Search, X, ChevronLeft, Package, User, MapPin, Receipt, Trash2 } from "lucide-react";
import { apiClient, LOGO_URL } from "../../lib/api";
import { authHeaders, fmtDate, formatPrice } from "../../lib/admin";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null); // active invoice for viewing/printing
  const [isCreating, setIsCreating] = useState(false);
  const [products, setProducts] = useState([]);

  const load = async () => {
    try {
      const [invRes, prodRes] = await Promise.all([
        apiClient.get("/admin/invoices", { headers: authHeaders() }),
        apiClient.get("/admin/products", { headers: authHeaders() })
      ]);
      setInvoices(invRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await apiClient.delete(`/admin/invoices/${id}`, { headers: authHeaders() });
      toast.success("Invoice deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete invoice");
    }
  };

  const updateStatus = async (id, currentInvoice, newStatus) => {
    try {
      await apiClient.put(`/admin/invoices/${id}`, { ...currentInvoice, payment_status: newStatus }, { headers: authHeaders() });
      toast.success("Payment status updated");
      load();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const shown = invoices.filter(i => 
    i.invoice_no.toLowerCase().includes(search.toLowerCase()) || 
    i.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    i.phone.includes(search)
  );

  return (
    <div data-testid="admin-invoices">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 print:hidden">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Invoices</h1>
          <p className="text-[#6b3e1f] mt-1 text-sm">Wholesale and Retailer Billing System.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b3e1f]/50" size={16} />
            <input 
              type="text" 
              placeholder="Search bills..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-[#6b3e1f]/20 text-sm w-48 md:w-64 bg-white focus:outline-none focus:border-[#0f4d2e]"
            />
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-[#0f4d2e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a331e] transition-colors"
          >
            <Plus size={16} /> Create Bill
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#6b3e1f]/10 overflow-hidden print:hidden">
        {shown.length === 0 ? (
          <p className="p-12 text-center text-[#6b3e1f]">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fdfbf7]">
                <tr className="text-left">
                  {["Invoice #", "Date", "Shop / Retailer", "Total", "Payment", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b3e1f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((inv) => (
                  <tr key={inv.id} className="border-t border-[#6b3e1f]/10 hover:bg-[#fdfbf7]/40">
                    <td className="px-5 py-3 font-mono text-xs text-[#0f4d2e] font-semibold">{inv.invoice_no}</td>
                    <td className="px-5 py-3 text-xs text-[#6b3e1f] whitespace-nowrap">{fmtDate(inv.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="text-[#0a331e] font-semibold">{inv.shop_name}</div>
                      <div className="text-xs text-[#6b3e1f]">{inv.phone}</div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#0f4d2e]">{formatPrice(inv.total)}</td>
                    <td className="px-5 py-3">
                      <select 
                        value={inv.payment_status} 
                        onChange={(e) => updateStatus(inv.id, inv, e.target.value)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold border border-[#6b3e1f]/15 focus:outline-none ${
                          inv.payment_status === "Paid" ? "bg-emerald-100 text-emerald-700" :
                          inv.payment_status === "Partial" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setActive(inv)} className="text-[#0f4d2e] hover:text-[#d4a017] text-xs font-semibold mr-4">View</button>
                      <button onClick={() => handleDelete(inv.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreating && <InvoiceFormDrawer onClose={() => setIsCreating(false)} onSaved={load} products={products} />}
      {active && <InvoiceViewDrawer invoice={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function InvoiceFormDrawer({ onClose, onSaved, products }) {
  const [formData, setFormData] = useState({
    shop_name: "", owner_name: "", phone: "", address: "", gst_number: "",
    notes: "", payment_status: "Pending", discount: 0, tax_rate: 0
  });
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  const addItem = () => setItems([...items, { product_id: "", name: "", quantity: 1, weight: "", unit: "g", price: 0, line_total: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx, field, val) => {
    const newItems = [...items];
    const it = newItems[idx];
    it[field] = val;
    
    if (field === "product_id") {
      const p = products.find(prod => prod.id === val);
      if (p) {
        it.name = p.name;
        it.price = p.sale_price || p.price;
        it.weight = p.weight || "";
        it.unit = p.unit || "g";
      }
    }
    
    it.line_total = (it.quantity || 0) * (it.price || 0);
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, i) => sum + (i.line_total || 0), 0);
  const discountAmt = parseFloat(formData.discount) || 0;
  const afterDiscount = Math.max(0, subtotal - discountAmt);
  const taxRate = parseFloat(formData.tax_rate) || 0;
  const taxAmt = (afterDiscount * taxRate) / 100;
  const finalTotal = afterDiscount + taxAmt;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Add at least one item to the bill");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        items,
        subtotal,
        discount: discountAmt,
        tax_rate: taxRate,
        tax_amount: taxAmt,
        total: finalTotal
      };
      await apiClient.post("/admin/invoices", payload, { headers: authHeaders() });
      toast.success("Invoice created successfully");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-[#6b3e1f]/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-xl font-semibold text-[#0a331e]">Create Invoice</h2>
          <button onClick={onClose} className="p-2 text-[#6b3e1f] hover:bg-[#fdfbf7] rounded-full"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2 md:col-span-1">
              <label className="text-xs font-semibold text-[#0a331e]">Shop / Retailer Name *</label>
              <input required value={formData.shop_name} onChange={e => setFormData({...formData, shop_name: e.target.value})} className="w-full rounded-lg border border-[#6b3e1f]/20 p-2 text-sm" />
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1">
              <label className="text-xs font-semibold text-[#0a331e]">Owner Name *</label>
              <input required value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} className="w-full rounded-lg border border-[#6b3e1f]/20 p-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0a331e]">Phone *</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-lg border border-[#6b3e1f]/20 p-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0a331e]">GST Number (Optional)</label>
              <input value={formData.gst_number} onChange={e => setFormData({...formData, gst_number: e.target.value})} className="w-full rounded-lg border border-[#6b3e1f]/20 p-2 text-sm" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-[#0a331e]">Address *</label>
              <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full rounded-lg border border-[#6b3e1f]/20 p-2 text-sm h-16" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0a331e] uppercase tracking-wider">Bill Items</h3>
              <button type="button" onClick={addItem} className="text-xs font-semibold text-[#0f4d2e] flex items-center gap-1"><Plus size={14}/> Add Item</button>
            </div>
            {items.map((it, i) => (
              <div key={i} className="flex flex-wrap items-end gap-2 bg-[#fdfbf7] p-3 rounded-lg border border-[#6b3e1f]/10">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] uppercase text-[#6b3e1f]">Product</label>
                  <select value={it.product_id} onChange={e => updateItem(i, "product_id", e.target.value)} className="w-full rounded bg-white border border-[#6b3e1f]/20 p-1.5 text-xs">
                    <option value="">-- Custom Item --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.weight}{p.unit})</option>)}
                  </select>
                </div>
                {it.product_id === "" && (
                  <div className="w-32">
                     <label className="text-[10px] uppercase text-[#6b3e1f]">Name</label>
                     <input value={it.name} onChange={e => updateItem(i, "name", e.target.value)} className="w-full rounded bg-white border border-[#6b3e1f]/20 p-1.5 text-xs" />
                  </div>
                )}
                <div className="w-16">
                  <label className="text-[10px] uppercase text-[#6b3e1f]">Qty</label>
                  <input type="number" min="1" value={it.quantity} onChange={e => updateItem(i, "quantity", parseInt(e.target.value)||0)} className="w-full rounded bg-white border border-[#6b3e1f]/20 p-1.5 text-xs" />
                </div>
                <div className="w-20">
                  <label className="text-[10px] uppercase text-[#6b3e1f]">Price</label>
                  <input type="number" step="0.01" value={it.price} onChange={e => updateItem(i, "price", parseFloat(e.target.value)||0)} className="w-full rounded bg-white border border-[#6b3e1f]/20 p-1.5 text-xs" />
                </div>
                <div className="w-20">
                  <label className="text-[10px] uppercase text-[#6b3e1f]">Total</label>
                  <div className="p-1.5 text-xs font-semibold">{formatPrice(it.line_total)}</div>
                </div>
                <button type="button" onClick={() => removeItem(i)} className="text-red-500 p-1.5 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
              </div>
            ))}
            {items.length === 0 && <p className="text-xs text-[#6b3e1f] text-center p-4 border border-dashed rounded">No items added.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#fdfbf7] p-4 rounded-xl border border-[#6b3e1f]/10">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0a331e]">Discount (₹)</label>
                <input type="number" step="0.01" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-full rounded-lg border border-[#6b3e1f]/20 p-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0a331e]">Tax Rate (%)</label>
                <input type="number" step="0.1" value={formData.tax_rate} onChange={e => setFormData({...formData, tax_rate: e.target.value})} className="w-full rounded-lg border border-[#6b3e1f]/20 p-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0a331e]">Payment Status</label>
                <select value={formData.payment_status} onChange={e => setFormData({...formData, payment_status: e.target.value})} className="w-full rounded-lg border border-[#6b3e1f]/20 p-2 text-sm bg-white">
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="space-y-2 text-sm flex flex-col justify-end">
              <div className="flex justify-between text-[#6b3e1f]"><span>Subtotal:</span> <span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-[#6b3e1f]"><span>Discount:</span> <span>-{formatPrice(discountAmt)}</span></div>
              <div className="flex justify-between text-[#6b3e1f]"><span>Tax ({taxRate}%):</span> <span>+{formatPrice(taxAmt)}</span></div>
              <div className="flex justify-between text-[#0a331e] font-bold text-lg pt-2 border-t border-[#6b3e1f]/20">
                <span>Total:</span> <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
             <label className="text-xs font-semibold text-[#0a331e]">Notes</label>
             <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full rounded-lg border border-[#6b3e1f]/20 p-2 text-sm h-16" />
          </div>

          <div className="mt-auto pt-4 border-t border-[#6b3e1f]/10 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#6b3e1f] hover:bg-[#fdfbf7]">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-[#0f4d2e] text-white rounded-xl text-sm font-semibold disabled:opacity-50">
              {saving ? "Saving..." : "Save Invoice"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function InvoiceViewDrawer({ invoice, onClose }) {
  const invoiceRef = useRef(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const getInvoicePdfBlob = async () => {
    if (!invoiceRef.current) {
      throw new Error("Invoice view is not available for PDF generation.");
    }
    setIsPdfGenerating(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: invoiceRef.current.scrollWidth,
        windowHeight: invoiceRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pageWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > -0.1) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pageWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output("blob");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const downloadInvoicePdf = async () => {
    try {
      const blob = await getInvoicePdfBlob();
      const fileName = `Invoice-${invoice.invoice_no}.pdf`;
      const file = new File([blob], fileName, { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Invoice PDF downloaded.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to generate invoice PDF. Please try again.");
    }
  };

  const uploadInvoicePdf = async (blob) => {
    const fileName = `Invoice-${invoice.invoice_no}.pdf`;
    const file = new File([blob], fileName, { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/admin/invoices/upload", formData, {
      headers: {
        ...authHeaders(),
      },
    });
    return response.data?.url;
  };

  const shareInvoicePdf = async () => {
    try {
      const blob = await getInvoicePdfBlob();
      const file = new File([blob], `Invoice-${invoice.invoice_no}.pdf`, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice ${invoice.invoice_no}`,
          text: `Invoice ${invoice.invoice_no} from Shadrasa`,
        });
        return;
      }

      const pdfUrl = await uploadInvoicePdf(blob);
      if (!pdfUrl) {
        throw new Error("Unable to generate sharable invoice link.");
      }

      const shareText = `Invoice ${invoice.invoice_no} Total: ${formatPrice(invoice.total)}. Download the invoice here: ${pdfUrl}`;
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${invoice.invoice_no}`,
          text: shareText,
          url: pdfUrl,
        });
        return;
      }

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.location.href = whatsappUrl;
      toast.success("WhatsApp opened with invoice download link.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to share invoice. Please download the PDF and share it manually.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 flex justify-end print:hidden" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <aside className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl flex flex-col">
          <div className="sticky top-0 bg-white border-b border-[#6b3e1f]/10 px-6 py-4 flex items-center justify-between gap-2">
            <button onClick={onClose} className="inline-flex items-center gap-2 text-[#6b3e1f] hover:text-[#0a331e] text-sm font-semibold">
              <ChevronLeft size={18} /> Back
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={downloadInvoicePdf}
                disabled={isPdfGenerating}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#6b3e1f]/20 text-xs font-semibold hover:bg-[#fdfbf7] text-[#0f4d2e] disabled:opacity-50"
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                onClick={shareInvoicePdf}
                disabled={isPdfGenerating}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#6b3e1f]/20 text-xs font-semibold hover:bg-[#fdfbf7] text-green-700 disabled:opacity-50"
              >
                WhatsApp
              </button>
              <button onClick={handlePrint} className="inline-flex items-center gap-1 bg-[#0f4d2e] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0a331e]">
                <Printer size={14} /> Print
              </button>
            </div>
          </div>

          <div className="p-4 md:p-8 overflow-x-auto">
            <div className="min-w-[600px] md:min-w-0" ref={invoiceRef}>
              <PrintableInvoice invoice={invoice} />
            </div>
          </div>
        </aside>
      </div>

      <div className="hidden print:block bg-white text-black print:absolute print:left-0 print:top-0 print:w-full print:m-0 print:p-0">
        <PrintableInvoice invoice={invoice} forPrint />
      </div>
    </>
  );
}

function PrintableInvoice({ invoice, forPrint }) {
  return (
    <div className={`bg-white text-black ${forPrint ? '' : 'border border-gray-200 shadow-sm p-4 md:p-8 rounded-lg'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#0f4d2e] pb-4 md:pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <img src={LOGO_URL} alt="Logo" className="h-10 w-10" crossOrigin="anonymous" />
             <h1 className="text-3xl font-bold text-[#0f4d2e] uppercase tracking-wider">Shadrasa</h1>
          </div>
          <p className="text-sm text-gray-600 w-48">Premium Homemade Pickles & Pure Natural Honey</p>
        </div>
        <div className="sm:text-right">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">INVOICE</h2>
          <p className="text-sm font-semibold text-gray-600"># {invoice.invoice_no}</p>
          <p className="text-sm text-gray-500 mt-1">Date: {fmtDate(invoice.created_at)}</p>
          <div className="mt-2 inline-block px-2 py-1 text-xs font-bold uppercase rounded border border-gray-300 text-gray-700">
            {invoice.payment_status}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Bill To:</p>
          <h3 className="text-lg font-bold text-gray-800">{invoice.shop_name}</h3>
          <p className="text-sm text-gray-800">{invoice.owner_name}</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap max-w-[200px] mt-1">{invoice.address}</p>
          <p className="text-sm text-gray-600 mt-1">Phone: {invoice.phone}</p>
          {invoice.gst_number && <p className="text-sm font-semibold text-gray-800 mt-1">GSTIN: {invoice.gst_number}</p>}
        </div>
      </div>

      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-b-2 border-gray-800 text-gray-800">
            <th className="py-2 text-left">Item Description</th>
            <th className="py-2 text-center w-20">Qty</th>
            <th className="py-2 text-right w-24">Price</th>
            <th className="py-2 text-right w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((it, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-3 text-gray-800">
                 <div className="font-semibold">{it.name}</div>
                 {it.weight && <div className="text-xs text-gray-500">{it.weight}{it.unit}</div>}
              </td>
              <td className="py-3 text-center text-gray-800">{it.quantity}</td>
              <td className="py-3 text-right text-gray-800">{formatPrice(it.price)}</td>
              <td className="py-3 text-right font-semibold text-gray-800">{formatPrice(it.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(invoice.subtotal)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Discount</span>
              <span>-{formatPrice(invoice.discount)}</span>
            </div>
          )}
          {invoice.tax_amount > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax ({invoice.tax_rate}%)</span>
              <span>+{formatPrice(invoice.tax_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t-2 border-gray-800 mt-2">
            <span>Total</span>
            <span>{formatPrice(invoice.total)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Notes / Terms</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 mt-16 pt-4 border-t border-gray-200">
        <p className="font-bold text-gray-700 mb-1">Thank you for your business!</p>
        <p>Shadrasa India • shadrasa.india@gmail.com • +91 7338542117</p>
      </div>
    </div>
  );
}
