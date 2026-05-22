import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, ShoppingBag, Truck, MessageCircle, Wallet, Banknote } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../lib/CartContext";
import { apiClient, formatApiError, getImageUrl } from "../lib/api";
import { formatPrice } from "../lib/admin";
import { useSiteData } from "../lib/siteData";
import { buildWhatsappFromNumber } from "../lib/siteData";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", desc: "Pay in cash when your order arrives.", icon: Banknote },
  { id: "bank", label: "Bank Transfer / UPI", desc: "We'll share bank details after order confirmation.", icon: Wallet },
  { id: "whatsapp", label: "Confirm via WhatsApp", desc: "We'll WhatsApp you to confirm and arrange payment.", icon: MessageCircle },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { content } = useSiteData();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "Karnataka",
    pincode: "",
    country: "India",
    notes: "",
    payment_method: "cod",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (items.length === 0) {
      // small delay then redirect
      const t = setTimeout(() => navigate("/"), 800);
      return () => clearTimeout(t);
    }
  }, [items.length, navigate]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
      };
      const { data } = await apiClient.post("/orders", payload);
      toast.success(`Order placed! ${data.order_no}`);

      // Build WhatsApp message
      const lines = items.map((i) => `• ${i.name} × ${i.quantity} — ₹${i.price * i.quantity}`).join("\n");
      const text = `Hi Shadrasa! I just placed order *${data.order_no}*\n\n${lines}\n\n*Total: ₹${data.total}*\nPayment: ${form.payment_method.toUpperCase()}\n\nName: ${form.customer_name}\nPhone: ${form.customer_phone}\nAddress: ${form.address_line1}, ${form.city} - ${form.pincode}`;
      const wa = content.whatsapp_number || "917338542117";
      window.open(buildWhatsappFromNumber(wa, text), "_blank");

      clear();
      navigate(`/order-success/${data.order_no}`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
          <ShoppingBag size={48} className="mx-auto text-[#6b3e1f]/40 mb-4" />
          <h1 className="font-display text-3xl font-semibold text-[#0a331e]">Your cart is empty</h1>
          <p className="text-[#6b3e1f] mt-2 mb-6">Add a few jars before checkout.</p>
          <Link to="/" className="inline-block bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-6 py-3 text-sm font-semibold">Back to shop</Link>
        </div>
        <Footer content={content} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]" data-testid="checkout-page">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[#6b3e1f] hover:text-[#0f4d2e] text-sm font-semibold mb-6">
            <ChevronLeft size={16} /> Continue shopping
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <form onSubmit={submit} className="lg:col-span-3 space-y-6">
              <Section title="Customer Details" icon={ShoppingBag}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <F label="Full Name" req>
                    <I required data-testid="co-name" value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} />
                  </F>
                  <F label="Phone" req>
                    <I required type="tel" data-testid="co-phone" value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} />
                  </F>
                  <F label="Email">
                    <I type="email" data-testid="co-email" value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} />
                  </F>
                </div>
              </Section>

              <Section title="Shipping Address" icon={Truck}>
                <div className="space-y-4">
                  <F label="Address Line 1" req>
                    <I required data-testid="co-addr1" value={form.address_line1} onChange={(e) => update("address_line1", e.target.value)} />
                  </F>
                  <F label="Address Line 2 (optional)">
                    <I data-testid="co-addr2" value={form.address_line2} onChange={(e) => update("address_line2", e.target.value)} />
                  </F>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <F label="City" req>
                      <I required data-testid="co-city" value={form.city} onChange={(e) => update("city", e.target.value)} />
                    </F>
                    <F label="State">
                      <I data-testid="co-state" value={form.state} onChange={(e) => update("state", e.target.value)} />
                    </F>
                    <F label="Pincode" req>
                      <I required data-testid="co-pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
                    </F>
                  </div>
                  <F label="Order Notes (optional)">
                    <textarea rows={3} data-testid="co-notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} className="cf-input2" />
                  </F>
                </div>
              </Section>

              <Section title="Payment Method" icon={Wallet}>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.id} data-testid={`pay-${m.id}`} className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${form.payment_method === m.id ? "border-[#0f4d2e] bg-[#0f4d2e]/5" : "border-[#6b3e1f]/15 hover:border-[#0f4d2e]/40"}`}>
                      <input type="radio" name="pay" checked={form.payment_method === m.id} onChange={() => update("payment_method", m.id)} className="mt-1 h-4 w-4 accent-[#0f4d2e]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <m.icon size={16} className="text-[#0f4d2e]" />
                          <span className="font-semibold text-[#0a331e]">{m.label}</span>
                        </div>
                        <p className="text-xs text-[#6b3e1f] mt-1">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] text-[#6b3e1f] mt-3">
                  After placing the order, your details will also open in WhatsApp to confirm with our team instantly.
                </p>
              </Section>

              <button
                type="submit"
                disabled={submitting}
                data-testid="checkout-submit"
                className="w-full bg-[#0f4d2e] hover:bg-[#0a331e] disabled:opacity-60 text-white rounded-full font-semibold transition-all duration-300 px-8 py-4 btn-glow"
              >
                {submitting ? "Placing order..." : `Place Order — ${formatPrice(subtotal)}`}
              </button>
              <style>{`.cf-input2 { width:100%; border-radius:12px; border:1px solid rgba(107,62,31,0.2); padding:10px 14px; font-size:14px; outline:none; background:#fdfbf7; transition:all .2s} .cf-input2:focus { border-color:#0f4d2e; box-shadow:0 0 0 3px rgba(15,77,46,0.12); background:#fff }`}</style>
            </form>

            {/* Summary */}
            <aside className="lg:col-span-2">
              <div className="sticky top-28 rounded-3xl bg-white border border-[#6b3e1f]/10 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="font-display text-xl font-semibold text-[#0a331e] mb-4">Order Summary</h3>
                <ul className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                  {items.map((i) => (
                    <li key={i.product_id} className="flex gap-3 items-center">
                      <img src={getImageUrl(i.image)} alt={i.name} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0a331e] line-clamp-1">
                          {i.name}
                          {i.weight && i.unit && <span className="text-xs text-[#6b3e1f] font-normal ml-1">({i.weight}{i.unit})</span>}
                        </p>
                        <p className="text-xs text-[#6b3e1f]">Qty: {i.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#0a331e]">{formatPrice(i.price * i.quantity)}</p>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 text-sm py-4 border-t border-[#6b3e1f]/10">
                  <Row label="Subtotal" value={formatPrice(subtotal)} />
                  <Row label="Shipping" value="Free" />
                </div>
                <div className="pt-4 border-t border-[#6b3e1f]/10 flex items-center justify-between">
                  <span className="font-display text-lg font-semibold text-[#0a331e]">Total</span>
                  <span className="font-display text-2xl font-bold text-[#0f4d2e]">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer content={content} />
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-3xl bg-white border border-[#6b3e1f]/10 p-6 md:p-8">
      <h2 className="font-display text-xl font-semibold text-[#0a331e] mb-5 flex items-center gap-2">
        <Icon size={18} className="text-[#0f4d2e]" /> {title}
      </h2>
      {children}
    </div>
  );
}

function F({ label, req, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#6b3e1f] mb-2">
        {label} {req && <span className="text-[#d4a017]">*</span>}
      </span>
      {children}
    </label>
  );
}

function I(props) {
  return <input {...props} className="cf-input2" />;
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6b3e1f]">{label}</span>
      <span className="text-[#0a331e] font-semibold">{value}</span>
    </div>
  );
}
